# 🚨 Acil Durum Yönetim ve Koordinasyon Sistemi (Emergency Management System)
Acil Durum Yönetim ve Koordinasyon uygulaması uçtan uca "kurumsal yapıda" modern web teknolojileri ile geliştirilmiş kapsamlı afet ve acil durum yönetim platformudur.
PostgreSQL, PostGIS, Next.js ve Python Flask ile geliştirilmiş, gerçek zamanlı afet verilerini toplayan ve görselleştiren açık kaynaklı bir koordinasyon platformu. Küresel düzeyde deprem, yangın ve tsunami verilerini takip ederek afet yönetimini kolaylaştırmayı hedefler. Kurumsal yapıda tasarlanmış sistem bütüncül olarak afet yönetimini kolaylaştırmayı ve birimler arasında koordinasyonu arttırmayı hedefler.

## 🚀 Öne Çıkan Özellikler

- 🌐 **Küresel veri entegrasyonu**: NASA FIRMS, Kandilli API, Tsunami Alert servisleri
- 🗺️ **Harita tabanlı görselleştirme**: Mapbox GL JS ve Leaflet destekli dashboard
- 📦 **Depo ve envanter yönetimi**: Detaylı kategori, altyapı ve şart sistemleri
- 🧰 **Ekipman ve envanter takibi**: Marka, model, seri numarası ve bakım kayıtları ile izleme
- 🏕️ **Konteyner ve çadır kent yönetimi**: Barınma alanları için altyapı ve lojistik desteği
- 👥 **Personel ve gönüllü yönetimi**: Rol bazlı atama, iletişim ve görev eşleştirme
- 🗂️ **Görev planlama ve yönetimi**: Acil durum operasyonlarının zamanlaması ve takibi
- 🧭 **Bölge yönetimi**: Hiyerarşik coğrafi yapı, acil durum seviyelerine göre renkli harita kaplamaları
- 📋 **Log yönetimi**: Sistem işlemlerinin denetimi ve hata takibi
- 📊 **Raporlama araçları**: Veri analizine dayalı görsel ve metinsel çıktılar
- ⚙️ **Ayarlar modülü**: Sistem yapılandırması ve kullanıcı tercihleri yönetimi
- 🔐 **Güvenlik yapısı**: Rol ve yetki tabanlı erişim kontrolü (RBAC)
- 📊 **PostGIS ile coğrafi veri analizi**: 31+ tablo ve gelişmiş sorgu desteği
- 🧠 **Akıllı önbellekleme sistemi**: JSON dosya tabanlı hızlı veri erişimi



