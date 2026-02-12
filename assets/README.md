# Assets Placeholder

Bu klasör uygulama görselleri için ayrılmıştır.

## Gerekli Dosyalar

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

## Geçici Çözüm

Build almak için geçici olarak düz renkli placeholder'lar kullanabilirsiniz:
```bash
# ImageMagick ile placeholder oluşturma (opsiyonel)
convert -size 1024x1024 xc:#8B5CF6 icon.png
convert -size 1284x2778 xc:#0A0A0A splash.png
convert -size 1024x1024 xc:#8B5CF6 adaptive-icon.png
```
