# Trace: App Store & Google Play Metadata (v1.0.0)

Bu doküman, uygulamanızı App Store Connect ve Google Play Console'a yüklerken kopyala-yapıştır yapacağınız SEO/ASO uyumlu tüm metinleri ve dağıtım komutlarını içerir.

---

## 🇹🇷 TÜRKÇE (TR) MAĞAZA İÇERİĞİ

**App Adı (Max 30 Karakter):**
> Trace: Çevrimdışı Bütçe Takibi

**Kısa Açıklama / Subtitle (Max 30-80 Karakter):**
> Harcamalarını gizlilikle izle. Çevrimdışı, reklamsız ve minimalist bütçe takibi.

**Anahtar Kelimeler (Keywords - Virgülle ayrılmış):**
> bütçe,harcama takibi,cüzdan,para yönetimi,finans,çevrimdışı günlük,masraf,minimalist,gelir gider

**Uzun Açıklama (Play Store / App Store Description):**
> **Trace ile Paranızın Kontrolünü Elinize Alın**
> Trace, harcamalarınızı en gizli, hızlı ve minimalist şekilde takip etmeniz için tasarlandı. Karmaşık menülerden, gereksiz banka bağlantılarından ve kişisel verilerinizi toplayan uygulamalardan sıkıldınız mı? Trace tamamen "offline-first" (çevrimdışı) çalışır; verileriniz sadece kendi cihazınızda kalır.
> 
> 🔥 **GÜNLÜK SERİNİZİ KORUYUN**
> Günlük harcama girişlerinizi unutmayın. Trace'in akıllı (ve tamamen internetsiz) hatırlatıcılarıyla her gün harcama girme serinizi (Streak) ateşleyin!
> 
> 🎯 **LİMİTLERİNİZİ BELİRLEYİN**
> Aylık veya günlük esnek bütçe limitleri koyun. Trace, harcamalarınız tehlike sınırına (%50 ve %80) yaklaştığında görsel uyarılarla sizi otomatik olarak frenler.
> 
> 📊 **GÖRSEL ANALİZ**
> Harcamalarınızı kategorilere göre ayırın, geçmiş günlere ait verileri tek tıkla görün ve sade grafiklerle paranızın tam olarak nereye gittiğini anında anlayın.
> 
> 🛡️ **TAVİZ VERMEYEN GİZLİLİK**
> Trace hiçbir sunucu barındırmaz, reklam göstermez ve üyelik talep etmez. Uçtan uca veri minimizasyonu: Tüm veriler cihazınızda kriptolanır ve istediğiniz an "Kırmızı Çizgi" butonuyla kalıcı olarak silinebilir.
> 
> Pürüzsüz karanlık tema, şık animasyonlar ve saniyeler süren kayıt deneyimi ile bütçenizi yönetmek hiç bu kadar keyifli olmamıştı.


---


## 🇺🇸 ENGLISH (EN) STORE CONTENT

**App Name (Max 30 Chars):**
> Trace: Offline Expense Tracker

**Subtitle / Short Description (Max 30-80 Chars):**
> Private, offline, ad-free and minimal budget tracking. Know where your money goes.

**Keywords (Comma separated):**
> budget,expense tracker,spending,finance,wallet,money manager,offline,minimalist,privacy,daily planner

**Long Description:**
> **Take Control of Your Money with Trace**
> Trace is designed to track your daily expenses in the most private, rapid, and minimalist way possible. Tired of cluttered menus, intrusive bank connections, and apps that harvest your personal data? Trace is completely "offline-first"—your financial data never leaves your device.
> 
> 🔥 **KEEP YOUR STREAK ALIVE**
> Never miss a day. With Trace’s smart (and entirely offline) local notifications, log your expenses daily and build your spending awareness streak!
> 
> 🎯 **SET YOUR LIMITS**
> Define your daily or monthly flexible budgets. Trace will visually warn you when you hit 50% and 80% of your limits, keeping impulsive spending at bay.
> 
> 📊 **VISUAL ANALYTICS**
> Automatically categorize your expenses, peek into your 30-day history with a single tap, and understand exactly where your money goes through sleek graphs.
> 
> 🛡️ **UNCOMPROMISED PRIVACY**
> Trace has zero servers, runs zero ads, and requires absolutely no account creation. Data minimization at its core: all your data lives natively on your device and can be permanently wiped in a single tap via the "Danger Zone".
> 
> With its sleek dark mode, fluid animations, and a sub-second logging experience, managing your budget has never felt this premium.

---

## 🚀 EAS BUILD & DISTRIBUTE KOMUTLARI

Uygulamayı mağazalara derlemek ve test etmek için aşağıdaki adımları terminalinizde sırasıyla çalıştırın.

### 1. Hazırlık
Eğer giriş yapmadıysanız Expo hesabınıza bağlanın:
```bash
npx eas-cli login
```

### 2. iOS Dağıtım (Apple App Store / TestFlight)
Uygulamayı Apple ortamına derlemek ve otomatik olarak TestFlight'a göndermek için:
*(Not: Apple Developer Account (Ücretli) gerektirir)*
```bash
eas build --platform ios --profile production --auto-submit
```
↳ *Derleme tamamlandığında Apple Developer hesabınıza TestFlight sürümü olarak düşecektir. App Store Connect portalına girip Privacy Policy URL (sizin github url'niz) ve App Store Screenshot'ları (Home, Analytics vs) yükleyin.*

### 3. Android Dağıtım (Google Play Console)
Google Play Store için .AAB formatında (Production) build almak için:
*(Not: Google Play Developer (Tek Seferlik Ücretli) hesabı gerektirir)*
```bash
eas build --platform android --profile production
```
↳ *Play Console'a girin: App Content menüsünden "Data Safety" bildirimini açın. Veri toplanmadığını, uygulamanın Offline çalıştığını beyan edin. Screenshot'ları yükleyip AAB dosyasını Internal Testing'e sürün.*

---

## 📋 Ekstra İpuçları & Linkler
- **Gizlilik Politikası (Privacy Policy):** Mağazalar bu URL'yi zorunlu tutar. Sizin için yarattığımız `PRIVACY_POLICY.md` dosyasını Github'da public yapıp `https://github.com/kullaniciAdi/repoAdi/blob/main/PRIVACY_POLICY.md` linkini mağaza URL alanine yapıştırabilirsiniz.
- **Support Email:** Mağazaya kişisel veya iletişim amaçlı e-postanızı eklemeyi unutmayın.
