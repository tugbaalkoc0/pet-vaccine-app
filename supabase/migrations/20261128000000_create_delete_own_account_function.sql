-- Kullanıcı profil sayfasından kendi hesabını tamamen silebilsin diye.
-- auth.users'a client'tan doğrudan yazma/silme izni yok (service_role gerektirir),
-- bu yüzden reset_demo_data() ile aynı desen: security definer fonksiyon sadece
-- auth.uid()'i siler, parametre alınmaz ki başka bir kullanıcı silinemesin.
-- auth.users silinince pets/vaccinations de on delete cascade ile otomatik silinir.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  demo_user_id uuid := 'd5e6439c-6ffe-4381-8dfd-9112f381603d';
begin
  if auth.uid() is null then
    raise exception 'Giriş yapılmamış.';
  end if;

  if auth.uid() = demo_user_id then
    raise exception 'Demo hesabı silinemez.';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
