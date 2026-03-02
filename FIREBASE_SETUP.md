# Firebase Setup Rehberi

Bu rehber, uygulamanıza Firebase Authentication ve Firestore entegrasyonunu tamamlamak için gereken adımları içerir.

## 1. Firebase Projesi Oluşturma

1. https://console.firebase.google.com/ adresine gidin
2. "Add project" butonuna tıklayın
3. Proje adı girin (örn: "expense-tracker")
4. Google Analytics'i istediğiniz gibi yapılandırın (opsiyonel)
5. "Create project" butonuna tıklayın

## 2. Firebase Authentication Kurulumu

1. Sol menüden **Authentication** seçin
2. "Get started" butonuna tıklayın
3. **Sign-in method** sekmesine gidin
4. **Google** provider'ı seçin ve "Enable" yapın
5. Support email seçin
6. "Save" butonuna tıklayın

## 3. Firestore Database Kurulumu

1. Sol menüden **Firestore Database** seçin
2. "Create database" butonuna tıklayın
3. **Test mode** seçin (geliştirme için)
4. Location seçin (örn: europe-west1)
5. "Enable" butonuna tıklayın

### Güvenlik Kuralları (Production için)

Test mode'dan sonra şu kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. iOS App Ekleme

1. Project Settings > Your apps > iOS
2. Bundle ID girin (app.json'dan alın)
3. GoogleService-Info.plist dosyasını indirin
4. Dosyayı projenizin root dizinine koyun
5. app.json'a ekleyin:

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## 5. Android App Ekleme

1. Project Settings > Your apps > Android
2. Package name girin (app.json'dan alın)
3. SHA-1 certificate fingerprint ekleyin:

```bash
# Debug için
cd android && ./gradlew signingReport
```

4. google-services.json dosyasını indirin
5. Dosyayı projenizin root dizinine koyun
6. app.json'a ekleyin:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## 6. Firebase Config Dosyasını Güncelleme

1. Firebase Console > Project Settings > General
2. "Your apps" bölümünden Web app ekleyin
3. Config bilgilerini kopyalayın
4. `lib/firebase/config.ts` dosyasını güncelleyin:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

export const GOOGLE_WEB_CLIENT_ID = "123456789-abc.apps.googleusercontent.com";
```

**Web Client ID'yi bulmak için:**
- Firebase Console > Authentication > Sign-in method > Google
- "Web SDK configuration" bölümünden kopyalayın

## 7. Paket Kurulumu

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-google-signin/google-signin
```

## 8. iOS için Ek Adımlar

```bash
cd ios && pod install && cd ..
```

## 9. Test Etme

1. Uygulamayı başlatın:
```bash
npx expo run:ios
# veya
npx expo run:android
```

2. Settings ekranından "Giriş Yap" butonuna tıklayın
3. Google hesabınızla giriş yapın
4. Harcama ekleyin ve Firebase Console'dan Firestore'da göründüğünü kontrol edin

## Sorun Giderme

### iOS: "No Firebase App '[DEFAULT]' has been created"
- GoogleService-Info.plist dosyasının doğru yerde olduğundan emin olun
- app.json'da googleServicesFile path'ini kontrol edin
- `npx expo prebuild --clean` çalıştırın

### Android: "Default FirebaseApp is not initialized"
- google-services.json dosyasının doğru yerde olduğundan emin olun
- app.json'da googleServicesFile path'ini kontrol edin
- `npx expo prebuild --clean` çalıştırın

### Google Sign-In çalışmıyor
- SHA-1 fingerprint'in doğru eklendiğinden emin olun
- GOOGLE_WEB_CLIENT_ID'nin doğru olduğundan emin olun
- Google Sign-In provider'ın Firebase Console'da aktif olduğundan emin olun

## Önemli Notlar

- Test mode'da herkes veritabanınıza erişebilir, production'a geçmeden önce güvenlik kurallarını güncelleyin
- Firebase ücretsiz kotaları: 50K okuma/gün, 20K yazma/gün, 1GB depolama
- Kullanıcı verilerini silmek için GDPR uyumlu bir sistem kurun

## Sonraki Adımlar

✅ Firebase kurulumu tamamlandı
✅ Google Sign-In aktif
✅ Firestore database hazır
✅ Offline-first sync çalışıyor

Artık kullanıcılar:
- Google ile giriş yapabilir
- Harcamalarını bulutta saklayabilir
- Farklı cihazlardan erişebilir
- Uygulama silse bile verilerini kaybetmez
