# 🌍 Acil Durum Yönetim ve Koordinasyon Sistemi (Emergency Management System )
Acil Durum Yönetim ve Koordinasyon uygulaması uçtan uca "kurumsal yapıda" tam bir afet yönetim uygulamasıdır.
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


## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+ (PostGIS ile)
- Git



## 🧪 Teknoloji Yığını

| Katman            | Teknoloji               |
|-------------------|-------------------------|
| Backend           | Python Flask API        |
| Frontend          | Next.js (React tabanlı) |
| Veritabanı        | PostgreSQL + PostGIS    |
| ORM               | Prisma ORM              |
| Harita Sistemi    | Mapbox GL JS, Leaflet   |
| Kimlik Doğrulama  | NextAuth.js             |





🌐 API Endpoint'leri
- /api/earthquakes: Deprem verisi
- /api/fires/all: Yangın verisi
- /api/tsunami-alerts: Tsunami uyarıları
- /api/notifications: Bildirim servisi
- /api/cache/earthquakes: Önbellekten deprem verisi
- /api/cache/fires: Önbellekten yangın verisi

🤝 Katkı Sağlama
Katkı sunmak için şu adımları izleyin:
- Projeyi fork edin
- Yeni bir feature branch oluşturun: git checkout -b feature/YeniOzellik
- Değişikliklerinizi commit edin: git commit -m 'Yeni özellik eklendi'
- Branch'i push edin: git push origin feature/YeniOzellik
- Pull Request açın
Daha fazla bilgi için CONTRIBUTING.md ve CLA.md dosyalarını inceleyin.

🔏 Lisans Bilgisi

Bu yazılım, Apache 2.0 ve BSD 3-Clause lisansları altında sunulmaktadır. Kullanıcılar diledikleri lisansı seçerek kullanabilir. Her iki lisans da geliştirici Mustafa Barış Arslantaş’ın telif haklarının korunmasını ve adının projeyle ilişkilendirilmesini şart koşar.

📞 İletişim

Proje hakkında sorularınız için GitHub Issues bölümünden veya doğrudan şu numaradan iletişime geçebilirsiniz: +90 542 559 69 46

📸 Demo Görüntüler (Opsiyonel)

Dashboard Haritası

🌟 Teşekkürler

Küresel düzeyde insanların yararına olacak bu projede fikir, geliştirme süreci ve katkı ortamını destekleyen tüm gönüllülere teşekkür ederim. 🙏


### Projenin Başlatılması
```bash
git clone <repository-url>
cd emergency-management
npm install
npx prisma generate
npx prisma db push
node scripts/add-users.js
npm run dev

### Veritabanı Kurulumu

```bash
createdb emergency_management
psql -d emergency_management -c "CREATE EXTENSION postgis;"
psql -d emergency_management -c "CREATE EXTENSION postgis_topology;"
