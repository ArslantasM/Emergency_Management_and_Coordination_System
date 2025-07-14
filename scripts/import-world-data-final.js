const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// ISO ülke kodlarını tam ülke adlarıyla eşleştiren mapping
const countryCodeMapping = {
  'RO': 'Romania',
  'RS': 'Republic of Serbia', 
  'RU': 'Russian Federation',
  'RW': 'Republic of Rwanda',
  'SA': 'Kingdom of Saudi Arabia',
  'SE': 'Kingdom of Sweden',
  'SN': 'Republic of Senegal',
  'SO': 'Federal Republic of Somalia',
  'TH': 'Kingdom of Thailand',
  'TN': 'Republic of Tunisia',
  'TR': 'Republic of Turkey',
  'TZ': 'United Republic of Tanzania',
  'UA': 'Ukraine',
  'UG': 'Republic of Uganda',
  'US': 'United States of America',
  'VE': 'Bolivarian Republic of Venezuela',
  'VN': 'Socialist Republic of Viet Nam',
  'YE': 'Republic of Yemen',
  'ZA': 'Republic of South Africa',
  'ZW': 'Republic of Zimbabwe'
};

async function importWorldData() {
  try {
    console.log('🌍 Dünya coğrafi verileri import ediliyor...\n');
    
    // Önce ülke mapping tablosunu oluştur
    console.log('📋 Ülke mapping tablosu oluşturuluyor...');
    const countries = await prisma.country.findMany({
      select: { id: true, name: true, iso2: true }
    });
    
    const countryMap = new Map();
    const countryByIso = new Map();
    
    countries.forEach(country => {
      countryMap.set(country.name, country.id);
      if (country.iso2) {
        countryByIso.set(country.iso2, country.id);
      }
    });
    
    console.log(`✅ ${countries.length} ülke mapping oluşturuldu\n`);
    
    // Geonames dosyasını oku
    console.log('📖 Geonames dosyası okunuyor...');
    const geonamesFile = JSON.parse(fs.readFileSync('data/geonames.json', 'utf8'));
    const geonamesData = geonamesFile.provinces || [];
    console.log(`✅ ${geonamesData.length} kayıt yüklendi\n`);
    
    // Şehir mapping tablosunu oluştur
    console.log('🏙️ Şehir mapping tablosu oluşturuluyor...');
    const cities = await prisma.city.findMany({
      select: { id: true, name: true, country_id: true }
    });
    
    const cityMap = new Map();
    cities.forEach(city => {
      const key = `${city.name}-${city.country_id}`;
      cityMap.set(key, city.id);
    });
    
    console.log(`✅ ${cities.length} şehir mapping oluşturuldu\n`);
    
    // İlçe verilerini filtrele ve import et
    console.log('🏘️ İlçe verileri işleniyor...');
    const districts = geonamesData.filter(item => 
      item.feature_code === 'ADM2' && 
      item.population >= 1000
    );
    
    let districtCount = 0;
    let districtErrors = 0;
    
    for (const district of districts) {
      try {
        // Ülke ID'sini bul
        let countryId = countryByIso.get(district.country_code);
        
        // ISO kod ile bulamazsa, mapping tablosunu kullan
        if (!countryId && countryCodeMapping[district.country_code]) {
          const countryName = countryCodeMapping[district.country_code];
          countryId = countryMap.get(countryName);
        }
        
        if (!countryId) {
          console.log(`⚠️ Ülke bulunamadı: ${district.country_code} - ${district.name}`);
          districtErrors++;
          continue;
        }
        
        // Admin1 kodunu kullanarak şehir bul
        let cityId = null;
        if (district.admin1_code) {
          // Admin1 koduna göre şehir ara
          const potentialCities = cities.filter(city => 
            city.country_id === countryId
          );
          
          if (potentialCities.length > 0) {
            // İlk uygun şehri seç
            cityId = potentialCities[0].id;
          }
        }
        
        await prisma.district.create({
          data: {
            name: district.name,
            country_id: countryId,
            city_id: cityId, // Opsiyonel
            latitude: parseFloat(district.latitude),
            longitude: parseFloat(district.longitude),
            population: parseInt(district.population) || 0,
            timezone: district.timezone || null,
            admin1_code: district.admin1_code || null,
            admin2_code: district.admin2_code || null
          }
        });
        
        districtCount++;
        
        if (districtCount % 100 === 0) {
          console.log(`✅ ${districtCount} ilçe eklendi...`);
        }
        
      } catch (error) {
        console.log(`❌ İlçe eklenirken hata: ${district.name} - ${error.message}`);
        districtErrors++;
      }
    }
    
    console.log(`\n🏘️ İlçe import tamamlandı: ${districtCount} başarılı, ${districtErrors} hata\n`);
    
    // Kasaba verilerini filtrele ve import et
    console.log('🏠 Kasaba verileri işleniyor...');
    const towns = geonamesData.filter(item => 
      ['PPL', 'PPLA3', 'PPLA4', 'PPLC'].includes(item.feature_code) && 
      item.population >= 500 && 
      item.population < 50000
    );
    
    let townCount = 0;
    let townErrors = 0;
    
    for (const town of towns) {
      try {
        // Ülke ID'sini bul
        let countryId = countryByIso.get(town.country_code);
        
        if (!countryId && countryCodeMapping[town.country_code]) {
          const countryName = countryCodeMapping[town.country_code];
          countryId = countryMap.get(countryName);
        }
        
        if (!countryId) {
          townErrors++;
          continue;
        }
        
        // Şehir ve ilçe bul (opsiyonel)
        let cityId = null;
        let districtId = null;
        
        if (town.admin1_code) {
          const potentialCities = cities.filter(city => 
            city.country_id === countryId
          );
          
          if (potentialCities.length > 0) {
            cityId = potentialCities[0].id;
          }
        }
        
        await prisma.town.create({
          data: {
            name: town.name,
            country_id: countryId,
            city_id: cityId,
            district_id: districtId,
            latitude: parseFloat(town.latitude),
            longitude: parseFloat(town.longitude),
            population: parseInt(town.population) || 0,
            timezone: town.timezone || null,
            admin1_code: town.admin1_code || null,
            admin2_code: town.admin2_code || null
          }
        });
        
        townCount++;
        
        if (townCount % 200 === 0) {
          console.log(`✅ ${townCount} kasaba eklendi...`);
        }
        
      } catch (error) {
        townErrors++;
      }
    }
    
    console.log(`\n🏠 Kasaba import tamamlandı: ${townCount} başarılı, ${townErrors} hata\n`);
    
    console.log('🎉 Import işlemi tamamlandı!');
    console.log(`✅ Toplam ${districtCount + townCount} kayıt eklendi`);
    console.log(`❌ ${districtErrors + townErrors} hata oluştu`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importWorldData(); 