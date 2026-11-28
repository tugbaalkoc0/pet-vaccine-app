-- Anlaşmalı veteriner/klinik listesi. vaccine_guidelines ile aynı desen:
-- bu kullanıcı verisi değil, referans veri — herkes okuyabilir, kimse
-- client'tan yazamaz (insert/update/delete için politika yok). Veri burada
-- örnek/demo amaçlı anlaşmalı klinik bilgisidir, gerçek işletme değildir.

create table public.vets (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  vet_name text,
  address text,
  phone text,
  specialty text,
  note text,
  created_at timestamptz not null default now()
);

alter table public.vets enable row level security;

create policy "Herkes okuyabilir"
on public.vets
for select
to authenticated
using (true);

insert into public.vets (clinic_name, vet_name, address, phone, specialty, note) values
  ('Patiler Veteriner Kliniği', 'Dr. Ayşe Yıldız', 'Bahçelievler Mah. Gül Sok. No:12, İstanbul', '0212 555 01 01', 'Genel muayene ve cerrahi', null),
  ('Dost Pati Veteriner Merkezi', 'Dr. Mehmet Kaya', 'Çankaya Mah. Atatürk Cad. No:45, Ankara', '0312 555 02 02', 'İç hastalıklar', null),
  ('Minik Dostlar Veteriner Kliniği', 'Dr. Elif Demir', 'Konak Mah. Cumhuriyet Bul. No:7, İzmir', '0232 555 03 03', 'Egzotik hayvanlar ve kuşlar', 'Randevu için en az 1 gün önceden aranması tavsiye edilir.');
