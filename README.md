# 🐾 e-Pet

Evcil hayvan sahipleri için, hayvanlarının aşı takibinden randevu almaya kadar her şeyi tek yerden
yönetebildiği bir web uygulaması — insanlar için e-Nabız ne ise, hayvanlar için e-Pet o.

**Canlı demo:** [e-pet-tgb11.vercel.app](https://e-pet-tgb11.vercel.app) — giriş ekranındaki
"🐾 Demo hesapla dene" butonuyla kayıt olmadan deneyebilirsiniz.

## Özellikler

- E-posta/şifre ile kayıt ve giriş
- **Demo hesapla tek tıkla deneme** — her girişte temiz, örnek verilerle sıfırlanır
- Hayvan ekleme, düzenleme, silme (yaş otomatik hesaplanır)
- **Aşılar:** ekleme/düzenleme/silme, türe göre önerilen sonraki tarih otomatik doldurulur
  (kedi/köpek için tüm yaygın aşılar, kuş için iç/dış parazit)
- Aşı durumuna göre renkli etiketler:
  - 🔴 **Gecikmiş** — sonraki tarih geçmiş
  - 🟡 **Yaklaşıyor** — 30 gün içinde
  - 🟢 **Zamanı var** — 30 günden uzak
- **Veteriner ziyaret geçmişi:** gidiş sebebi, yapılan işlem ve veteriner önerisi kaydı
- **Anlaşmalı veterinerler:** klinik/veteriner listesi, uygun gün/saat seçip randevu alma, randevu iptali
- **Profil ayarları:** ad soyad ve şifre değiştirme, hesabı kalıcı olarak silme
- **Gerçek zamanlı senkronizasyon:** aynı hesapla açılan iki sekme/cihaz birbirini anlık görür
- Ana ekranda "X gecikmiş, Y yaklaşan aşı" özeti
- Her kullanıcının verisi veritabanı seviyesinde (Row Level Security) izole
- Mobil uyumlu arayüz, işlem bildirimleri (toast)

## Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend | React 19, Vite |
| Yönlendirme | react-router |
| Stil | Bootstrap 5 |
| Backend / Veritabanı / Auth / Realtime | Supabase (Postgres + Auth + Row Level Security + Realtime) |
| Deploy | Vercel |

## Veritabanı Şeması

### Kullanıcı verisi (RLS: `user_id = auth.uid()`)

| Tablo | Açıklama |
|---|---|
| `pets` | Kullanıcının hayvanları (ad, tür, doğum tarihi) |
| `vaccinations` | Aşı kayıtları (`pets`'e bağlı, cascade silme) |
| `vet_visits` | Veteriner ziyaretleri — gidiş sebebi, yapılan işlem, öneri (`pets`'e bağlı) |
| `appointments` | Alınan randevular — durum: `onaylandı` / `iptal` |

### Referans veri (RLS: herkes okuyabilir, sadece migration ile yazılır)

| Tablo | Açıklama |
|---|---|
| `vaccine_guidelines` | Türe göre önerilen aşı tekrar aralığı (ay) |
| `vets` | Anlaşmalı veteriner/klinik listesi |
| `vet_slots` | Her veterinerin müsait gün/saat slotları |

### Önemli fonksiyonlar (`security definer`)

| Fonksiyon | Ne yapar |
|---|---|
| `reset_demo_data()` | Demo hesabın verilerini (hayvan, aşı, randevu) her girişte sıfırlar |
| `delete_own_account()` | Kullanıcının kendi hesabını silmesini sağlar (`auth.users` client'tan silinemediği için) |
| `book_appointment(slot_id, pet_id)` | Bir slotu kilitleyip (`for update`) atomik şekilde randevuya çevirir — çift rezervasyonu engeller |
| `cancel_appointment(id)` | Randevuyu iptal edip slotu tekrar müsait yapar |

Tüm SQL dosyaları `supabase/migrations/` altında tarihçe olarak durur.

### Row Level Security (RLS)

Kullanıcı verisi tablolarında, bir kullanıcının sadece `user_id = auth.uid()` olan satırları
görebilmesini/ekleyebilmesini/güncelleyebilmesini/silebilmesini sağlayan politikalar var.
Referans veri tablolarında (`vaccine_guidelines`, `vets`, `vet_slots`) ise herkes okuyabilir ama
hiç kimse client'tan yazamaz — veri sadece migration ile elle eklenir.

**Neden önemli?** Supabase'in istemci tarafında kullanılan "publishable" anahtarı tarayıcıda
herkese açık görünür — bu bir sır değildir. Veriyi koruyan şey anahtarın gizliliği değil,
veritabanı seviyesinde çalışan RLS kurallarıdır: anahtarı ele geçiren biri bile RLS sayesinde
sadece kendi kullanıcısına ait satırlara erişebilir.

### Realtime

`pets`, `vaccinations`, `vet_visits`, `vet_slots` ve `appointments` tabloları Supabase Realtime'a
açık. Aynı hesapla açılan farklı sekme/cihazlar, birinde yapılan değişikliği sayfa yenilemeden
anında görür.

## Yerelde Çalıştırma

```bash
npm install
cp .env.example .env.local   # Supabase URL ve publishable anahtarını doldurun
npm run dev
```

Diğer komutlar:

```bash
npm run build     # production build (dist/)
npm run preview   # build'i yerelde test et
```

## Proje Yapısı

```
src/
  lib/supabase.js        # Supabase client
  context/                # AuthContext, ToastContext
  hooks/                  # usePet (hayvan bilgisi + realtime)
  components/             # PetCard, PetForm, VaccineForm, VisitForm, Navbar, ConfirmModal...
  pages/                  # Login, Register, Dashboard, PetDetail, PetVaccinations, PetVisits,
                          # Vets, BookAppointment, MyAppointments, Profile, NotFound
  utils/                  # yaş hesaplama, aşı durumu, tarih formatlama
supabase/
  migrations/             # tablo, RLS, fonksiyon ve demo-reset SQL dosyaları
```

## Yol Haritası

Tüm fazlar ve görevler [`PLAN.md`](PLAN.md) dosyasında — tamamlananlar işaretli, "Sonra" bölümünde
planlanan ama henüz yapılmamış fikirler listeli.
