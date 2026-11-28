-- Her anlaşmalı veteriner için önümüzdeki ~20 takvim günündeki hafta içi
-- günlerde, günde 6 sabit saatte müsait slot üretir. Bu statik bir örnek veri —
-- gerçek bir uygulamada slotlar periyodik olarak (örn. haftalık bir cron ile)
-- otomatik üretilir, bu proje kapsamında elle bir kerelik oluşturuluyor.

insert into public.vet_slots (vet_id, slot_date, start_time)
select v.id, d::date, t.start_time
from public.vets v
cross join generate_series(current_date, current_date + interval '20 days', interval '1 day') as d
cross join (
  values ('09:00'::time), ('10:00'::time), ('11:00'::time),
         ('14:00'::time), ('15:00'::time), ('16:00'::time)
) as t(start_time)
where extract(isodow from d) < 6
on conflict (vet_id, slot_date, start_time) do nothing;
