# Assets Placeholder

Bu klasör uygulama görselleri için ayrılmıştır.

## ⚠️ ÖNEMLİ: Görseller Geçici Olarak Kaldırıldı

`app.json` dosyasından icon ve splash referansları kaldırıldı. Bu sayede:
- ✅ Development mode (`npx expo start`) sorunsuz çalışır
- ✅ Expo Go'da test edebilirsin
- ⚠️ Production build (`eas build`) için görseller gerekli

## Gerekli Dosyalar (Production İçin)

### 1. icon.png
- Boyut: 1024x1024 px
- Format: PNG (şeffaf arka plan)
- Kullanım: iOS ve Android app icon

### 2. splash.png
- Boyut: 1284x2778 px (iPhone 14 Pro Max)
- Format: PNG
- Arka plan: #0A0A0A (koyu siyah)
- Kullanım: Uygulama açılış ekranı

### 3. adaptive-icon.png
- Boyut: 1024x1024 px
- Format: PNG (şeffaf arka plan)
- Kullanım: Android adaptive icon (foreground layer)
- Not: Ortadaki 768x768 px alan güvenli bölge

## Tasarım Önerileri

- Trace logosu minimal ve modern olmalı
- Glassmorphism estetiğine uygun
- Dark mode için optimize edilmiş
- Accent color (#8B5CF6 - mor) kullanılabilir

## Production Build İçin

Görselleri hazırladıktan sonra `app.json` dosyasına şu satırları geri ekle:

```json
"icon": "./assets/icon.png",
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#0A0A0A"
},
"ios": {
  "icon": "./assets/icon.png"
},
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#0A0A0A"
  }
}
```

## Hızlı Placeholder Oluşturma (Opsiyonel)

Online araçlar:
- [Figma](https://figma.com) - Ücretsiz tasarım aracı
- [Canva](https://canva.com) - Hızlı logo oluşturma
- [Icon Kitchen](https://icon.kitchen) - Android adaptive icon generator

