# Trace (Günlük)

## Başlangıç (Setup)

Bu proje manuel olarak kurulmuştur çünkü sisteminizde Node.js yüklü görünmüyor.
Projeyi çalıştırmak için lütfen aşağıdaki adımları izleyin:

### 1. Node.js Kurulumu
[nodejs.org](https://nodejs.org) adresinden "LTS" versiyonunu indirin ve kurun.

### 2. Bağımlılıkları Yükleyin
Proje klasöründe (`Trace` dizini içinde) bir terminal açın ve çalıştırın:
```bash
npm install
```

### 3. Projeyi Başlatın
```bash
npx expo start
```
veya
```bash
npm start
```

### 4. Geliştirme
- iOS için: `i` tuşuna basın (Xcode Simulator gereklidir)
- Android için: `a` tuşuna basın (Android Studio Emulator gereklidir)
- Telefonunuzda test etmek için: App Store/Play Store'dan "Expo Go" uygulamasını indirin ve QR kodu taratın.

## Proje Yapısı

- `app/` - Expo Router sayfaları
- `components/` - Yeniden kullanılabilir bileşenler
- `lib/` - Veritabanı, store ve yardımcı fonksiyonlar
