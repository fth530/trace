# Trace – Günlük Bütçe ve Harcama Takip Uygulaması

Trace, kişisel finansınızı kontrol altına almanızı sağlayan, **tamamen çevrimdışı (offline-first)** çalışan, S-Class Antigravity mimarisine sahip ultra hızlı ve şık bir bütçe takip uygulamasıdır. 

Trace, giderlerinizi girerken sizi bekletmez; 0 ms (sıfır milisaniye) bekleme süreli Optimistic UI (İyimser Arayüz) motoru sayesinde her şey saniyesinde gerçekleşir. Neon renk paleti, cam efektleri ve pürüzsüz yay animasyonlarıyla finansal verilerinizi sıkıcı olmaktan çıkarıp görsel bir şova dönüştürür.

## 🚀 Özellikler ve Neler Yapabilirsiniz?

- **Günlük ve Aylık Limit Yönetimi:** Uygulamaya kendinize özel günlük veya aylık harcama limitleri tanımlayabilirsiniz. Ana sayfadaki ve analiz ekranlarındaki görsel neon çubuklar (Progress Bars), limitinize ne kadar yaklaştığınızı yüzdesel olarak gösterir.
- **Sıfır Gecikme (0ms Optimistic UI):** Bir harcama girdiğinizde veya sildiğinizde, veritabanı okumasını beklemezsiniz. Zustand Store motoru arayüzü anında günceller, veritabanı eşitlemesini arka planda halleder.
- **Kategorisel Analiz Raporları:** Harcamalarınızı "Araba, Pazar, Kahve, Eğitim" vb. gibi çeşitli kategorilere bölerek ekleyebilirsiniz. Sonrasında Analytics sayfasında animasyonlu çubuk grafiklerle paranızın nereye gittiğini analiz edebilirsiniz.
- **Haptic Feedback ve Animasyonlar:** Ekrana dokunduğunuzda cihazınızın hafif titremesi (Haptic), ekranların yüklenirken yaylanarak (Spring) gelmesi ve tamamen karanlık modun (`dark mode`) asil görünümüyle premium bir deneyim yaşatır.
- **Güvende ve Sadece Cihazınızda:** Trace, dışarıya internet bağlantısı zorunluluğu istemez. Verileriniz cihazınızdaki SQLite veritabanında uçtan uca güvende tutulur.

## 🛠 Kullanılan Teknolojiler (Tech Stack)

- **Framework:** React Native / Expo Router (v3)
- **Dil:** TypeScript (Sıkı Tip Denetimi)
- **State Yönetimi:** Zustand (Hızlı ve sade global state yönetimi)
- **Yerel Veritabanı:** SQLite (`expo-sqlite`)
- **Arayüz & Şekillendirme:** NativeWind (Tailwind CSS) & `react-native-reanimated`
- **Etkileşim:** Expo Haptics

## 📂 Proje Yapısı

```bash
📦 Trace
 ┣ 📂 app              # Expo Router sayfaları (Menüler, Modallar, Alt sayfalar)
 ┣ 📂 components       # Yeniden kullanılabilir, özelleştirilmiş UI bileşenleri
 ┣ 📂 lib              # Uygulamanın Beyni
 ┃ ┣ 📂 constants      # Renkler, neon efektleri ve kategoriler
 ┃ ┣ 📂 db             # SQLite Veritabanı tabloları ve sorguları
 ┃ ┣ 📂 store          # Zustand Global State dosyaları
 ┃ ┗ 📂 utils          # Tarih formatlayıcılar, hesaplama araçları
 ┣ 📂 __tests__        # Otomatik Unite testleri
 ┗ 📜 tailwind.config  # Tailwind stil ayarları
```

## 🔋 Kurulum

### Gereksinimler
- Node.js (v18 ve üzeri)
- Expo CLI

### Local Ortamda Çalıştırma

1. Gerekli kütüphaneleri yükleyin:
   ```bash
   npm install
   ```
2. Expo sunucusunu başlatın:
   ```bash
   npx expo start
   ```
3. Cihazınızda Expo Go ile QR kodu okutarak test edebilir veya lokal olarak iOS/Android similatöründe derleyebilirsiniz.

---
*Daha akıcı bir ekonomi, minimal bir hayat. Antigravity Architecture eşliğinde geliştirildi.*
