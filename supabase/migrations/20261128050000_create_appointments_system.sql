-- Randevu sistemi: vet_slots (her veterinerin açtığı somut gün/saat satırları)
-- ve appointments (kullanıcının aldığı randevular).
--
-- Çift rezervasyon koruması iki katmanlı:
-- 1) book_appointment() fonksiyonu slotu "for update" ile kilitleyip kontrol
--    ediyor, aynı anda iki istek aynı slotu alamıyor.
-- 2) appointments.slot_id üzerinde kısmi unique index (sadece "onaylandı"
--    durumundaki randevular için) — iptal edilmiş eski kayıtlar aynı slotun
--    tekrar rezerve edilmesini engellemiyor.
--
-- Tüm yazma işlemleri security definer fonksiyonlarla yapılır, bu yüzden
-- appointments/vet_slots için client'tan insert/update/delete politikası yok.

create table public.vet_slots (
  id uuid primary key default gen_random_uuid(),
  vet_id uuid not null references public.vets(id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  is_booked boolean not null default false,
  unique (vet_id, slot_date, start_time)
);

alter table public.vet_slots enable row level security;

create policy "Herkes okuyabilir"
on public.vet_slots
for select
to authenticated
using (true);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  vet_id uuid not null references public.vets(id) on delete cascade,
  slot_id uuid not null references public.vet_slots(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  status text not null default 'onaylandı' check (status in ('onaylandı', 'iptal')),
  created_at timestamptz not null default now()
);

create unique index appointments_aktif_slot_tekil
  on public.appointments (slot_id)
  where status = 'onaylandı';

alter table public.appointments enable row level security;

create policy "Kullanıcı kendi randevularını görebilir"
on public.appointments for select
to authenticated
using (user_id = auth.uid());

create or replace function public.book_appointment(p_slot_id uuid, p_pet_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vet_id uuid;
  v_appointment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Giriş yapılmamış.';
  end if;

  if not exists (select 1 from public.pets where id = p_pet_id and user_id = auth.uid()) then
    raise exception 'Bu hayvan sana ait değil.';
  end if;

  select vet_id into v_vet_id
  from public.vet_slots
  where id = p_slot_id and is_booked = false
  for update;

  if v_vet_id is null then
    raise exception 'Bu saat artık müsait değil.';
  end if;

  update public.vet_slots set is_booked = true where id = p_slot_id;

  insert into public.appointments (vet_id, slot_id, pet_id, user_id, status)
  values (v_vet_id, p_slot_id, p_pet_id, auth.uid(), 'onaylandı')
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

grant execute on function public.book_appointment(uuid, uuid) to authenticated;

create or replace function public.cancel_appointment(p_appointment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot_id uuid;
begin
  update public.appointments
  set status = 'iptal'
  where id = p_appointment_id and user_id = auth.uid() and status = 'onaylandı'
  returning slot_id into v_slot_id;

  if v_slot_id is null then
    raise exception 'Randevu bulunamadı veya zaten iptal edilmiş.';
  end if;

  update public.vet_slots set is_booked = false where id = v_slot_id;
end;
$$;

grant execute on function public.cancel_appointment(uuid) to authenticated;

alter publication supabase_realtime add table public.vet_slots, public.appointments;
alter table public.vet_slots replica identity full;
alter table public.appointments replica identity full;
