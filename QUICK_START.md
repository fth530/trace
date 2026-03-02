# 🚀 Hızlı Başlangıç - Firebase Entegrasyonu

## ✅ Yapılanlar

1. ✅ Firebase auth servisi oluşturuldu
2. ✅ Firestore sync servisi oluşturuldu
3. ✅ Login ekranı eklendi
4. ✅ Settings'e logout butonu eklendi
5. ✅ Store'a otomatik sync eklendi
6. ✅ Paketler zaten kurulu

## 🎯 Şimdi Yapmanız Gerekenler

### 1. Firebase Console Setup (10 dakika)

```
1. https://console.firebase.google.com/ → Yeni proje
2. Authentication → Google provider aktif et
3. Firestore Database → Test mode ile oluştur
4. iOS app ekle → GoogleService-Info.plist indir
5. Android app ekle → google-services.json indir
```

### 2. Config Dosyasını Doldur (2 dakika)

`lib/firebase/config.ts` dosyasını aç ve Firebase Console'dan aldığın bilgileri yapıştır:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...",                    // Firebase Console'dan kopyala
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

export const GOOGLE_WEB_CLIENT_ID = "123...apps.googleusercontent.com";
```

**Web Client ID nerede?**
- Firebase Console → Authentication → Sign-in method → Google
- "Web SDK configuration" bölümünden kopyala

### 3. Platform Dosyalarını Ekle (3 dakika)

**iOS:**
```bash
# GoogleService-Info.plist dosyasını proje root'una kopyala
```

**Android:**
```bash
# google-services.json dosyasını proje root'una kopyala
```

**app.json'a ekle:**
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 4. Test Et (2 dakika)

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

**Test adımları:**
1. Uygulamayı aç
2. Settings → "🔐 Giriş Yap" butonu
3. Google hesabınla giriş yap
4. Harcama ekle
5. Firebase Console → Firestore → users koleksiyonunu kontrol et

## 🎉 Tamamlandı!

Artık kullanıcılar:
- ✅ Google ile giriş yapabilir
- ✅ Harcamalarını bulutta saklayabilir
- ✅ Farklı cihazlardan erişebilir
- ✅ Uygulama silse bile verilerini kaybetmez

## 📚 Detaylı Dokümantasyon

- `FIREBASE_SETUP.md` - Detaylı kurulum rehberi
- `IMPLEMENTATION_SUMMARY.md` - Teknik detaylar ve mimari

## 🆘 Sorun mu var?

1. Config dosyasını kontrol et
2. Platform dosyalarının doğru yerde olduğundan emin ol
3. `npx expo prebuild --clean` çalıştır
4. Firebase Console'da Google Sign-In aktif mi kontrol et

## 💡 İpuçları

- Test mode'da herkes veritabanına erişebilir
- Production'a geçmeden önce güvenlik kurallarını güncelle
- Ücretsiz kota 5,000-10,000 kullanıcıya kadar yeterli
- Offline-first yaklaşım sayesinde internet olmadan da çalışır
