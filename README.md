<div align="center">

# ✦ TRACE — Antigravity ✦
**Elite Expense Tracker (React Native & Expo)**

<img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge&color=000000" />
<img src="https://img.shields.io/badge/Score-9.6%20%28S--Grade%29-blue?style=for-the-badge&color=0A84FF" />
<img src="https://img.shields.io/badge/Theme-Antigravity-dark?style=for-the-badge&color=1C1C1E" />
<img src="https://img.shields.io/badge/Framework-Expo%20SDK%2054-lightgrey?style=for-the-badge&color=000000&logo=expo" />

</div>

## 🌌 The Antigravity Philosophy

Trace, **Mimar Antigravity** standartlarında; performans, sadelik ve Apple-seviyesi akıcılığı hedefleyen elit bir harcama takip uygulamasıdır. Standart, sıkıcı "budget" uygulamalarının aksine karanlık teması, neon renk paletleri ve pürüzsüz animasyonlarıyla size lüks bir deneyim sunar. 

---

## ⚡ Core Features (Özellikler)

- **Sıfır Bekleme (Instant DB):** `expo-sqlite` üzerine kurulu offline-first yapı ile bulut gecikmesi yok. Veriniz anında cihazınızda.
- **Glassmorphism UI:** `NativeWind` destekli yarı saydam yüzeyler ve dinamik arka plan aydınlatmaları.
- **Micro-Animations:** `react-native-reanimated` ile her dokunuşa tepki veren akışkan geçişler (Springify listeler, ekleme, silme efektleri).
- **Haptic Feedback:** İşlem eklerken, silerken ve butona dokunurken anlık fiziksel geri bildirim titreşimleri.
- **Uluslararası Dil Desteği (i18n):** Expo Localization ile sistem dilinizi otomatik anlar (TR/EN).
- **Dinamik Kategori & Limit Sistemi:** Harcadıkça dolan neon bar grafikler, kırmızı limit uyarıları. 

---

## 🏗️ Technical Architecture (Teknoloji Yığını)

- **Framework:** Expo (React Native) + Expo Router
- **Styling:** NativeWind (TailwindCSS v3)
- **State Yönetimi:** Zustand (Performanslı, Boilerplate-free)
- **Veritabanı:** Expo SQLite (Parametreli Sorgular & Offline)
- **Animasyon:** React Native Reanimated v3
- **Localisation:** expo-localization & i18n-js

*Kod tabanı her zaman `%100 Typescript`, sıfır hata ve sıfır TypeScript uyarısı prensibi ile inşa edilir.*

---

## 🛡️ Güvenlik ve Gizlilik (Zero Tolerance)

- **SQL Injection Koruması:** DB içindeki tüm sorgular (`lib/db/queries.ts`) katı bir şekilde parametrelendirilir.
- **Gizli Logger (Production Safe):** Terminale olan tüm sızıntılar `logger.ts` ile `__DEV__` arkasından sadece geliştirme modunda çalışır. Geliştirici değilseniz uygulama tamamen sessizdir.
- **Yerel Veri (Local-First):** Finansal bilgileriniz cihazınızdan asla çıkmaz. Buluta bağlı değiliz, veriniz güvende.

---

## 🚀 Kurulum (Local Development)

Proje lokalinizde çalıştırmak için:

```bash
# Bağımlılıkları yükle
npm install

# Projeyi başlat
npx expo start
```
*Not: Windows ortamında web (ESM modul hatası) için NativeWind ile ilgili spesifik uyarılar olabilir, en sağlıklı inceleme **Expo Go** uygulaması ile cihazınızda yapılmaktadır.*

---

<div align="center">
  <sub>Mimar: Fatih / Antigravity Smart Architect v1.0</sub>
</div>
