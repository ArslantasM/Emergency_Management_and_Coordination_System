# Acil Durum Yönetim ve Koordinasyon Sistemi (Emergency Management System)

Acil Durum Yönetim ve Koordinasyon uygulaması uçtan uca "kurumsal yapıda" tam bir afet yönetim uygulamasıdır. PostgreSQL, PostGIS, Next.js ve Python Flask ile geliştirilmiş, gerçek zamanlı afet verilerini toplayan ve görselleştiren açık kaynaklı bir koordinasyon platformudur. Küresel düzeyde deprem, yangın ve tsunami verilerini takip ederek afet yönetimini kolaylaştırmayı hedefler. Kurumsal yapıda tasarlanmış sistem bütüncül olarak afet yönetimini kolaylaştırmayı ve birimler arasında koordinasyonu arttırmayı hedefler.

![Ana Dashboard](assets/screenshots/dashboard-main.png)

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.0-0170FE?style=flat-square&logo=ant-design)](https://ant.design/)
[![Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![BSD 3-Clause](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## İçindekiler

- [ Proje Hakkında](#-proje-hakkında)
- [ Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
- [ Sistem Mimarisi](#️-sistem-mimarisi)
- [ Sistem Modülleri ve Ekran Görüntüleri](#-sistem-modülleri-ve-ekran-görüntüleri)
- [ Kurulum](#-kurulum)
- [ Teknoloji Yığını](#-teknoloji-yığını)
- [ API Endpoint'leri](#-api-endpointleri)
- [ Veritabanı Şeması](#️-veritabanı-şeması)
- [ Güvenlik ve Roller](#-güvenlik-ve-roller)
- [ Geliştirme Süreci](#-geliştirme-süreci)
- [ Roadmap](#-roadmap)
- [ Katkı Sağlama](#-katkı-sağlama)
- [ Lisans](#-lisans)
- [ İletişim](#-iletişim)

##  Proje Hakkında

**Acil Durum Yönetim ve Koordinasyon Sistemi**, dünya çapında afet yönetimi için geliştirilmiş kapsamlı bir açık kaynaklı platformdur. Modern web teknolojileri kullanılarak oluşturulan sistem, küresel düzeyde deprem, yangın ve tsunami verilerini gerçek zamanlı olarak takip eder ve afet yönetimini kolaylaştırır.

###  Ana Hedefler

- ** Küresel Kapsam**: Dünya genelinde afet verilerinin takibi ve yönetimi
- ** Gerçek Zamanlı İzleme**: Canlı deprem, yangın ve tsunami verilerinin takibi
- ** Kurumsal Yapı**: Büyük organizasyonlar için ölçeklenebilir mimari
- ** Koordinasyon**: Birimler arası etkili iletişim ve koordinasyon
- ** Veri Analizi**: Kapsamlı raporlama ve analiz araçları

##  Öne Çıkan Özellikler

-  **Küresel veri entegrasyonu**: NASA FIRMS, USGS, EMSC, Tsunami Alert servisleri
-  **Harita tabanlı görselleştirme**: Mapbox GL JS ve Leaflet destekli dashboard
-  **Depo ve envanter yönetimi**: Detaylı kategori, altyapı ve şart sistemleri
-  **Ekipman ve envanter takibi**: Marka, model, seri numarası ve bakım kayıtları ile izleme
-  **Konteyner ve çadır kent yönetimi**: Barınma alanları için altyapı ve lojistik desteği
-  **Personel ve gönüllü yönetimi**: Rol bazlı atama, iletişim ve görev eşleştirme
-  **Görev planlama ve yönetimi**: Acil durum operasyonlarının zamanlaması ve takibi
-  **Bölge yönetimi**: Hiyerarşik coğrafi yapı, acil durum seviyelerine göre renkli harita kaplamaları
-  **Log yönetimi**: Sistem işlemlerinin denetimi ve hata takibi
-  **Raporlama araçları**: Veri analizine dayalı görsel ve metinsel çıktılar
-  **Ayarlar modülü**: Sistem yapılandırması ve kullanıcı tercihleri yönetimi
-  **Güvenlik yapısı**: Rol ve yetki tabanlı erişim kontrolü (RBAC)
-  **PostGIS ile coğrafi veri analizi**: 31+ tablo ve gelişmiş sorgu desteği
-  **Akıllı önbellekleme sistemi**: JSON dosya tabanlı hızlı veri erişimi

##  Sistem Mimarisi

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Veritabanı    │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │   + PostGIS     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Harita Servisi │    │  Dış API'ler    │    │  Cache Sistemi  │
│ (Mapbox/Leaflet)│    │ (NASA/USGS/EMSC)│    │     (JSON)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

###  Veri Akışı
1. **Dış API'ler** → Cron servisleri → Cache → Veritabanı
2. **Kullanıcı İstekleri** → Next.js API Routes → Prisma ORM → PostgreSQL
3. **Gerçek Zamanlı Güncellemeler** → WebSocket → Frontend Bileşenleri

##  Sistem Modülleri ve Ekran Görüntüleri

###  Ana Dashboard
Ana kontrol paneli, sistem genelindeki kritik verilerin gerçek zamanlı görüntülenmesi için tasarlanmıştır.

![Ana Dashboard](assets/screenshots/dashboard-overview.png)

**Özellikler:**
- Gerçek zamanlı afet verileri (deprem, yangın, tsunami)
- İstatistiksel özet kartları
- Hızlı erişim menüsü
- Bildirim merkezi
- Sistem durumu göstergeleri

###  Harita Modülü
Küresel afet verilerinin görselleştirildiği interaktif harita sistemi.

![Harita Modülü](assets/screenshots/map-module.png)

**Özellikler:**
- Mapbox GL JS ve Leaflet entegrasyonu
- Gerçek zamanlı deprem, yangın ve tsunami verileri
- Katmanlı harita görünümleri
- Coğrafi filtreleme ve arama
- Popup detay bilgileri

###  Bölge Yönetimi
Hiyerarşik coğrafi yapının yönetildiği ve acil durum seviyelerinin belirlendiği modül.

![Bölge Yönetimi](assets/screenshots/regions-management.png)

**Özellikler:**
- Ülke, şehir, ilçe hiyerarşisi
- Acil durum seviye ataması (CRITICAL, HIGH, MEDIUM, LOW)
- Renkli harita kaplamaları
- Coğrafi koordinat yönetimi
- Bölge bazlı istatistikler

###  Personel Yönetimi
Kurumsal personel yapısının organize edildiği ve görev atamalarının yapıldığı sistem.

![Personel Yönetimi](assets/screenshots/personnel-management.png)

**Özellikler:**
- Rol bazlı personel kayıtları
- Departman ve pozisyon atamaları
- İletişim bilgileri yönetimi
- Görev geçmişi takibi
- Performans değerlendirme

### Depo Yönetimi
Afet malzemelerinin depolanması ve dağıtımının koordine edildiği kapsamlı envanter sistemi.

![Depo Yönetimi](assets/screenshots/warehouse-management.png)

**Özellikler:**
- Çoklu depo yönetimi
- Stok takibi ve uyarı sistemi
- Transfer ve nakliye koordinasyonu
- Depo personeli yönetimi
- Araç filosu takibi
- Detaylı raporlama

###  Ekipman Yönetimi
Acil durum ekipmanlarının takibi, bakımı ve dağıtımının yönetildiği modül.

![Ekipman Yönetimi](assets/screenshots/equipment-management.png)

**Özellikler:**
- Ekipman kategorileri ve alt kategoriler
- Marka, model, seri numarası takibi
- Bakım planlaması ve geçmişi
- Kullanım durumu izleme
- Rezervasyon sistemi

###  Envanter Yönetimi
Genel malzeme ve kaynak envanterinin detaylı takip edildiği sistem.

![Envanter Yönetimi](assets/screenshots/inventory-management.png)

**Özellikler:**
- Kategori bazlı envanter sınıflandırması
- Birim ve miktar takibi
- Son kullanma tarihi uyarıları
- Minimum stok limitleri
- Tedarikçi bilgileri

###  Konteyner/Çadır Kent Yönetimi
Geçici barınma alanlarının kurulumu ve yönetiminin koordine edildiği kapsamlı sistem.

![Konteyner Kent Yönetimi](assets/screenshots/container-camps.png)

**Özellikler:**
- Kent kurulum ve planlama
- Altyapı yönetimi (su, elektrik, kanalizasyon)
- Sakin kayıt ve takibi
- Hizmet koordinasyonu (sağlık, eğitim, sosyal)
- Kent personeli yönetimi
- Lojistik ve malzeme dağıtımı

###  Görev Yönetimi
Acil durum operasyonlarının planlanması ve takip edildiği görev koordinasyon sistemi.

![Görev Yönetimi](assets/screenshots/task-management.png)

**Özellikler:**
- Görev oluşturma ve atama
- Öncelik seviyesi belirleme
- İlerleme durumu takibi
- Zaman çizelgesi yönetimi
- Görev bağımlılıkları
- Tamamlanma raporları

###  Bildirim Merkezi
Sistem genelindeki önemli olayların ve uyarıların yönetildiği merkezi bildirim sistemi.

![Bildirim Merkezi](assets/screenshots/notifications.png)

**Özellikler:**
- Gerçek zamanlı bildirimler
- Öncelik bazlı sınıflandırma
- Otomatik uyarı sistemleri
- Bildirim geçmişi
- Kişiselleştirilmiş uyarılar

###  Gönüllü Yönetimi
Gönüllü koordinasyonu ve eğitim programlarının yönetildiği sistem.

![Gönüllü Yönetimi](assets/screenshots/volunteers-management.png)

**Özellikler:**
- Gönüllü kayıt ve profil yönetimi
- Beceri ve sertifika takibi
- Eğitim modülü ve programları
- Görev eşleştirme sistemi
- Gönüllü mağazası
- Grup organizasyonu

###  Raporlama Sistemi
Sistem verilerinin analiz edilip raporlandığı kapsamlı raporlama modülü.

![Raporlama Sistemi](assets/screenshots/reports-module.png)

**Özellikler:**
- Özelleştirilebilir rapor şablonları
- Grafik ve görsel analiz araçları
- PDF ve Excel export
- Zamanlı rapor oluşturma
- İstatistiksel analizler
- Performans metrikleri

###  Planlama Modülü
Afet öncesi hazırlık ve müdahale planlarının oluşturulduğu stratejik planlama sistemi.

![Planlama Modülü](assets/screenshots/planning-module.png)

**Özellikler:**
- Senaryo tabanlı planlama
- Kaynak tahsisi planlaması
- Zaman çizelgesi oluşturma
- Risk değerlendirme matrisleri
- Plan versiyonlama
- Simülasyon desteği

###  Log Yönetimi
Sistem işlemlerinin kaydedildiği ve denetlendiği log takip sistemi.

![Log Yönetimi](assets/screenshots/logging-module.png)

**Özellikler:**
- Detaylı sistem logları
- Kullanıcı işlem geçmişi
- Hata takibi ve analizi
- Güvenlik logları
- Performans metrikleri
- Log filtreleme ve arama

###  Sistem Ayarları
Sistem yapılandırması ve kullanıcı tercihlerinin yönetildiği ayarlar modülü.

![Sistem Ayarları](assets/screenshots/settings-module.png)

**Özellikler:**
- Kullanıcı profil ayarları
- Sistem yapılandırması
- Bildirim tercihleri
- Güvenlik ayarları
- Yedekleme yapılandırması
- API konfigürasyonu

###  Profil Yönetimi
Kullanıcı hesap bilgilerinin ve kişisel tercihlerinin yönetildiği profil sistemi.

![Profil Yönetimi](assets/screenshots/profile-management.png)

**Özellikler:**
- Kişisel bilgi güncelleme
- Şifre değiştirme
- Profil fotoğrafı yönetimi
- İletişim tercihleri
- Güvenlik ayarları
- Hesap geçmişi

##  Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+ (PostGIS ile)
- Git

### Projenin Başlatılması

```bash
git clone <repository-url>
cd emergency-management
npm install
npx prisma generate
npx prisma db push
node scripts/add-users.js
npm run dev
```

### Veritabanı Kurulumu

```bash
createdb emergency_management
psql -d emergency_management -c "CREATE EXTENSION postgis;"
psql -d emergency_management -c "CREATE EXTENSION postgis_topology;"
```

### Ortam Değişkenleri

`.env.local` dosyası oluşturun:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/emergency_management"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

##  Teknoloji Yığını

| Katman            | Teknoloji               |
|-------------------|-------------------------|
| Backend           | Python Flask API        |
| Frontend          | Next.js (React tabanlı) |
| Veritabanı        | PostgreSQL + PostGIS    |
| ORM               | Prisma ORM              |
| Harita Sistemi    | Mapbox GL JS, Leaflet   |
| Kimlik Doğrulama  | NextAuth.js             |
| UI Framework      | Ant Design              |
| Stil              | Tailwind CSS            |

##  API Endpoint'leri

- `/api/earthquakes`: Deprem verisi
- `/api/fires/all`: Yangın verisi
- `/api/tsunami-alerts`: Tsunami uyarıları
- `/api/notifications`: Bildirim servisi
- `/api/cache/earthquakes`: Önbellekten deprem verisi
- `/api/cache/fires`: Önbellekten yangın verisi
- `/api/regions`: Bölge yönetimi
- `/api/personnel`: Personel yönetimi
- `/api/equipment`: Ekipman yönetimi
- `/api/warehouse`: Depo yönetimi
- `/api/tasks`: Görev yönetimi

##  Veritabanı Şeması

Sistem 31+ tablo ile kapsamlı bir veri modeli kullanmaktadır:

### Ana Tablolar
- `users`: Kullanıcı yönetimi
- `regions`: Bölge hiyerarşisi
- `equipment`: Ekipman takibi
- `warehouse`: Depo yönetimi
- `inventory`: Envanter sistemi
- `tasks`: Görev yönetimi
- `notifications`: Bildirim sistemi

### Coğrafi Tablolar (PostGIS)
- `geonames`: Küresel coğrafi veriler (95 ülke, 8,740 şehir, 973 ilçe)
- `earthquake_zones`: Deprem bölgeleri
- `coordinates`: Koordinat verileri

### Veri İstatistikleri
- ** Toplam Coğrafi Kayıt**: 9,808
- ** Ülke Sayısı**: 95
- ** Şehir Sayısı**: 8,740
- ** İlçe Sayısı**: 973

##  Güvenlik ve Roller

Sistem rol bazlı erişim kontrolü (RBAC) kullanmaktadır:

- **ADMIN**: Tam sistem erişimi
- **MANAGER**: Kurum yönetimi
- **REGIONAL_MANAGER**: Bölgesel yönetim
- **STAFF**: Operasyonel personel
- **VOLUNTEER**: Gönüllü kullanıcılar

##  Geliştirme Süreci

### Kod Standardları
- TypeScript kullanımı zorunlu
- ESLint ve Prettier konfigürasyonu
- Conventional Commits standardı
- Kod review süreci

### Test Stratejisi
- Unit testler (Jest)
- Integration testler
- E2E testler (Playwright)
- API testleri

##  Roadmap

### v2.0 Hedefleri
- [ ] Mobil uygulama geliştirme
- [ ] AI destekli risk analizi
- [ ] Blockchain tabanlı kaynak takibi
- [ ] IoT sensör entegrasyonu
- [ ] Çoklu dil desteği

### v1.5 Hedefleri (Mevcut)
- [x] Gerçek zamanlı harita sistemi
- [x] Kapsamlı envanter yönetimi
- [x] Rol bazlı erişim kontrolü
- [x] PDF raporlama sistemi
- [x] Bildirim merkezi

##  Katkı Sağlama

Katkı sunmak için şu adımları izleyin:

1. Projeyi fork edin
2. Yeni bir feature branch oluşturun: `git checkout -b feature/YeniOzellik`
3. Değişikliklerinizi commit edin: `git commit -m 'Yeni özellik eklendi'`
4. Branch'i push edin: `git push origin feature/YeniOzellik`
5. Pull Request açın

Daha fazla bilgi için `CONTRIBUTING.md` ve `CLA.md` dosyalarını inceleyin.

##  Lisans

Bu yazılım **Apache 2.0** ve **BSD 3-Clause** lisansları altında sunulmaktadır. Kullanıcılar diledikleri lisansı seçerek kullanabilir.

### Apache 2.0 Lisansı
Apache 2.0 lisansı, ticari ve açık kaynaklı projelerde kullanım için geniş izinler sağlar. Patent koruması ve katkı sağlayıcılar için yasal koruma içerir.

### BSD 3-Clause Lisansı
BSD 3-Clause lisansı, minimal kısıtlamalarla yeniden dağıtım ve kullanım izni verir. Orijinal telif hakkı bildirimi ve lisans metninin korunmasını gerektirir.

**Her iki lisans da geliştirici Mustafa Barış Arslantaş'ın telif haklarının korunmasını ve adının projeyle ilişkilendirilmesini şart koşar.**

Detaylı lisans metinleri için:
- [Apache 2.0 License](LICENSE-APACHE)
- [BSD 3-Clause License](LICENSE-BSD)

##  İletişim

Proje hakkında sorularınız için GitHub Issues bölümünden veya doğrudan iletişime geçebilirsiniz:

- **GitHub**: [https://github.com/ArslantasM/emergency-management](https://github.com/ArslantasM/emergency-management)
- **E-posta**: arslantas.m@gmail.com
- **Telefon**: +90 542 559 69 46

##  Teşekkürler

Küresel düzeyde insanların yararına olacak bu projede fikir, geliştirme süreci ve katkı ortamını destekleyen tüm gönüllülere teşekkür ederim. 

---

<div align="center">

** Acil Durum Yönetim ve Koordinasyon Sistemi** ile dünya çapında afet yönetiminde teknolojik dönüşüm

[lh Star](https://github.com/ArslantasM/emergency-management) | [ Bug Report](https://github.com/ArslantasM/emergency-management/issues) | [ Feature Request](https://github.com/ArslantasM/emergency-management/issues)

</div>






