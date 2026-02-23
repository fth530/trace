<div align="center">

<br/>

<img src="https://img.shields.io/badge/TRACE-000000?style=for-the-badge&logoColor=white&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQyIDAtOC0zLjU4LTgtOHMzLjU4LTggOC04IDggMy41OCA4IDgtMy41OCA4LTggOHoiLz48L3N2Zz4=" alt="Trace"/>

# ⟨ T R A C E ⟩

**Harcamalarını izle. Limitlerini koru. Kontrolü eline al.**

<br/>

![Expo SDK](https://img.shields.io/badge/Expo_SDK_54-000000?style=flat-square&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native_0.81-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Score](https://img.shields.io/badge/Audit_Score-10%2F10_(S)-38bdf8?style=flat-square)

</div>

---

<br/>

## Ne İşe Yarar?

Trace, telefonundaki harcamalarını **anlık ve çevrimdışı** olarak takip eden, minimal ve karanlık temalı bir mobil uygulamadır. Bulut yok, hesap açma yok, reklam yok — açarsın, girersin, kapatırsın.

<br/>

## Neden Farklı?

| | Diğer Uygulamalar | Trace |
|---|---|---|
| **Veri** | Hesap aç, buluta bağlan | Yerel SQLite, verin sizde kalır |
| **Hız** | Sunucu gecikmeleri | Sıfır bekleme, anında açılır |
| **Tasarım** | Beyaz, düz, sıkıcı | Karanlık tema, neon vurgular, cam efektleri |
| **Boyut** | 80MB+ | ~15MB |
| **Gizlilik** | Verini 3. partilere satar | İnternet erişimi bile yok |

<br/>

---

<br/>

## Özellikler

### 📊 Günlük & Aylık Takip
Bugünkü harcamalarını büyük bir rakamla gör. Günlük ve aylık limitlerini ayarla — limitine yaklaştığında uygulama seni uyarsın.

### 📁 Kategori Sistemi
Harcamalarını **Ulaşım**, **Yemek**, **Market** ve **Diğer** olarak etiketle. Analiz ekranında her kategorinin yüzdesini neon çubuklarla gör.

### 📅 Geçmiş & Detay
Son 30 günlük harcama geçmişini gör. Herhangi bir güne dokunarak o günün detaylarına in.

### ⚡ Limit Uyarıları
%50, %80 ve %100 eşiklerinde:
- Animasyonlu banner uyarısı
- Renk değişen progress bar
- Haptic (titreşim) geri bildirim

### 🌍 Çoklu Dil
Telefonun Türkçe mi? Arayüz Türkçe. İngilizce mi? Otomatik İngilizce.

<br/>

---

<br/>

## Teknik Yapı

```
Trace/
├── app/                    # Ekranlar (Expo Router file-based routing)
│   ├── (tabs)/             # Ana sekmeler (Bugün, Geçmiş, Analiz, Ayarlar)
│   ├── modal/              # Harcama ekleme modalı
│   └── history/[date].tsx  # Gün detay sayfası (dinamik rota)
│
├── components/             # Yeniden kullanılabilir UI bileşenleri
│   ├── expense/            # DailyTotal, ExpenseItem, ExpenseList
│   ├── history/            # DaySummaryCard, PeriodSummary
│   ├── limit/              # LimitBanner, LimitProgress
│   └── ui/                 # Badge, EmptyState
│
├── lib/
│   ├── constants/          # design-tokens.ts, categories.ts
│   ├── db/                 # SQLite init, parametrik sorgular
│   ├── store/              # Zustand global state
│   ├── translations/       # i18n (TR/EN)
│   └── utils/              # currency, date, limits, logger
```

### Stack

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Framework | Expo SDK 54 | OTA update, native API erişimi |
| Navigation | Expo Router v6 | Dosya tabanlı, web uyumlu routing |
| Stil | NativeWind v4 | Tailwind sözdizimi, native performans |
| State | Zustand | ~1KB, boilerplate yok |
| Veritabanı | expo-sqlite | Cihaz üstü, SQL, parametrik |
| Animasyon | Reanimated v4 | 60fps, native thread üzerinde |
| Haptics | expo-haptics | Dokunsal geri bildirim |
| i18n | i18n-js + expo-localization | Otomatik dil algılama |

<br/>

---

<br/>

## Güvenlik

- **SQL Injection:** Tüm veritabanı sorguları `?` parametreleri ile çalışır. Doğrudan string interpolasyonu sıfır.
- **Veri Gizliliği:** Tüm veriler cihazda kalır. Uygulama hiçbir sunucuyla iletişim kurmaz.
- **Üretim Logları:** `logger.ts` yalnızca `__DEV__` modunda çalışır. Production'da sessiz.
- **Hassas Veri:** Kodda API anahtarı, token veya sır yok.

<br/>

---

<br/>

## Kurulum

```bash
# Klonla
git clone https://github.com/fth530/trace.git
cd trace

# Bağımlılıkları yükle
npm install

# Expo Go ile başlat
npx expo start
```

Telefonuna **Expo Go** yükle → QR kodu oku → Kullan.

<br/>

---

<br/>

## Tasarım Kararları

**Neden karanlık tema?**
Gece yatmadan önce harcama giren kullanıcı gözlerini kısmak istemez. OLED ekranlarda pil tasarrufu sağlar.

**Neden bulut yok?**
Harcama verisi kişiseldir. Çoğu kullanıcı sadece kendisi için takip eder. Bulut gereksiz karmaşıklık ve gizlilik riski ekler.

**Neden Zustand?**
Redux'un 47 satırlık action-reducer-selector döngüsü yerine Zustand'ın 3 satırlık `create()` fonksiyonu. Aynı iş, 1/10 kod.

<br/>

---

<br/>

<div align="center">

```
Built by Fatih — 2025
```

</div>
