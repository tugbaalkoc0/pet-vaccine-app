# PLAN.md — e-Pet Yol Haritası

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

- [x] Demo kullanıcı oluştur, örnek veri ekle (2-3 hayvan, gecikmiş + yaklaşan + zamanı olan aşılar)
- [x] Giriş sayfasında "Demo hesapla dene" butonu
- [x] Karar: demo verisi ziyaretçiler tarafından bozulabilir. **Seçilen çözüm:** demo hesabıyla her
      girişte `reset_demo_data()` Postgres fonksiyonu çağrılır, mevcut veriler silinip aynı 3 hayvan/
      5 aşı örneği (tarihler "şu an"a göre bağıl) yeniden oluşturulur. Cron/Edge Function gerekmiyor.
- [x] README: proje açıklaması, kullanılan teknolojiler, özellikler, yerelde çalıştırma adımları,
      veritabanı şeması, RLS açıklaması (ekran görüntüleri ve canlı link Faz 8'de eklenecek)

---

## Faz 8 — Deploy
**Amaç:** Uygulama canlı ve kalıcı olarak erişilebilir olsun.

- [x] Vercel'de GitHub reposundan proje oluştur (framework: Vite)
- [x] Vercel ortam değişkenleri: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- [x] SPA yönlendirmesi için `vercel.json` rewrite (sayfa yenilenince 404 olmasın)
- [x] Supabase → Authentication → URL Configuration: Site URL ve Redirect URL'lere Vercel adresi eklensin
- [x] Canlı sitede uçtan uca test: kayıt, giriş, hayvan/aşı ekleme, demo hesap, mobil
- [x] Supabase Free projeler 1 hafta hareketsiz kalınca duraklatılıyor: haftada bir veritabanına küçük
      bir istek atan GitHub Actions cron görevi ekle
- [x] README'ye canlı link, GitHub repo açıklamasına (About) link ekle
- [x] Ek güvenlik: Supabase Authentication → Rate Limits'te kayıt/giriş saatlik hız sınırı düşürüldü
      (ücretsiz plan kota aşımına karşı)

**Bitti sayılır:** Başka bir cihazdan canlı linke girip demo hesapla her şey çalışıyor.

---

## Faz 9 — Profil ayarları
**Amaç:** Kullanıcı kendi hesap bilgilerini (isim, şifre) yönetebilsin.

- [x] Navbar'da kullanıcı adı/e-posta yanına dropdown menü
- [x] `/profil` sayfası: isim değiştirme formu
- [x] Şifre değiştirme formu (yeni şifre + tekrar)
- [x] Form doğrulama, başarı/hata bildirimleri (mevcut toast sistemi kullanılsın)
- [x] Navbar'da isim girilmişse e-posta yerine isim gösterilsin
- [x] Demo hesabında profil formları devre dışı (ortak demo hesabının bozulmaması için)
- [x] "Tehlikeli alan": hesabı tamamen silme (`delete_own_account()` security definer fonksiyonu,
      `auth.users` silinince `pets`/`vaccinations` cascade ile otomatik silinir, demo hesap hem
      arayüzde hem fonksiyon içinde engellenir)
- [x] Düzeltme: `/profil` sayfasında ana sayfaya dönüş linki eksikti, eklendi

**Bitti sayılır:** İsim değiştirilip sayfa yenilenince kalıyor, şifre değiştirip çıkış-giriş yeni şifreyle çalışıyor.

**Öğrenme notu:** İsim gibi ek alanlar Supabase Auth'un `user_metadata` alanında tutulacak, ayrı bir
`profiles` tablosu açmayacağız — ileride profil fotoğrafı gibi şeyler gerekirse o zaman tabloya geçeriz.

---

## Faz 10 — Gerçek zamanlı senkronizasyon
**Amaç:** Aynı hesapla iki sekme/cihaz açıkken biri değişiklik yapınca diğeri de anında görsün.

- [x] Supabase'de `pets` ve `vaccinations` tablolarında Realtime açıldı (`supabase_realtime` publication)
- [x] Her iki tabloda `REPLICA IDENTITY FULL` açıldı (aksi halde DELETE olayları `user_id`/`pet_id`
      filtresiyle eşleşmiyor, event hiç gelmiyor)
- [x] Dashboard: kullanıcıya özel kanal, `pets`/`vaccinations` değişince mevcut fetch fonksiyonları
      tekrar çağrılıyor (manuel state patch yerine — bu ölçekte yeterince hızlı ve çok daha basit)
- [x] Hayvan detay sayfası: o hayvana özel kanal, `pets` değişirse state güncellenir/silinirse
      uyarı gösterilir, `vaccinations` değişince liste tekrar çekilir
- [x] Sayfa değişince abonelik `removeChannel` ile temizleniyor
- [x] İki sekmede test edildi: hayvan ekleme/silme ve aşı ekleme/silme, ikisi de anında senkronize

**Bitti sayılır:** Aynı hesapla açılan iki sekmeden birinde hayvan/aşı eklenince diğeri sayfa
yenilemeden güncelleniyor.

**Öğrenme notu:** Realtime, Postgres'teki değişiklikleri bir WebSocket üzerinden anlık yayınlayan bir
Supabase özelliği. RLS kuralları Realtime'da da geçerli — kullanıcı sadece kendi satırlarındaki
değişiklikleri alabiliyor. Ücretsiz plana dahil, ek maliyet yok.

---

## Faz 11 — Türe göre tavsiye edilen aşı aralığı
**Amaç:** Aşı eklerken türe ve aşıya göre önerilen sonraki tarih otomatik önerilsin.

- [x] Tablo `vaccine_guidelines`: `species`, `vaccine_name`, `booster_interval_months`, `note`
- [x] RLS: giriş yapmış herkes SELECT yapabilsin; INSERT/UPDATE/DELETE için politika yok (sadece migration ile elle dolduruldu)
- [x] Referans veri: kedi ve köpek için tüm mevcut aşı adları, kuş için sadece iç/dış parazit
      (Kuduz/Karma/Lösemi gibi memeli aşıları kuşa biyolojik olarak uygulanmadığı için eklenmedi),
      "diğer" türü için veri yok (tanımsız tür, elle giriş devam ediyor)
- [x] Aşı ekleme formunda: tür + aşı adı + yapılış tarihi girilince "sonraki tarih" boşsa otomatik
      dolduruluyor (sadece yeni kayıt eklerken, düzenlemede mevcut tarih ezilmiyor), kullanıcı isterse değiştirebiliyor
- [x] Görünür uyarı: "Genel referanstır, kesin karar için veterinerine danış."

**Bitti sayılır:** Köpek türündeki bir hayvana "Kuduz" aşısı eklenince sonraki tarih otomatik öneriliyor.

**Öğrenme notu:** Bu tablo kullanıcı verisi değil, referans veri — RLS "sadece okunabilir" şeklinde
kurulacak, kullanıcıya özel satır filtresi (`user_id = auth.uid()`) burada geçerli değil.

---

## Faz 12 — Veteriner ziyaret geçmişi ve öneri kısmı
**Amaç:** Aşı dışındaki veteriner ziyaretlerinin ve önerilerin kaydı tutulsun ("e-Nabız" hissi).

- [x] Tablo `vet_visits`: `pet_id`, `user_id`, `visit_date`, `vet_name`, `reason`, `procedure_notes`,
      `recommendation`, `created_at`
- [x] RLS: `vaccinations` ile aynı desen (`user_id = auth.uid()` + `pet_id`'nin kullanıcıya ait olduğu kontrolü)
- [x] Karar: hayvan sayfası yapısı değişti — `/hayvan/:id` artık sadece özet (ad/tür/yaş + iki büyük
      buton), `/hayvan/:id/asilar` ve `/hayvan/:id/ziyaretler` ayrı sayfalar oldu. Aşı/ziyaret geçmişi
      tek bir kronolojik listede birleştirilmedi — kullanıcı tercihiyle ayrı sayfalar seçildi
- [x] `src/hooks/usePet.js`: hayvan bilgisini çeken ve realtime ile dinleyen ortak hook (üç sayfada da kullanılıyor)
- [x] Ziyaret ekleme/düzenleme/silme formu (`VisitForm`, `VisitCard`), Realtime'a dahil edildi
- [x] Dashboard'daki gecikmiş/yaklaşan aşı linkleri doğrudan `/asilar` alt sayfasına gidecek şekilde güncellendi

**Bitti sayılır:** Bir hayvana ziyaret kaydı eklenip, sebep ve yapılan işlemle birlikte listede görünüyor.

---

## Faz 13a — Anlaşmalı veteriner listesi
**Amaç:** Anlaşmalı veterinerlerin/kliniklerin görüntülenebildiği bir sayfa olsun (henüz randevu yok).

- [x] Tablo `vets`: klinik adı, veteriner adı, adres, telefon, uzmanlık alanı, kısa not —
      `vaccine_guidelines` ile aynı desen: referans veri, RLS "sadece okunabilir"
      (admin verisi migration ile elle doldurulacak, gerçek değil örnek/demo klinik bilgisi)
- [x] Örnek veri: 3 anlaşmalı klinik/veteriner migration'da eklendi
- [x] `/veterinerler` sayfası: kart listesi (klinik adı, veteriner, adres, telefon, uzmanlık)
- [x] Navbar'a "Anlaşmalı Veterinerler" linki

**Bitti sayılır:** `/veterinerler` sayfası açılıp örnek veteriner/klinik kartları görünüyor.

---

## Faz 13b — Anlaşmalı veteriner randevu sistemi
**Amaç:** Kullanıcı anlaşmalı veterinerlerden uygun gün/saat seçip randevu alabilsin.

- [x] Tablo `vet_slots`: `vet_id`, `slot_date`, `start_time`, `is_booked` — somut slot satırları
      (haftalık tekrar kuralı yerine), her veteriner için ~20 gün, hafta içi, günde 6 saat migration
      ile elle üretildi (statik örnek veri — gerçek uygulamada periyodik/cron ile üretilir)
- [x] Tablo `appointments`: `vet_id`, `slot_id`, `pet_id`, `user_id`, `status` (sadece "onaylandı"/"iptal" —
      onaylayan bir admin olmadığı için "bekliyor" durumu kaldırıldı, boş saat seçilince direkt onaylanıyor)
- [x] Çift rezervasyonu engellemek için iki katman: `book_appointment()` fonksiyonu slotu `for update`
      ile kilitleyip kontrol ediyor + `appointments.slot_id` üzerinde kısmi unique index (sadece
      "onaylandı" durumundaki kayıtlar için, iptal edilenler tekrar rezervasyona izin veriyor)
- [x] RLS: `vet_slots` giriş yapmış herkese okunur; `appointments` sadece kendi kayıtların; tüm
      yazma işlemleri `book_appointment()`/`cancel_appointment()` security definer fonksiyonlarıyla
- [x] Randevu alma ekranı (`/veterinerler/:vetId/randevu-al`): hayvan seç → uygun gün/saat seç → onayla
- [x] "Randevularım" sayfası (`/randevularim`): geçmiş/gelecek randevular, iptal etme
- [x] Karar: slot verisi migration ile elle eklendi (yönetim ekranı yok — proje kapsamı dışında)
- [x] Demo hesabı: `reset_demo_data()` güncellendi, demo hesabının aldığı randevular her girişte
      iptal edilip slotlar tekrar boşaltılıyor (ziyaretçiler slotları tüketip bitiremiyor)

**Bitti sayılır:** Bir veterinerden boş bir saat seçip randevu alınca, aynı saat başka bir kullanıcıya
boş görünmüyor. Tarayıcıda randevu alma, iptal etme ve demo sıfırlamanın slotu boşalttığı doğrulandı.

---

## Sonra (isteğe bağlı)
- E-posta ile aşı hatırlatma (Supabase Edge Function + zamanlanmış görev)
- Hayvan fotoğrafı (Supabase Storage)
- Google ile giriş
- Aşı geçmişini PDF olarak indirme
- Testler (Vitest + React Testing Library)
