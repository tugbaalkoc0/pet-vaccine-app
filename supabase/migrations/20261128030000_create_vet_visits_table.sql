-- Aşı dışındaki veteriner ziyaretlerinin (gidiş sebebi, yapılan işlem, öneri)
-- kaydını tutar. RLS deseni vaccinations tablosuyla birebir aynı.

create table public.vet_visits (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  visit_date date not null,
  vet_name text,
  reason text not null,
  procedure_notes text,
  recommendation text,
  created_at timestamptz not null default now()
);

alter table public.vet_visits enable row level security;

create policy "Kullanıcı kendi ziyaret kayıtlarını görebilir"
  on public.vet_visits for select
  to authenticated
  using (user_id = auth.uid());

create policy "Kullanıcı kendi hayvanına ziyaret ekleyebilir"
  on public.vet_visits for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = pet_id and pets.user_id = auth.uid()
    )
  );

create policy "Kullanıcı kendi ziyaret kaydını güncelleyebilir"
  on public.vet_visits for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = pet_id and pets.user_id = auth.uid()
    )
  );

create policy "Kullanıcı kendi ziyaret kaydını silebilir"
  on public.vet_visits for delete
  to authenticated
  using (user_id = auth.uid());

-- Faz 10'daki Realtime düzenine dahil edilir, aynı DELETE/filtre sorunu
-- yaşanmasın diye REPLICA IDENTITY FULL baştan açılır.
alter publication supabase_realtime add table public.vet_visits;
alter table public.vet_visits replica identity full;
