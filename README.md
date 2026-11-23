# 🐾 Pet Aşı Takip

Evcil hayvan sahiplerinin, hayvanlarının aşılarını ve bir sonraki aşı tarihlerini takip edebildiği
bir web uygulaması. Yaklaşan ve geciken aşılar öne çıkarılır, her kullanıcı sadece kendi
hayvanlarını görür.

**Canlı demo:** [pet-vaccine-app.vercel.app](https://pet-vaccine-app.vercel.app) — giriş ekranındaki
"🐾 Demo hesapla dene" butonuyla kayıt olmadan deneyebilirsiniz.

## Özellikler

- E-posta/şifre ile kayıt ve giriş
- **Demo hesapla tek tıkla deneme** — her girişte temiz, örnek verilerle sıfırlanır
- Hayvan ekleme, düzenleme, silme (yaş otomatik hesaplanır)
- Aşı kaydı ekleme, düzenleme, silme
- Aşı durumuna göre renkli etiketler:
  - 🔴 **Gecikmiş** — sonraki tarih geçmiş
  - 🟡 **Yaklaşıyor** — 30 gün içinde
  - 🟢 **Zamanı var** — 30 günden uzak
- Ana ekranda "X gecikmiş, Y yaklaşan aşı" özeti
- Her kullanıcının verisi veritabanı seviyesinde (Row Level Security) izole
- Mobil uyumlu arayüz, işlem bildirimleri (toast)

## Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend | React 19, Vite |
| Yönlendirme | react-router |
| Stil | Bootstrap 5 |
| Backend / Veritabanı / Auth | Supabase (Postgres + Auth + Row Level Security) |
| Deploy | Vercel |

## Veritabanı Şeması

### `pets`
| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | uuid | birincil anahtar |
| `user_id` | uuid | sahibi (`auth.users`), varsayılan `auth.uid()` |
| `name` | text | hayvan adı |
| `species` | text | kedi / köpek / kuş / diğer |
| `birth_date` | date | doğum tarihi (opsiyonel) |
| `created_at` | timestamptz | oluşturulma zamanı |

### `vaccinations`
| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | uuid | birincil anahtar |
| `pet_id` | uuid | hangi hayvana ait (`pets`, cascade silme) |
| `user_id` | uuid | sahibi (`auth.users`), varsayılan `auth.uid()` |
| `vaccine_name` | text | aşı adı |
| `date_given` | date | yapılış tarihi |
| `next_due_date` | date | sonraki tarih (opsiyonel) |
| `notes` | text | not (opsiyonel) |
| `created_at` | timestamptz | oluşturulma zamanı |

Ayrıca demo hesabın verilerini her girişte sıfırlayıp yeniden oluşturan `reset_demo_data()`
adlı bir Postgres fonksiyonu bulunur. Tüm SQL dosyaları `supabase/migrations/` altında tarihçe
olarak durur.

### Row Level Security (RLS)

Her iki tabloda da RLS açıktır. Politikalar, bir kullanıcının sadece `user_id = auth.uid()` olan
satırları görebilmesini/ekleyebilmesini/güncelleyebilmesini/silebilmesini sağlar.
`vaccinations` tablosunda ekleme/güncelleme ayrıca `pet_id`'nin o kullanıcıya ait bir hayvana
işaret ettiğini kontrol eder.

**Neden önemli?** Supabase'in istemci tarafında kullanılan "publishable" anahtarı tarayıcıda
herkese açık görünür — bu bir sır değildir. Veriyi koruyan şey anahtarın gizliliği değil,
veritabanı seviyesinde çalışan RLS kurallarıdır: anahtarı ele geçiren biri bile RLS sayesinde
sadece kendi kullanıcısına ait satırlara erişebilir.

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
  components/             # PetCard, PetForm, VaccineForm, ProtectedRoute, Navbar...
  pages/                  # Login, Register, Dashboard, PetDetail, NotFound
  utils/                  # yaş hesaplama, aşı durumu, tarih formatlama
supabase/
  migrations/             # tablo, RLS ve demo-reset SQL dosyaları
```
