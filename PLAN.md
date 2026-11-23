# PLAN.md — Pet Vaccine App Yol Haritası

Her faz sonunda uygulama çalışır durumda olmalı. Fazları sırayla yap, birini bitirmeden diğerine geçme.
Biten görevleri `- [x]` olarak işaretle.

---

## Mevcut durum (başlangıç)
- React 19 + Vite, Vite'ın SSR şablonuyla kurulmuş (`server.js`, `entry-server.jsx`, Express).
- Tek bileşen: `src/Components/VaccineApp.jsx`. Ekle/sil/güncelle var ama veriler sadece `useState`'te,
  sayfa yenilenince kayboluyor.
- Güncelleme `prompt()` ile yapılıyor, sadece aşı adı değişiyor.
- Kullanılmayan şeyler: Tailwind, postcss, autoprefixer, `App.css`. `index.css` Vite şablon stilleri Bootstrap'la çakışıyor.
- Başlık "Vite + React", README boş.

---

## Faz 1 — Temizlik ve SSR'ı kaldırma
**Amaç:** Projeyi sade bir Vite + React SPA'ya çevirmek. Özellik eklenmez, mevcut ekran aynen çalışmaya devam eder.

- [x] `server.js` ve `src/entry-server.jsx` silinsin
- [x] `src/entry-client.jsx` → `src/main.jsx` (`hydrateRoot` yerine `createRoot`)
- [x] `index.html`: script yolu `main.jsx`, `<!--app-head-->` / `<!--app-html-->` yorumları kaldırılsın,
      `lang="tr"`, başlık "Pet Aşı Takip"
- [x] `package.json` scriptleri: `dev: vite`, `build: vite build`, `preview: vite preview`
- [x] Kaldırılacak paketler: `express`, `compression`, `sirv`, `cross-env`, `tailwindcss`, `postcss`, `autoprefixer`
- [x] `src/App.css` silinsin; `src/index.css` Bootstrap'la çakışmayacak şekilde sadeleştirilsin
- [x] `src/Components` → `src/components` (küçük harf)
- [x] `.gitignore`'a `.env*` eklensin (`!.env.example` hariç)

**Bitti sayılır:** `npm run dev` açılıyor, kayıt ekle/sil çalışıyor, `npm run build` hatasız.

---

## Faz 2 — Supabase kurulumu ve veritabanı
**Amaç:** Veritabanı tabloları ve güvenlik kuralları hazır olsun.

- [x] Supabase'de yeni proje: `pet-vaccine-app` (bölge: eu-central-1)
- [x] Tablo `pets`:
  - `id uuid primary key default gen_random_uuid()`
  - `user_id uuid not null default auth.uid() references auth.users on delete cascade`
  - `name text not null`
  - `species text` (kedi, köpek, kuş, diğer...)
  - `birth_date date`
  - `created_at timestamptz default now()`
- [x] Tablo `vaccinations`:
  - `id uuid primary key default gen_random_uuid()`
  - `pet_id uuid not null references pets(id) on delete cascade`
  - `user_id uuid not null default auth.uid() references auth.users on delete cascade`
  - `vaccine_name text not null`
  - `date_given date not null`
  - `next_due_date date`
  - `notes text`
  - `created_at timestamptz default now()`
- [x] İki tabloda da **RLS açık**. Politikalar: kullanıcı sadece `user_id = auth.uid()` olan satırları
      görebilir / ekleyebilir / güncelleyebilir / silebilir
