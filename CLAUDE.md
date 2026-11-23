# CLAUDE.md — Pet Vaccine App

Bu dosya Claude Code'un bu projede nasıl çalışacağını anlatır. Her oturumda otomatik okunur.

## Proje
Evcil hayvan aşı takip uygulaması. Kullanıcı giriş yapar, hayvanlarını ekler, her hayvanın aşılarını
ve bir sonraki aşı tarihlerini takip eder. Yaklaşan ve geciken aşılar öne çıkarılır.

Amaç: CV/portföyde gösterilecek, ama gerçekten kullanılabilir seviyede bir uygulama.

## Teknoloji
- Frontend: React 19 + Vite (SPA, SSR YOK)
- Stil: Bootstrap 5 (Tailwind kullanılmıyor, ekleme)
- Yönlendirme: react-router
- Backend / veritabanı / giriş: Supabase (Postgres + Auth + Row Level Security)
- Deploy: Vercel (Hobby plan)

## Yol haritası
Tüm fazlar ve görevler `PLAN.md` dosyasında. Her zaman oradan takip et.

## Çalışma kuralları
1. **Sadece istenen fazda çalış.** Bir sonraki faza kendiliğinden geçme. Faz bitince dur ve özet ver.
2. **Önce plan, sonra kod.** Bir faza başlamadan önce o fazda neyi, hangi dosyalarda, neden
   değiştireceğini kısaca anlat ve onay bekle.
3. **Açıklayarak ilerle.** Ben öğrenen bir öğrenciyim. Yeni bir kavram (RLS, protected route,
   context, environment variable vb.) kullandığında 2-3 cümleyle ne olduğunu ve neden gerektiğini açıkla.
4. **Küçük adımlar.** Her mantıklı adımdan sonra uygulamanın çalıştığını doğrula
   (`npm run dev` / `npm run build`).
5. **PLAN.md'yi güncel tut.** Biten görevlerin kutucuğunu işaretle (`- [x]`).
6. **Git:** Her faz için ayrı branch aç (`faz-1-temizlik` gibi). Commit mesajları Türkçe ve açıklayıcı olsun.
   Ana branch `master`. `master`'a doğrudan commit atma, push etmeden önce bana sor.
7. **Gizli bilgiler:** Supabase URL/anahtarları sadece `.env.local` içinde dursun. `.env.local` asla
   commit edilmesin. Repoda sadece `.env.example` (değerler boş) olsun. `service_role` / secret anahtarı
   frontend koduna ASLA koyma.
8. **Güvenlik:** Supabase'de her tabloda RLS açık olmalı. RLS'siz tablo oluşturma.
9. **Dil:** Arayüz metinleri Türkçe. Kod (değişken, fonksiyon, dosya adları) İngilizce.

## Komutlar
- `npm install`: bağımlılıkları kur
- `npm run dev`: geliştirme sunucusu
- `npm run build`: production build (`dist/`)
- `npm run preview`: build'i yerelde test et

## Klasör yapısı (hedef)
```
src/
  lib/supabase.js        # Supabase client
  context/AuthContext.jsx
  components/            # tekrar kullanılan parçalar (PetCard, VaccineForm, ProtectedRoute...)
  pages/                 # Login, Register, Dashboard, PetDetail, NotFound
  utils/                 # tarih ve aşı durumu yardımcıları
  App.jsx
  main.jsx
supabase/
  migrations/            # tablo ve RLS SQL dosyaları (repoda tarihçe olarak dursun)
```
