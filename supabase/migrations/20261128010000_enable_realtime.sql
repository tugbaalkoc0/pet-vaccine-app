-- Aynı hesapla açılan iki sekme/cihaz birbirini anlık görebilsin diye
-- pets ve vaccinations tablolarındaki değişiklikleri Realtime'a (Postgres
-- replication üzerinden WebSocket yayını) açıyoruz. RLS kuralları burada da
-- geçerli: her kullanıcı sadece kendi satırlarındaki değişiklikleri alır.

alter publication supabase_realtime add table public.pets, public.vaccinations;
