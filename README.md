# LGS Takip Sistemi

## Supabase Kurulumu

1) .env dosyasını oluşturun (veya mevcutsa güncelleyin):

```
VITE_SUPABASE_URL=https://qnevxayqsclxnvrjuwhq.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

2) Gerekli tabloları oluşturun:
- `supabase/migrations` klasöründeki SQL dosyasını Supabase Projesi > SQL sekmesinde çalıştırın.

3) Geliştirmeyi başlatın:

```
npm install
npm run dev
```

Uygulama, `subjects` tablosundan dersleri dinamik olarak çeker ve Supabase Auth ile e-posta/şifre girişi sağlar.
