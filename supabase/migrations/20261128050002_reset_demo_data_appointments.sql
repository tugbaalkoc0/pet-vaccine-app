-- reset_demo_data() artık demo hesabının aldığı randevuları da temizliyor:
-- hayvanlar silinmeden önce, demo hesabının rezerve ettiği slotlar tekrar
-- boşaltılıyor (is_booked = false). Hayvanlar silinince appointments ve
-- vet_visits zaten cascade ile otomatik siliniyor (pet_id on delete cascade).

create or replace function public.reset_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  demo_user_id uuid := 'd5e6439c-6ffe-4381-8dfd-9112f381603d';
  boncuk_id uuid := gen_random_uuid();
  comar_id uuid := gen_random_uuid();
  sari_id uuid := gen_random_uuid();
begin
  if auth.uid() is distinct from demo_user_id then
    raise exception 'Bu fonksiyon sadece demo hesabı tarafından çağrılabilir.';
  end if;

  update public.vet_slots
  set is_booked = false
  where id in (
    select slot_id from public.appointments
    where user_id = demo_user_id and status = 'onaylandı'
  );

  delete from public.pets where user_id = demo_user_id;

  insert into public.pets (id, user_id, name, species, birth_date) values
    (boncuk_id, demo_user_id, 'Boncuk', 'kedi', (now() - interval '2 years')::date),
    (comar_id, demo_user_id, 'Çomar', 'köpek', (now() - interval '4 years')::date),
    (sari_id, demo_user_id, 'Sarı', 'kuş', (now() - interval '1 year')::date);

  insert into public.vaccinations (pet_id, user_id, vaccine_name, date_given, next_due_date, notes) values
    (boncuk_id, demo_user_id, 'Kuduz', (now() - interval '1 year')::date, (now() - interval '10 days')::date, null),
    (boncuk_id, demo_user_id, 'Karma', (now() - interval '11 months')::date, (now() + interval '15 days')::date, null),
    (comar_id, demo_user_id, 'İç Parazit', (now() - interval '2 months')::date, (now() - interval '5 days')::date, null),
    (comar_id, demo_user_id, 'Kuduz', (now() - interval '6 months')::date, (now() + interval '6 months')::date, 'Yıllık tekrar'),
    (sari_id, demo_user_id, 'Dış Parazit', (now() - interval '1 month')::date, (now() + interval '45 days')::date, null);
end;
$$;

grant execute on function public.reset_demo_data() to authenticated;