**Acil Durum Yönetim Sistemi** - 

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.0-0170FE?style=flat-square&logo=ant-design)](https://ant.design/)

## 📋 İçindekiler

- [🎯 Proje Hakkında](#-proje-hakkında)
- [✨ Özellikler](#-özellikler)
- [🏗️ Sistem Mimarisi](#️-sistem-mimarisi)
- [📱 Modüller](#-modüller)
- [🚀 Kurulum](#-kurulum)
- [⚙️ Yapılandırma](#️-yapılandırma)
- [📊 Veritabanı](#-veritabanı)
- [🔧 Teknolojiler](#-teknolojiler)
- [📸 Ekran Görüntüleri](#-ekran-görüntüleri)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)
  
## 🎯 Proje Hakkında

Acil Durum Yönetim ve Koordinasyon uygulaması uçtan uca "kurumsal yapıda" modern web teknolojileri ile geliştirilmiş kapsamlı afet ve acil durum yönetim platformudur. PostgreSQL, PostGIS, Next.js ve Python Flask ile geliştirilmiş, gerçek zamanlı afet verilerini toplayan ve görselleştiren açık kaynaklı bir koordinasyon platformu. Küresel düzeyde deprem, yangın ve tsunami verilerini takip ederek afet yönetimini kolaylaştırmayı hedefler. Kurumsal yapıda tasarlanmış sistem bütüncül olarak afet yönetimini kolaylaştırmayı ve birimler arasında koordinasyonu arttırmayı hedefler.


### 🌟 Ana Hedefler

- **Gerçek Zamanlı İzleme**: Canlı deprem, yangın ve tsunami verilerinin takibi
- **Bölgesel Koordinasyon**: Dünya genelinde bölgesel afet yönetimi
- **Kaynak Optimizasyonu**: Personel, ekipman ve malzeme yönetimi
- **Hızlı Müdahale**: Acil durumlarda etkili koordinasyon
- **Veri Analizi**: Kapsamlı raporlama ve analiz araçları

## ✨ Özellikler

### 🌍 Gerçek Zamanlı Veri İzleme
- **Canlı Deprem Verileri**: AFAD ve uluslararası kaynaklardan gerçek zamanlı deprem bilgileri
- **Yangın Takibi**: Orman yangınları ve şehir yangınlarının izlenmesi
- **Tsunami Uyarıları**: Erken uyarı sistemi entegrasyonu
- **Otomatik Güncellemeler**: 5 dakikalık periyotlarla veri yenileme

### 🗺️ Harita ve Görselleştirme
- **İnteraktif Haritalar**: Leaflet tabanlı dinamik harita sistemi
- **Çoklu Katman Desteği**: Uydu, standart ve topografik harita görünümleri
- **Gerçek Zamanlı Marker'lar**: Olayların harita üzerinde canlı gösterimi
- **Bölge Yönetimi**: Renkli bölge sınırları ve yarı transparan kaplamalar

### 👥 Personel ve Kullanıcı Yönetimi
- **Rol Tabanlı Erişim**: Admin, Manager, Staff, Volunteer rolleri
- **Bölgesel Yetkilendirme**: Kullanıcıların belirli bölgelere atanması
- **Görev Takibi**: Personel görevlerinin planlanması ve izlenmesi
- **Eğitim Yönetimi**: Gönüllü eğitim programları

### 📦 Envanter ve Lojistik
- **Depo Yönetimi**: Çoklu depo sistemi ve stok takibi
- **Ekipman Yönetimi**: Afet müdahale ekipmanlarının kategorize edilmesi
- **Transfer İşlemleri**: Depolar arası malzeme transferi
- **Otomatik Uyarılar**: Kritik stok seviyesi bildirimleri

### 🏕️ Kamp ve Barınma
- **Kamp Alanı Yönetimi**: Geçici barınma merkezlerinin koordinasyonu
- **Kapasite Takibi**: Kamp alanlarının doluluk oranları
- **Kaynak Dağıtımı**: Kamp ihtiyaçlarının planlanması
- **Sağlık Hizmetleri**: Kamp sağlık hizmetlerinin yönetimi

### 📊 Raporlama ve Analiz
- **PDF Raporlar**: Otomatik rapor oluşturma sistemi
- **İstatistiksel Analiz**: Detaylı veri analizi ve grafikler
- **Performans Metrikleri**: Sistem ve operasyonel performans takibi
- **Trend Analizi**: Geçmiş verilerle karşılaştırmalı analizler

## 🏗️ Sistem Mimarisi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │   + PostGIS     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Cron Services │    │   Spatial Data  │
│   (Ant Design)  │    │   (Data Sync)   │    │   (GeoNames)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 Veri Akışı
1. **Dış API'ler** → Cron servisleri → Cache → Veritabanı
2. **Kullanıcı İstekleri** → Next.js API Routes → Prisma ORM → PostgreSQL
3. **Gerçek Zamanlı Güncellemeler** → WebSocket → Frontend Bileşenleri

## 📱 Modüller

### 🏠 Ana Dashboard
![Dashboard](./assets/screenshots/dashboard.png)

Sistem geneline ait özet bilgiler, son depremler, aktif yangınlar ve kritik uyarılar.

**Özellikler:**
- Gerçek zamanlı deprem listesi
- İnteraktif Türkiye haritası
- Sistem durumu göstergeleri
- Hızlı erişim menüleri

---

### 🗺️ Harita Modülü
![Map Module](./assets/screenshots/map-module.png)

Kapsamlı harita görüntüleme ve analiz sistemi.

**Özellikler:**
- Çoklu katman desteği (Uydu, Standart, Topografik)
- Gerçek zamanlı deprem marker'ları
- Yangın alanları gösterimi
- Bölge sınırları ve kaplamalar
- Mesafe ve alan ölçüm araçları

---

### 🌍 Bölge Yönetimi
![Region Management](./assets/screenshots/region-management.png)

Türkiye genelinde acil durum bölgelerinin tanımlanması ve yönetimi.

**Özellikler:**
- Hiyerarşik lokasyon seçimi (Ülke → Şehir → İlçe)
- Renkli bölge kaplamalar
- Acil durum seviyesi tanımlama
- Bölgesel koordinasyon
- Yarı transparan harita kaplamaları

---

### 👥 Personel Yönetimi
![Personnel Management](./assets/screenshots/personnel-management.png)

Afet müdahale personelinin kayıt, görevlendirme ve takip sistemi.

**Özellikler:**
- Personel profil yönetimi
- Uzmanlık alanları tanımlama
- Görev atamaları
- Çalışma saatleri takibi
- Performans değerlendirme

---

### 📦 Depo ve Envanter Yönetimi
![Warehouse Management](./assets/screenshots/warehouse-management.png)

Afet müdahale malzemelerinin depolanması ve dağıtımının yönetimi.

**Özellikler:**
- Çoklu depo sistemi
- Kategori bazlı stok yönetimi
- Kritik seviye uyarıları
- Transfer işlemleri
- Envanter raporları

---

### 🛠️ Ekipman Yönetimi
![Equipment Management](./assets/screenshots/equipment-management.png)

Afet müdahale ekipmanlarının kayıt ve bakım takibi.

**Özellikler:**
- Ekipman kategorileri
- Durum takibi (Aktif, Bakımda, Arızalı)
- Bakım programları
- Lokasyon bazlı dağılım
- Kullanım geçmişi

---

### 🏕️ Kamp Yönetimi
![Camp Management](./assets/screenshots/camp-management.png)

Geçici barınma merkezlerinin koordinasyonu ve yönetimi.

**Özellikler:**
- Kamp alanı planlaması
- Kapasite yönetimi
- Hizmet türleri tanımlama
- Kaynak dağıtımı
- Sağlık hizmetleri koordinasyonu

---

### 📋 Görev Yönetimi
![Task Management](./assets/screenshots/task-management.png)

Acil durum müdahale görevlerinin planlanması ve takibi.

**Özellikler:**
- Görev kategorileri
- Öncelik seviyeleri
- Personel atamaları
- İlerleme takibi
- Tamamlanma raporları

---

### 🔔 Bildirim Sistemi
![Notification System](./assets/screenshots/notification-system.png)

Sistem genelinde uyarı ve bildirim yönetimi.

**Özellikler:**
- Otomatik uyarı sistemi
- Kullanıcı bazlı bildirimler
- Acil durum duyuruları
- E-posta entegrasyonu
- Push notification desteği

---

### 📊 Raporlama ve Analiz
![Reports and Analytics](./assets/screenshots/reports-analytics.png)

Kapsamlı veri analizi ve rapor oluşturma sistemi.

**Özellikler:**
- PDF rapor oluşturma
- İstatistiksel analizler
- Grafik ve görselleştirmeler
- Trend analizleri
- Karşılaştırmalı raporlar

---

### ⚙️ Sistem Ayarları
![System Settings](./assets/screenshots/system-settings.png)

Sistem genelinde yapılandırma ve ayar yönetimi.

**Özellikler:**
- Kullanıcı profil ayarları
- Sistem yapılandırması
- API entegrasyon ayarları
- Güvenlik parametreleri
- Yedekleme ayarları

## 🚀 Kurulum

### Ön Gereksinimler

- **Node.js** (v18.0 veya üzeri)
- **PostgreSQL** (v14.0 veya üzeri) + PostGIS uzantısı
- **npm** veya **yarn** paket yöneticisi
- **Git** (versiyon kontrolü için)

### 1. Projeyi Klonlama

```bash
git clone https://github.com/yourusername/emergency-management.git
cd emergency-management
```

### 2. Bağımlılıkları Yükleme

```bash
npm install
# veya
yarn install
```

### 3. Veritabanı Kurulumu

```bash
# PostgreSQL'de veritabanı oluşturma
createdb emergency_management

# PostGIS uzantısını etkinleştirme
psql -d emergency_management -c "CREATE EXTENSION postgis;"
```

### 4. Ortam Değişkenlerini Ayarlama

`.env.local` dosyası oluşturun:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/emergency_management"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# External APIs
EARTHQUAKE_API_URL="https://api.example.com/earthquakes"
FIRE_API_URL="https://api.example.com/fires"
TSUNAMI_API_URL="https://api.example.com/tsunami"

# Map Services
MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

### 5. Veritabanı Şemasını Oluşturma

```bash
# Prisma migration
npx prisma db push

# Prisma client oluşturma
npx prisma generate
```

### 6. Başlangıç Verilerini Yükleme

```bash
# Coğrafi veriler (ülkeler, şehirler, ilçeler)
npm run seed:geography

# Kullanıcı rolleri ve izinler
npm run seed:auth

# Örnek veriler
npm run seed:demo
```

### 7. Uygulamayı Başlatma

```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm run build
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## ⚙️ Yapılandırma

### Cron Servisleri

Sistem, dış kaynaklardan veri almak için cron servisleri kullanır:

```typescript
// lib/services/cron.service.ts
export const cronService = {
  earthquakes: '*/5 * * * *',  // Her 5 dakika
  fires: '*/10 * * * *',       // Her 10 dakika
  tsunami: '*/15 * * * *'      // Her 15 dakika
};
```

### API Entegrasyonları

#### Deprem Verileri
- **AFAD**: Türkiye resmi deprem verileri
- **USGS**: Uluslararası deprem verileri
- **EMSC**: Avrupa deprem merkezi

#### Yangın Verileri
- **OGM**: Orman Genel Müdürlüğü
- **NASA FIRMS**: Uydu yangın tespiti
- **Copernicus**: Avrupa uydu sistemi

### Güvenlik Yapılandırması

```typescript
// lib/auth.ts
export const authOptions = {
  providers: [
    CredentialsProvider({
      // Kimlik doğrulama mantığı
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  callbacks: {
    jwt: ({ token, user }) => {
      // JWT token yapılandırması
    }
  }
};
```

## 📊 Veritabanı

### Şema Yapısı

Sistem, PostgreSQL + PostGIS kullanarak coğrafi verileri destekler:

```sql
-- Temel coğrafi tablolar
Countries (95 ülke)
├── Cities (8,740 şehir)
    ├── Districts (973 ilçe)
        └── Towns (kasabalar)

-- Operasyonel tablolar
Regions (Acil durum bölgeleri)
├── Users (Kullanıcılar)
├── Equipment (Ekipmanlar)
├── Warehouses (Depolar)
├── Tasks (Görevler)
└── Notifications (Bildirimler)

-- Olay tabloları
Earthquakes (Depremler)
Fires (Yangınlar)
TsunamiAlerts (Tsunami uyarıları)
```

### Veri İstatistikleri (2025-07-09)

- **📍 Coğrafi Kayıtlar**: 9,808 toplam
  - 🌍 Ülkeler: 95
  - 🏙️ Şehirler: 8,740 (Türkiye: 81 il)
  - 🏘️ İlçeler: 973 (Türkiye ilçeleri)

### Performans Optimizasyonları

```sql
-- Coğrafi indeksler
CREATE INDEX idx_earthquakes_location ON earthquakes USING GIST(location);
CREATE INDEX idx_cities_coordinates ON cities USING GIST(ST_Point(longitude, latitude));

-- Performans indeksleri
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

## 🔧 Teknolojiler

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Ant Design](https://ant.design/)** - UI component library
- **[Leaflet](https://leafletjs.com/)** - Interactive maps
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless functions
- **[Prisma](https://www.prisma.io/)** - Database ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[Node-cron](https://www.npmjs.com/package/node-cron)** - Scheduled tasks

### Database
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[PostGIS](https://postgis.net/)** - Spatial data extension
- **[Redis](https://redis.io/)** - Caching (opsiyonel)

### External APIs
- **AFAD API** - Türkiye deprem verileri
- **USGS API** - Uluslararası deprem verileri
- **NASA FIRMS** - Yangın tespiti
- **GeoNames** - Coğrafi veriler

### DevOps & Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Docker](https://www.docker.com/)** - Containerization

## 📸 Ekran Görüntüleri

### Ana Dashboard
![Dashboard Overview](./assets/screenshots/dashboard-overview.png)
*Sistem geneline ait özet bilgiler ve gerçek zamanlı veriler*

### Gerçek Zamanlı Harita
![Real-time Map](./assets/screenshots/realtime-map.png)
*Canlı deprem, yangın ve tsunami verilerinin harita görünümü*

### Bölge Yönetimi
![Region Management Detail](./assets/screenshots/region-management-detail.png)
*Acil durum bölgelerinin detaylı yönetimi ve harita kaplamaları*

### Personel Dashboard
![Personnel Dashboard](./assets/screenshots/personnel-dashboard.png)
*Personel yönetimi ve görev takip sistemi*

### Envanter Yönetimi
![Inventory Management](./assets/screenshots/inventory-management.png)
*Depo ve malzeme yönetimi sistemi*

### Mobil Görünüm
![Mobile View](./assets/screenshots/mobile-responsive.png)
*Responsive tasarım ve mobil uyumluluk*

## 🤝 Katkıda Bulunma

Bu projeye katkıda bulunmak isteyenler için:

1. **Fork** edin
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** edin (`git commit -m 'Add amazing feature'`)
4. **Push** edin (`git push origin feature/amazing-feature`)
5. **Pull Request** açın
   
Daha fazla bilgi için CONTRIBUTING.md ve CLA.md dosyalarını inceleyin.

### Geliştirme Kuralları

- TypeScript kullanın
- ESLint kurallarına uyun
- Test yazın (Jest + Testing Library)
- Commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) formatını kullanın

### Kod Kalitesi

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Testing
npm run test

# Build test
npm run build
```

## 📋 Roadmap

### v2.0 (Q3 2025)
- [ ] WebSocket entegrasyonu
- [ ] Real-time chat sistemi
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

### v2.1 (Q4 2025)
- [ ] AI-powered risk assessment
- [ ] Drone integration
- [ ] IoT sensor support
- [ ] Multi-language support

### v3.0 (Q1 2026)
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Advanced ML predictions
- [ ] International standards compliance

## 📄 Lisans

Bu yazılım, Apache 2.0 ve BSD 3-Clause lisansları altında sunulmaktadır. Kullanıcılar diledikleri lisansı seçerek kullanabilir. Her iki lisans da geliştirici Mustafa Barış Arslantaş’ın telif haklarının korunmasını ve adının projeyle ilişkilendirilmesini şart koşar.

## 📞 İletişim

- **Proje Sahibi**: Mustafa Barış Arslantaş (mailto:arslantas.m@gmail.com)
- **GitHub**: [https://github.com/ArslantasM/Acil-Durum-Yonetim-ve-Koordinasyon/](https://github.com/ArslantasM/Acil-Durum-Yonetim-ve-Koordinasyon/)
- **Dokümantasyon**: [Wiki sayfası](https://github.com/ArslantasM/Acil-Durum-Yonetim-ve-Koordinasyon/wiki)


🌟 Teşekkürler

Küresel düzeyde insanların yararına olacak bu projede fikir, geliştirme süreci ve katkı ortamını destekleyen tüm gönüllülere teşekkür ederim. 🙏


---

<div align="center">

**🚨 Acil Durum Yönetim ve Koordinasyon Sistemi (Emergency Management System)** ile Dünya'nın afet yönetiminde teknolojik dönüşüm

[⭐ Star](https://github.com/ArslantasM/Acil-Durum-Yonetim-ve-Koordinasyon) | [🐛 Bug Report](https://github.com/ArslantasM/Acil-Durum-Yonetim-ve-Koordinasyon/issues) | [💡 Feature Request](https://github.com/ArslantasM/Acil-Durum-Yonetim-ve-Koordinasyon/issues)

</div>






