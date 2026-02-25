# Assets

Bu klasör uygulama görselleri içerir.

## Mevcut Dosyalar

| Dosya | Boyut | Kullanım |
|-------|-------|----------|
| `icon.png` | 1024×1024 | iOS & Android uygulama ikonu |
| `splash.png` | 1284×2778 | Açılış ekranı |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon (foreground) |

Bu dosyalar `app.json` tarafından referans edilir ve hem development hem production build'de aktif olarak kullanılmaktadır.

## Yeni Görsel Oluşturma

Görselleri değiştirmek istersen:

```bash
node scripts/generate-assets.js
```

### Tasarım Rehberi
- Arka plan: `#0A0A0A` (Antigravity siyahı)
- Accent: `#38bdf8` (Neon sky blue)
- Stil: Minimal, glassmorphism uyumlu
- Güvenli alan (adaptive icon): orta 768×768px
