const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importProvinces() {
  try {
    console.log('🌍 Provinces verileri import ediliyor...\n');
    
    // Türkiye ID'sini bul
    const turkey = await prisma.country.findFirst({
      where: { 
        OR: [
          { name: 'Republic of Turkey' },
          { name: 'Turkey' },
          { iso2: 'TR' }
        ]
      }
    });
    
    if (!turkey) {
      console.log('❌ Türkiye bulunamadı!');
      return;
    }
    
    console.log(`✅ Türkiye bulundu: ${turkey.name} (ID: ${turkey.id})\n`);
    
    // Geonames dosyasını oku
    console.log('📖 Geonames dosyası okunuyor...');
    const geonamesFile = JSON.parse(fs.readFileSync('data/geonames.json', 'utf8'));
    const provinces = geonamesFile.provinces || [];
    console.log(`✅ ${provinces.length} province kaydı yüklendi\n`);
    
    // Şehir mapping tablosunu oluştur
    console.log('🏙️ Türkiye şehir mapping tablosu oluşturuluyor...');
    const cities = await prisma.city.findMany({
      where: { country_id: turkey.id },
      select: { id: true, name: true }
    });
    
    const cityMap = new Map();
    cities.forEach(city => {
      cityMap.set(city.name, city.id);
    });
    
    console.log(`✅ ${cities.length} Türkiye şehri mapping oluşturuldu\n`);
    
    // İlçe verilerini import et
    console.log('🏘️ İlçe verileri işleniyor...');
    let districtCount = 0;
    let districtErrors = 0;
    
    for (const province of provinces) {
      try {
        // Şehir ID'sini bul
        let cityId = cityMap.get(province.name);
        
        // Şehir bulunamazsa null bırak
        if (!cityId) {
          console.log(`⚠️ Şehir bulunamadı: ${province.name}`);
        }
        
        await prisma.district.create({
          data: {
            geonameid: parseInt(province.geonameid) || 0,
            name: province.name,
            country_id: turkey.id,
            city_id: cityId, // Opsiyonel
            latitude: parseFloat(province.latitude) || 0,
            longitude: parseFloat(province.longitude) || 0,
            population: parseInt(province.population) || 0,
            timezone: province.timezone || null,
            admin2_code: province.admin2_code || null
          }
        });
        
        districtCount++;
        
        if (districtCount % 10 === 0) {
          console.log(`✅ ${districtCount} ilçe eklendi...`);
        }
        
      } catch (error) {
        console.log(`❌ İlçe eklenirken hata: ${province.name} - ${error.message}`);
        districtErrors++;
      }
    }
    
    console.log(`\n🏘️ İlçe import tamamlandı: ${districtCount} başarılı, ${districtErrors} hata\n`);
    
    console.log('🎉 Import işlemi tamamlandı!');
    console.log(`✅ Toplam ${districtCount} ilçe eklendi`);
    console.log(`❌ ${districtErrors} hata oluştu`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importProvinces(); 