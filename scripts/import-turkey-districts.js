const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importTurkeyDistricts() {
  try {
    console.log('🏘️ Türkiye ilçeleri import ediliyor...\n');
    
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
    
    // Türkiye şehirlerini (illeri) al
    const turkishCities = await prisma.city.findMany({
      where: { country_id: turkey.id },
      select: { id: true, name: true }
    });
    
    const cityMap = new Map();
    turkishCities.forEach(city => {
      cityMap.set(city.name, city.id);
    });
    
    console.log(`✅ ${turkishCities.length} Türkiye ili mapping oluşturuldu\n`);
    
    // İlçe verilerini oku
    console.log('📖 İlçe verileri okunuyor...');
    
    let districtsData;
    try {
      // Önce backup klasöründen dene
      const backupPath = path.join(__dirname, '../emergency-management-Backup 22052025/Türkiye_mulki_idare/districts.json');
      districtsData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      console.log(`✅ Backup klasöründen ${districtsData.length} ilçe yüklendi`);
    } catch (error) {
      try {
        // Sonra ana klasörden dene
        const mainPath = path.join(__dirname, '../Türkiye_mulki_idare/districts.json');
        districtsData = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
        console.log(`✅ Ana klasörden ${districtsData.length} ilçe yüklendi`);
      } catch (error2) {
        console.log('❌ İlçe verileri bulunamadı!');
        return;
      }
    }
    
    // Mevcut ilçeleri kontrol et
    const existingDistricts = await prisma.district.count({
      where: { country_id: turkey.id }
    });
    
    console.log(`📊 Mevcut ilçe sayısı: ${existingDistricts}\n`);
    
    // İlçeleri import et
    console.log('🏘️ İlçeler ekleniyor...');
    let districtCount = 0;
    let districtErrors = 0;
    let skipped = 0;
    
    for (const district of districtsData) {
      try {
        // İl ID'sini bul
        const cityId = cityMap.get(district.province);
        
        if (!cityId) {
          console.log(`⚠️ İl bulunamadı: ${district.province} - ${district.name}`);
          districtErrors++;
          continue;
        }
        
        // Aynı isimde ilçe var mı kontrol et
        const existingDistrict = await prisma.district.findFirst({
          where: {
            name: district.name,
            city_id: cityId
          }
        });
        
        if (existingDistrict) {
          skipped++;
          continue;
        }
        
        await prisma.district.create({
          data: {
            geonameid: parseInt(district.id) || 0,
            name: district.name,
            country_id: turkey.id,
            city_id: cityId,
            latitude: district.latitude || 0,
            longitude: district.longitude || 0,
            population: parseInt(district.population) || 0,
            area_sqkm: parseFloat(district.area) || null,
            timezone: 'Europe/Istanbul',
            admin2_code: district.postalCode || null
          }
        });
        
        districtCount++;
        
        if (districtCount % 50 === 0) {
          console.log(`✅ ${districtCount} ilçe eklendi...`);
        }
        
      } catch (error) {
        console.log(`❌ İlçe eklenirken hata: ${district.name} - ${error.message}`);
        districtErrors++;
      }
    }
    
    console.log(`\n🏘️ İlçe import tamamlandı:`);
    console.log(`✅ ${districtCount} yeni ilçe eklendi`);
    console.log(`⚠️ ${skipped} ilçe zaten mevcuttu`);
    console.log(`❌ ${districtErrors} hata oluştu`);
    
    // Son durum
    const finalDistricts = await prisma.district.count({
      where: { country_id: turkey.id }
    });
    
    console.log(`\n📊 Toplam Türkiye ilçeleri: ${finalDistricts}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importTurkeyDistricts(); 