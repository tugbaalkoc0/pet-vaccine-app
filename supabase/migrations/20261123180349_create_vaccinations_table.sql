create table public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  vaccine_name text not null,
  date_given date not null,
  next_due_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.vaccinations enable row level security;

create policy "Kullanıcı kendi aşı kayıtlarını görebilir"
  on public.vaccinations for select
  to authenticated
  using (user_id = auth.uid());

create policy "Kullanıcı kendi hayvanına aşı ekleyebilir"
  on public.vaccinations for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = pet_id and pets.user_id = auth.uid()
    )
  );

create policy "Kullanıcı kendi aşı kaydını güncelleyebilir"
  on public.vaccinations for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = pet_id and pets.user_id = auth.uid()
    )
  );

create policy "Kullanıcı kendi aşı kaydını silebilir"
  on public.vaccinations for delete
  to authenticated
  using (user_id = auth.uid());
