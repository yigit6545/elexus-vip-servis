# Elexus Casino VIP Servis Web Uygulaması

Bu proje, Elexus Casino'nun VIP servis departmanı için geliştirilmiş modern ve responsive bir web uygulamasıdır.

## 🎯 Özellikler

### 🔐 Güvenlik
- Login sistemi ile güvenli erişim
- Kullanıcı kimlik doğrulama
- Environment variables ile güvenli konfigürasyon
- Hassas bilgiler GitHub'da saklanmaz

### 👥 Misafir Yönetimi
- Misafir bilgilerini görüntüleme
- Yeni misafir ekleme
- Misafir fotoğrafları (yuvarlak format)
- Detaylı misafir profilleri

### 🔍 Arama ve Filtreleme
- Gerçek zamanlı arama
- Misafir sınıflarına göre filtreleme:
  - VIP
  - A Grubu
  - B Grubu
  - C Grubu
  - D Grubu
  - Lokal

### 📱 Responsive Tasarım
- Mobil uyumlu arayüz
- Tablet ve desktop optimizasyonu
- Modern ve kullanıcı dostu tasarım

## 🎨 Tasarım Özellikleri

- **Renk Paleti**: Mavi ve beyaz tonları
- **Modern UI**: Gölgeler, yuvarlatılmış köşeler
- **İkonlar**: Font Awesome ikonları
- **Animasyonlar**: Smooth geçişler ve hover efektleri

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js** (v14 veya üzeri) - [İndir](https://nodejs.org/)
- **Modern web tarayıcısı** (Chrome, Firefox, Safari, Edge)
- **İnternet bağlantısı** (Font Awesome CDN için)

### Adımlar
1. **Proje dosyalarını indirin**
2. **Terminal/Komut İstemcisini açın ve proje klasörüne gidin**
3. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```
4. **Environment variables oluşturun:**
   ```bash
   # .env dosyası oluşturun
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
5. **Veritabanını başlatın:**
   ```bash
   npm run init-postgres
   ```
6. **Sunucuyu başlatın:**
   ```bash
   npm start
   ```
7. **Tarayıcınızda açın:** `http://localhost:3000`
7. **Giriş yapın:**
   - **Hüseyin:** kullanıcı adı: `hüseyin`, şifre: `20252025`
   - **Yiğit:** kullanıcı adı: `yigit`, şifre: `20252025`

### Dosya Yapısı
```
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── script.js           # JavaScript fonksiyonları
└── README.md           # Bu dosya
```

## 💻 Kullanım

### Giriş
- Sayfa açıldığında login ekranı görünür
- Herhangi bir kullanıcı adı ve şifre ile giriş yapabilirsiniz

### Ana Sayfa
- **Header**: VIP Servis başlığı, arama kutusu, filtreleme ve misafir ekleme butonları
- **Misafir Kartları**: Her misafir için detaylı bilgi kartları
- **Filtreleme**: Misafir sınıflarına göre filtreleme seçenekleri

### Misafir Ekleme
1. "Misafir Ekle" butonuna tıklayın
2. Formu doldurun:
   - Misafir fotoğrafı (opsiyonel)
   - Ad soyad
   - Sınıf seçimi
   - İçtiği alkol, sigara, puro
   - Özel istekler
   - Diğer bilgiler
3. "Kaydet" butonuna tıklayın

### Arama ve Filtreleme
- **Arama**: Misafir adı, sınıf veya diğer bilgilerde arama
- **Filtreleme**: Misafir sınıflarına göre filtreleme
- **Kombinasyon**: Arama ve filtreleme birlikte kullanılabilir

## 🔧 Teknik Detaylar

### Teknolojiler
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express.js
- **Veritabanı**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: bcryptjs (şifre hash'leme)
- **Icons**: Font Awesome

### Mimari
- **Full-Stack Application**: Frontend + Backend + Database
- **RESTful API**: Modern API tasarımı
- **Single Page Application (SPA)**: Sayfa yenilenmeden çalışır
- **Modular JavaScript**: Class-based yapı
- **Responsive Design**: Mobile-first yaklaşım
- **MVC Pattern**: Model-View-Controller mimarisi

### Veri Yönetimi
- **SQLite Database**: Kalıcı veri saklama
- **JWT Authentication**: Güvenli kullanıcı girişi
- **File Upload**: Misafir fotoğrafları
- **Real-time Updates**: Anlık güncellemeler
- **Data Validation**: Veri doğrulama
- **Error Handling**: Hata yönetimi

## 📱 Mobil Uyumluluk

- **Responsive Grid**: Otomatik sütun ayarlama
- **Touch Friendly**: Mobil dokunmatik optimizasyonu
- **Adaptive Layout**: Ekran boyutuna göre uyarlanabilir tasarım

## 🎯 Gelecek Geliştirmeler

- [x] ✅ Veritabanı entegrasyonu
- [x] ✅ Kullanıcı rolleri ve yetkilendirme
- [x] ✅ Misafir düzenleme ve silme
- [x] ✅ Misafir ziyaret kayıtları
- [ ] 📊 Raporlama ve analitik dashboard
- [ ] 🔔 Push notifications
- [ ] 📱 Mobile app (React Native/Flutter)
- [ ] 🌐 Multi-language support
- [ ] 📈 Advanced analytics
- [ ] 🔒 Role-based access control
- [ ] 📧 Email notifications
- [ ] 🔄 Real-time sync

## 🔧 Sorun Giderme

### SSL Bağlantı Hatası
Eğer "The server does not support SSL connections" hatası alıyorsanız:

1. **Yerel PostgreSQL:** `DATABASE_URL` değişkenini ayarlayın ve SSL'i devre dışı bırakın
2. **Render.com:** URL'nin `render.com` içerdiğinden emin olun (otomatik SSL aktif olur)
3. `.env` dosyasını kontrol edin

### Diğer Veritabanı Sorunları
Eğer veritabanı bağlantısında sorun yaşıyorsanız:
1. PostgreSQL sunucusunun çalıştığından emin olun
2. Bağlantı bilgilerini kontrol edin
3. Firewall ayarlarını kontrol edin
4. `DATABASE_URL` environment variable'ının doğru ayarlandığından emin olun

Konsol mesajlarını takip ederek hangi adımda hata aldığınızı görebilirsiniz.

## 📞 Destek

Herhangi bir sorun veya öneri için lütfen iletişime geçin.

## 📄 Lisans

Bu proje Elexus Casino için özel olarak geliştirilmiştir.

---

**Not**: Bu uygulama demo amaçlıdır. Gerçek kullanım için güvenlik önlemleri ve veritabanı entegrasyonu eklenmelidir. 