- [x] `vaccinations` insert/update kuralı ek olarak `pet_id`'nin de o kullanıcıya ait olduğunu kontrol etsin
- [x] SQL'ler `supabase/migrations/` altında dosya olarak dursun
- [x] `@supabase/supabase-js` kurulsun, `src/lib/supabase.js` oluşturulsun
- [x] `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (sadece publishable/anon anahtar)
- [x] `.env.example` aynı isimlerle, değerler boş

**Bitti sayılır:** Tablolar Supabase panelinde görünüyor, RLS açık, Security Advisor uyarı vermiyor.

**Öğrenme notu:** RLS neden gerekli? Publishable anahtar herkesin tarayıcısında görünür. Veriyi koruyan
şey anahtarın gizliliği değil, RLS kurallarıdır.

---

## Faz 3 — Giriş sistemi (Auth)
**Amaç:** Kullanıcı kayıt olup giriş yapabilsin. Giriş yapmayan ana ekrana giremesin.

- [x] `react-router` kurulsun. Sayfalar: `/giris`, `/kayit`, `/` (ana ekran), `*` (404)
- [x] `AuthContext`: oturum bilgisini tutar, `onAuthStateChange` ile dinler
- [x] `ProtectedRoute`: oturum yoksa `/giris`'e yönlendirir
- [x] Kayıt sayfası: e-posta + şifre (+ şifre tekrar), hata mesajları Türkçe
- [x] Giriş sayfası: e-posta + şifre, "Hesabın yok mu? Kayıt ol" linki
- [x] Üst menüde (navbar) kullanıcı e-postası ve "Çıkış yap" butonu
- [x] Karar: e-posta onayı açık mı kapalı mı? → **Kapalı** (Supabase Dashboard → Authentication → Sign In/Providers →
      User Signups → "Confirm email" kapatıldı). Kayıt olan kullanıcı anında giriş yapabiliyor.

**Bitti sayılır:** Kayıt ol, çıkış yap, tekrar giriş yap çalışıyor. Sayfa yenilenince oturum korunuyor.

---

## Faz 4 — Hayvanlar
**Amaç:** Kullanıcı kendi hayvanlarını yönetebilsin.

- [x] Ana ekranda hayvan kartları (ad, tür, yaş)
- [x] Hayvan ekleme formu (modal ya da ayrı form)
- [x] Hayvan düzenleme ve silme (silmeden önce onay sorusu, aşıları da silineceği belirtilsin)
- [x] Hayvan detay sayfası: `/hayvan/:id`
- [x] Yükleniyor ve hata durumları, hiç hayvan yoksa "İlk hayvanını ekle" boş ekranı

**Bitti sayılır:** İki farklı hesapla giriş yapınca herkes sadece kendi hayvanlarını görüyor.

---

## Faz 5 — Aşılar ve asıl özellik
**Amaç:** Aşı kayıtları ve yaklaşan/geciken aşı takibi.

- [x] Hayvan detay sayfasında aşı listesi (tarihe göre sıralı)
- [x] Aşı ekleme formu: aşı adı, yapılış tarihi, sonraki tarih, not
- [x] Aşı düzenleme `prompt()` ile değil, aynı form ile yapılsın
- [x] Aşı silme (onaylı)
- [x] `utils/vaccineStatus.js`: sonraki tarihe göre durum hesapla
  - **Gecikmiş:** tarih geçmiş → kırmızı
  - **Yaklaşıyor:** 30 gün içinde → sarı
  - **Zamanı var:** → yeşil
  - Sonraki tarih yoksa → gri
- [x] Ana ekranın üstünde özet: "X gecikmiş, Y yaklaşan aşı" + listesi
- [x] Tarihler Türkçe formatta (`23 Kasım 2026`)
- [x] Sık kullanılan aşılar için öneri listesi (Kuduz, Karma, İç/dış parazit...) — `datalist` ile

**Bitti sayılır:** Geçmiş tarihli bir aşı kırmızı, 2 hafta sonraki sarı görünüyor.

---

## Faz 6 — Arayüz cilası
**Amaç:** Uygulama "öğrenci projesi" gibi değil, düzgün bir ürün gibi görünsün.

- [x] Mobil uyumlu (telefonda kontrol et)
- [x] Form doğrulama: boş alan, gelecekte yapılmış aşı tarihi, sonraki tarihin yapılış tarihinden önce olması
- [x] Butonlarda yükleniyor durumu (çift tıklamayı engelle)
- [x] Başarılı/başarısız işlemler için küçük bildirim (toast)
- [x] Favicon ve uygulama adı/logo
- [x] Konsolda hata/uyarı kalmasın

---

## Faz 7 — Demo hesap ve README
**Amaç:** CV'deki linke tıklayan kişi tek tıkla deneyebilsin, repoya bakan kişi projeyi anlasın.

- [ ] Demo kullanıcı oluştur, örnek veri ekle (2-3 hayvan, gecikmiş + yaklaşan + zamanı olan aşılar)
- [ ] Giriş sayfasında "Demo hesapla dene" butonu
- [ ] Karar: demo verisi ziyaretçiler tarafından bozulabilir. Çözüm seç: (a) periyodik sıfırlama SQL fonksiyonu,
      (b) demo kullanıcı için sadece okuma yetkisi
- [ ] README: proje açıklaması, ekran görüntüleri, canlı link, kullanılan teknolojiler, özellikler,
      yerelde çalıştırma adımları, veritabanı şeması, RLS açıklaması

---

## Faz 8 — Deploy
**Amaç:** Uygulama canlı ve kalıcı olarak erişilebilir olsun.

- [ ] Vercel'de GitHub reposundan proje oluştur (framework: Vite)
- [ ] Vercel ortam değişkenleri: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] SPA yönlendirmesi için `vercel.json` rewrite (sayfa yenilenince 404 olmasın)
- [ ] Supabase → Authentication → URL Configuration: Site URL ve Redirect URL'lere Vercel adresi eklensin
- [ ] Canlı sitede uçtan uca test: kayıt, giriş, hayvan/aşı ekleme, demo hesap, mobil
- [ ] Supabase Free projeler 1 hafta hareketsiz kalınca duraklatılıyor: haftada bir veritabanına küçük
      bir istek atan GitHub Actions cron görevi ekle
- [ ] README'ye canlı link, GitHub repo açıklamasına (About) link ekle

**Bitti sayılır:** Başka bir cihazdan canlı linke girip demo hesapla her şey çalışıyor.

---

## Sonra (isteğe bağlı)
- E-posta ile aşı hatırlatma (Supabase Edge Function + zamanlanmış görev)
- Hayvan fotoğrafı (Supabase Storage)
- Google ile giriş
- Aşı geçmişini PDF olarak indirme
- Testler (Vitest + React Testing Library)
