-- Realtime'da DELETE olayları varsayılan olarak sadece silinen satırın id'sini
-- gönderir; user_id/pet_id'ye göre filtreleme (RLS'in Realtime karşılığı) bu
-- yüzden DELETE'lerde çalışmaz. REPLICA IDENTITY FULL ile silinen satırın tüm
-- sütunları event'e eklenir, filtreler DELETE'te de doğru çalışır.

alter table public.pets replica identity full;
alter table public.vaccinations replica identity full;
