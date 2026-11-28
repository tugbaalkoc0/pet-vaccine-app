-- Aşı eklerken türe göre "önerilen sonraki tarih" otomatik doldurulabilsin diye
-- referans veri tablosu. Bu kullanıcı verisi değil — herkes aynı veriyi okur,
-- kimse client'tan yazamaz (insert/update/delete için politika yok, bu yüzden
-- RLS varsayılan olarak reddeder). Veri genel veteriner kılavuzlarına dayanan
-- yaklaşık değerlerdir, kesin tıbbi tavsiye değildir.

create table public.vaccine_guidelines (
  id uuid primary key default gen_random_uuid(),
  species text not null,
  vaccine_name text not null,
  booster_interval_months integer not null,
  note text
);

alter table public.vaccine_guidelines enable row level security;

create policy "Herkes okuyabilir"
on public.vaccine_guidelines
for select
to authenticated
using (true);

insert into public.vaccine_guidelines (species, vaccine_name, booster_interval_months, note) values
  ('kedi', 'Kuduz', 12, null),
  ('kedi', 'Karma', 12, null),
  ('kedi', 'İç parazit', 3, null),
  ('kedi', 'Dış parazit', 1, 'Ürüne göre değişebilir.'),
  ('kedi', 'Lösemi (FeLV)', 12, null),
  ('köpek', 'Kuduz', 12, null),
  ('köpek', 'Karma', 12, null),
  ('köpek', 'İç parazit', 3, null),
  ('köpek', 'Dış parazit', 1, 'Ürüne göre değişebilir.'),
  ('köpek', 'Bronşin', 12, null),
  ('kuş', 'İç parazit', 3, null),
  ('kuş', 'Dış parazit', 3, 'Ürüne göre değişebilir.');
