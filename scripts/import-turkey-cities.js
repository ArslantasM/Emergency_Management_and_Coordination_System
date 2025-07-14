const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importTurkeyCities() {
  try {
    console.log('🇹🇷 Türkiye illeri (şehirler) import ediliyor...\n');
    
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
    
    // Mevcut Türkiye şehirlerini kontrol et
    const existingCities = await prisma.city.findMany({
      where: { country_id: turkey.id },
      select: { name: true }
    });
    
    console.log(`📊 Mevcut Türkiye şehirleri: ${existingCities.length}\n`);
    
    // Geonames dosyasını oku
    console.log('📖 Geonames dosyası okunuyor...');
    const geonamesFile = JSON.parse(fs.readFileSync('data/geonames.json', 'utf8'));
    const provinces = geonamesFile.provinces || [];
    console.log(`✅ ${provinces.length} il kaydı yüklendi\n`);
    
    // Türkiye illerini City tablosuna ekle
    console.log('🏙️ İller şehir olarak ekleniyor...');
    let cityCount = 0;
    let cityErrors = 0;
    let skipped = 0;
    
    for (const province of provinces) {
      try {
        // Aynı isimde şehir var mı kontrol et
        const existingCity = existingCities.find(city => 
          city.name.toLowerCase() === province.name.toLowerCase()
        );
        
        if (existingCity) {
          console.log(`⚠️ Zaten mevcut: ${province.name}`);
          skipped++;
          continue;
        }
        
        await prisma.city.create({
          data: {
            geonameid: parseInt(province.geonameid) || 0,
            name: province.name,
            asciiname: province.asciiname || province.name,
            country_id: turkey.id,
            latitude: parseFloat(province.latitude) || 0,
            longitude: parseFloat(province.longitude) || 0,
            population: parseInt(province.population) || 0,
            timezone: province.timezone || 'Europe/Istanbul',
            admin1_code: province.admin1_code || null
          }
        });
        
        cityCount++;
        
        if (cityCount % 10 === 0) {
          console.log(`✅ ${cityCount} il eklendi...`);
        }
        
      } catch (error) {
        console.log(`❌ İl eklenirken hata: ${province.name} - ${error.message}`);
        cityErrors++;
      }
    }
    
    console.log(`\n🏙️ İl import tamamlandı:`);
    console.log(`✅ ${cityCount} yeni il eklendi`);
    console.log(`⚠️ ${skipped} il zaten mevcuttu`);
    console.log(`❌ ${cityErrors} hata oluştu`);
    
    // Son durum
    const finalCities = await prisma.city.findMany({
      where: { country_id: turkey.id },
      select: { name: true }
    });
    
    console.log(`\n📊 Toplam Türkiye şehirleri: ${finalCities.length}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importTurkeyCities(); 