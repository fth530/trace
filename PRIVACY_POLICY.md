# Gizlilik Politikası (Privacy Policy)
**Son Güncelleme:** Şubat 2026

Trace (bundan sonra "Uygulama" olarak anılacaktır), kullanıcı gizliliğine en yüksek düzeyde önem verir. Harcama verileriniz üzerinde tam kontrol sahibi olmanızı sağlamak için bu uygulamayı "veri minimizasyonu" ve "çevrimdışı ilk (offline-first)" prensipleriyle geliştirdik.

## 1. Veri Toplama ve Depolama
**Trace, kişisel veya finansal harcama verilerinizi hiçbir sunucuya yüklemez.**
Uygulama içine girdiğiniz tüm veriler (harcamalar, limitler, kategori tercihleri) **yalnızca yerel cihazınızın hafızasında (SQLite aracılığıyla)** şifresiz olarak tutulur. Biz, geliştiriciler olarak, harcama bilgilerinize erişemeyiz.

## 2. Analiz ve Hata Takibi (Sentry)
Uygulama sadece ve sadece uygulamada bir sorun yaşandığında, bu sorunu hızlıca çözebilmemiz için (Crash Reporting) otomatik hata günlüğü gönderimi sağlar. Bu veriler:
- IP adresinizi, kişisel kimliğinizi veya harcama bilgilerinizi **içermez**.
- Yalnızca çökme sırasındaki cihaz modeli, işletim sistemi sürümü ve hatanın kod tarafındaki izini (Stack trace) içerir.

## 3. Üçüncü Taraf Eklentileri
Uygulama temel olarak çevrimdışı çalışır. Sadece Sentry (hata takibi) haricinde analiz, reklam veya kullanıcı takip sistemleri (Google Analytics, vb.) kodumuzda bulunmamaktadır.

## 4. Verilerinizi Silme
Trace, verilerinizi her an tamamen cihazınızdan kaldırma yetkisine sahiptir. `Ayarlar > Limitler` ekranının altındaki **"Tümünü Sıfırla" (Danger Zone)** butonuna basarak tüm finans verilerinizi cihazınızdan anında ve kalıcı biçimde silebilirsiniz. 

---

### English Version 

**Last Updated:** February 2026

Trace ("App") values your privacy. This application is designed with "data minimization" and "offline-first" principles to ensure you have full control over your expense data.

## 1. Data Collection and Storage
**Trace does not upload your personal or financial expense data to any servers.**
All data you enter into the App (expenses, limits, category preferences) is kept **strictly on your local device storage** (via SQLite). We do not have access to your expense information.

## 2. Crash Reporting (Sentry)
The App uses crash reporting tools solely for the purpose of fixing technical issues effectively. This data:
- **Does not** contain your IP address, personal identity, or expense records.
- Contains only basic device state (model, OS version) and the code's stack trace during a crash.

## 3. Third-Party Services
The App works fully offline. We do not use any analytical or advertising trackers (e.g., Google Analytics). Sentry is the only third-party service used for bug resolution.

## 4. Deleting Your Data
You have complete control to wipe all your data at any time. By navigating to `Settings > Limits` and pressing **"Reset All" (Danger Zone)**, you can permanently erase all financial history immediately from your device.
