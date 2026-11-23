create table public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  species text,
  birth_date date,
  created_at timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "Kullanıcı kendi hayvanlarını görebilir"
  on public.pets for select
  to authenticated
  using (user_id = auth.uid());

create policy "Kullanıcı kendi hayvanını ekleyebilir"
  on public.pets for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Kullanıcı kendi hayvanını güncelleyebilir"
  on public.pets for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Kullanıcı kendi hayvanını silebilir"
  on public.pets for delete
  to authenticated
  using (user_id = auth.uid());
