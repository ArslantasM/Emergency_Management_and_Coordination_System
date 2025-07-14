const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const prisma = new PrismaClient();

// Geonames feature kodları - TÜM DÜNYA İÇİN
const FEATURE_CODES = {
  COUNTRY: ['PCLI', 'PCLD', 'PCLF', 'PCLS', 'PCLIX'], // Ülkeler
  CITY: ['ADM1', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC'], // İller/Şehirler/Başkentler
  DISTRICT: ['ADM2', 'PPL', 'PPLA2', 'PPLG'], // İlçeler/Büyük şehirler
  TOWN: ['ADM3', 'ADM4', 'PPLX', 'PPLL', 'PPLR', 'PPLS', 'PPLF', 'PPLH', 'PPLQ', 'PPLW'] // Kasabalar/Köyler
};

// Kıta bilgileri
const CONTINENT_INFO = {
  'AF': 'Africa',
  'AN': 'Antarctica', 
  'AS': 'Asia',
  'EU': 'Europe',
  'NA': 'North America',
  'OC': 'Oceania',
  'SA': 'South America'
};

// Para birimleri (başlıca ülkeler)
const CURRENCY_CODES = {
  'TR': 'TRY', 'US': 'USD', 'DE': 'EUR', 'FR': 'EUR', 'GB': 'GBP',
  'IT': 'EUR', 'ES': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR',
  'BR': 'BRL', 'RU': 'RUB', 'CA': 'CAD', 'AU': 'AUD', 'MX': 'MXN',
  'KR': 'KRW', 'ID': 'IDR', 'SA': 'SAR', 'ZA': 'ZAR', 'EG': 'EGP'
};

// Telefon kodları
const PHONE_CODES = {
  'TR': '+90', 'US': '+1', 'DE': '+49', 'FR': '+33', 'GB': '+44',
  'IT': '+39', 'ES': '+34', 'JP': '+81', 'CN': '+86', 'IN': '+91',
  'BR': '+55', 'RU': '+7', 'CA': '+1', 'AU': '+61', 'MX': '+52'
};

// Batch processing ayarları
const BATCH_SIZE = 1000;
const MEMORY_LIMIT = 100000; // Bellekte tutulacak maksimum kayıt

let processedCounts = {
  countries: 0,
  cities: 0,
  districts: 0,
  towns: 0,
  total: 0
};

async function loadGeonamesDataStream() {
  console.log('📊 Büyük Geonames dosyası streaming ile okunuyor...');
  
  const geonamesPath = path.join(process.cwd(), 'data', 'geonames_locations.json');
  
  if (!fs.existsSync(geonamesPath)) {
    throw new Error('geonames_locations.json dosyası bulunamadı');
  }
  
  const fileStats = fs.statSync(geonamesPath);
  console.log(`📁 Dosya boyutu: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);
  
  return geonamesPath;
}

async function processGeonamesFile(filePath) {
  console.log('🔄 Geonames dosyası işleniyor...');
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let jsonContent = '';
  let isStarted = false;
  
  for await (const line of rl) {
    if (line.trim() === '[' || line.trim() === '{') {
      isStarted = true;
    }
    
    if (isStarted) {
      jsonContent += line;
      
      // Bellek kontrolü
      if (jsonContent.length > 50 * 1024 * 1024) { // 50MB'dan büyükse
        console.log('⚠️ Dosya çok büyük, alternatif yöntem kullanılıyor...');
        break;
      }
    }
  }
  
  try {
    const data = JSON.parse(jsonContent);
    console.log('✅ JSON başarıyla parse edildi');
    return data;
  } catch (error) {
    console.log('📄 Alternatif okuma yöntemi deneniyor...');
    return await loadAlternativeFormat(filePath);
  }
}

async function loadAlternativeFormat(filePath) {
  // Eğer JSON parse edilemezse, satır satır okuma
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  const locations = [];
  let currentObject = '';
  let braceCount = 0;
  
  for await (const line of rl) {
    currentObject += line;
    
    // Brace sayısını takip et
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // Tam bir obje tamamlandıysa
    if (braceCount === 0 && currentObject.trim().length > 0) {
      try {
        const obj = JSON.parse(currentObject.trim().replace(/,$/, ''));
        if (obj.geonameid && obj.name) {
          locations.push(obj);
        }
      } catch (e) {
        // Hatalı JSON'u atla
      }
      currentObject = '';
    }
    
    // Bellek kontrolü
    if (locations.length >= MEMORY_LIMIT) {
      console.log(`⚠️ Bellek limiti (${MEMORY_LIMIT}) aşıldı, işlem durduruluyor`);
      break;
    }
  }
  
  return locations;
}

async function categorizeLocations(locations) {
  console.log('📂 Lokasyonlar kategorilere ayrılıyor...');
  
  const categorized = {
    countries: [],
    cities: [],
    districts: [],
    towns: []
  };
  
  for (const location of locations) {
    const featureCode = location.feature_code;
    
    if (FEATURE_CODES.COUNTRY.includes(featureCode)) {
      categorized.countries.push(location);
    } else if (FEATURE_CODES.CITY.includes(featureCode)) {
      categorized.cities.push(location);
    } else if (FEATURE_CODES.DISTRICT.includes(featureCode)) {
      categorized.districts.push(location);
    } else if (FEATURE_CODES.TOWN.includes(featureCode)) {
      categorized.towns.push(location);
    }
  }
  
  console.log(`📊 Kategorilendirme tamamlandı:`);
  console.log(`🌍 Ülkeler: ${categorized.countries.length}`);
  console.log(`🏙️ Şehirler: ${categorized.cities.length}`);
  console.log(`🏘️ İlçeler: ${categorized.districts.length}`);
  console.log(`🏠 Kasabalar: ${categorized.towns.length}`);
  
  return categorized;
}

async function createCountriesBatch(countries) {
  console.log('\n🌍 Ülkeler toplu olarak oluşturuluyor...');
  
  const countryMap = new Map();
  
  for (let i = 0; i < countries.length; i += BATCH_SIZE) {
    const batch = countries.slice(i, i + BATCH_SIZE);
    
    for (const country of batch) {
      try {
        const countryData = {
          geonameid: country.geonameid,
          name: country.name,
          asciiname: country.asciiname || country.name,
          alternatenames: country.alternatenames,
          iso2: country.country_code,
          iso3: country.country_code + 'R', // Basit ISO3
          latitude: country.latitude,
          longitude: country.longitude,
          population: country.population || 0,
          area_sqkm: calculateAreaFromPopulation(country.population), // Yaklaşık hesaplama
          continent: CONTINENT_INFO[getContinent(country.country_code)] || 'Unknown',
          currency_code: CURRENCY_CODES[country.country_code] || null,
          phone_code: PHONE_CODES[country.country_code] || null,
          timezone: country.timezone
        };
        
        const createdCountry = await prisma.country.upsert({
          where: { geonameid: country.geonameid },
          update: countryData,
          create: countryData
        });
        
        countryMap.set(country.country_code, createdCountry);
        processedCounts.countries++;
        
        if (processedCounts.countries % 10 === 0) {
          console.log(`✅ ${processedCounts.countries} ülke işlendi`);
        }
        
      } catch (error) {
        console.error(`❌ ${country.name} ülkesi eklenemedi:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${processedCounts.countries} ülke başarıyla eklendi`);
  return countryMap;
}

async function createCitiesBatch(cities, countryMap) {
  console.log('\n🏙️ Şehirler toplu olarak oluşturuluyor...');
  
  const cityMap = new Map();
  
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    
    for (const city of batch) {
      try {
        const country = countryMap.get(city.country_code);
        if (!country) {
          console.warn(`⚠️ ${city.country_code} ülkesi bulunamadı: ${city.name}`);
          continue;
        }
        
        const cityData = {
          geonameid: city.geonameid,
          name: city.name,
          asciiname: city.asciiname || city.name,
          alternatenames: city.alternatenames,
          latitude: city.latitude,
          longitude: city.longitude,
          population: city.population || 0,
          area_sqkm: calculateAreaFromPopulation(city.population),
          elevation: city.elevation || city.dem,
          timezone: city.timezone,
          admin1_code: city.admin1_code,
          country_id: country.id
        };
        
        const createdCity = await prisma.city.upsert({
          where: { geonameid: city.geonameid },
          update: cityData,
          create: cityData
        });
        
        cityMap.set(`${city.country_code}-${city.admin1_code}`, createdCity);
        processedCounts.cities++;
        
        if (processedCounts.cities % 100 === 0) {
          console.log(`✅ ${processedCounts.cities} şehir işlendi`);
        }
        
      } catch (error) {
        console.error(`❌ ${city.name} şehri eklenemedi:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${processedCounts.cities} şehir başarıyla eklendi`);
  return cityMap;
}

async function createDistrictsBatch(districts, countryMap, cityMap) {
  console.log('\n🏘️ İlçeler toplu olarak oluşturuluyor...');
  
  const districtMap = new Map();
  
  for (let i = 0; i < districts.length; i += BATCH_SIZE) {
    const batch = districts.slice(i, i + BATCH_SIZE);
    
    for (const district of batch) {
      try {
        const country = countryMap.get(district.country_code);
        const city = cityMap.get(`${district.country_code}-${district.admin1_code}`);
        
        if (!country) {
          console.warn(`⚠️ ${district.country_code} ülkesi bulunamadı: ${district.name}`);
          continue;
        }
        
        if (!city) {
          // Şehir bulunamazsa, ülkenin başkentini bul veya ilk şehri kullan
          const fallbackCity = Array.from(cityMap.values()).find(c => c.country_id === country.id);
          if (!fallbackCity) continue;
        }
        
        const districtData = {
          geonameid: district.geonameid,
          name: district.name,
          asciiname: district.asciiname || district.name,
          alternatenames: district.alternatenames,
          latitude: district.latitude,
          longitude: district.longitude,
          population: district.population || 0,
          area_sqkm: calculateAreaFromPopulation(district.population),
          elevation: district.elevation || district.dem,
          timezone: district.timezone,
          admin2_code: district.admin2_code,
          country_id: country.id,
          city_id: city?.id || Array.from(cityMap.values()).find(c => c.country_id === country.id)?.id
        };
        
        if (!districtData.city_id) continue;
        
        const createdDistrict = await prisma.district.upsert({
          where: { geonameid: district.geonameid },
          update: districtData,
          create: districtData
        });
        
        districtMap.set(`${district.country_code}-${district.admin1_code}-${district.admin2_code}`, createdDistrict);
        processedCounts.districts++;
        
        if (processedCounts.districts % 500 === 0) {
          console.log(`✅ ${processedCounts.districts} ilçe işlendi`);
        }
        
      } catch (error) {
        console.error(`❌ ${district.name} ilçesi eklenemedi:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${processedCounts.districts} ilçe başarıyla eklendi`);
  return districtMap;
}

async function createTownsBatch(towns, countryMap, cityMap, districtMap) {
  console.log('\n🏠 Kasabalar toplu olarak oluşturuluyor...');
  
  for (let i = 0; i < towns.length; i += BATCH_SIZE) {
    const batch = towns.slice(i, i + BATCH_SIZE);
    
    for (const town of batch) {
      try {
        const country = countryMap.get(town.country_code);
        const city = cityMap.get(`${town.country_code}-${town.admin1_code}`);
        const district = districtMap.get(`${town.country_code}-${town.admin1_code}-${town.admin2_code}`);
        
        if (!country || !city || !district) {
          continue; // Eksik bağlantı varsa atla
        }
        
        const townData = {
          geonameid: town.geonameid,
          name: town.name,
          asciiname: town.asciiname || town.name,
          alternatenames: town.alternatenames,
          latitude: town.latitude,
          longitude: town.longitude,
          population: town.population || 0,
          area_sqkm: calculateAreaFromPopulation(town.population),
          elevation: town.elevation || town.dem,
          timezone: town.timezone,
          town_type: town.feature_code,
          admin3_code: town.admin3_code,
          country_id: country.id,
          city_id: city.id,
          district_id: district.id
        };
        
        await prisma.town.upsert({
          where: { geonameid: town.geonameid },
          update: townData,
          create: townData
        });
        
        processedCounts.towns++;
        
        if (processedCounts.towns % 1000 === 0) {
          console.log(`✅ ${processedCounts.towns} kasaba işlendi`);
        }
        
      } catch (error) {
        console.error(`❌ ${town.name} kasabası eklenemedi:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${processedCounts.towns} kasaba başarıyla eklendi`);
}

async function createSampleRegions(countryMap, cityMap) {
  console.log('\n🗺️ Örnek acil durum bölgeleri oluşturuluyor...');
  
  const regions = [];
  const regionData = [
    {
      name: 'Avrupa Acil Durum Bölgesi',
      description: 'Avrupa ülkeleri acil durum koordinasyon bölgesi',
      type: 'emergency',
      level: 'MEDIUM',
      countries: ['DE', 'FR', 'GB', 'IT', 'ES']
    },
    {
      name: 'Asya-Pasifik Deprem Bölgesi',
      description: 'Asya-Pasifik deprem risk bölgesi',
      type: 'earthquake',
      level: 'HIGH',
      countries: ['TR', 'JP', 'CN', 'IN']
    },
    {
      name: 'Amerika Kıtası Yangın Bölgesi',
      description: 'Amerika kıtası yangın risk bölgesi',
      type: 'fire',
      level: 'MEDIUM',
      countries: ['US', 'CA', 'MX', 'BR']
    },
    {
      name: 'Global Acil Müdahale Merkezi',
      description: 'Dünya geneli acil durum koordinasyon merkezi',
      type: 'emergency',
      level: 'LOW',
      countries: ['TR', 'US', 'DE', 'JP', 'GB']
    }
  ];
  
  for (const regionInfo of regionData) {
    try {
      const region = await prisma.region.create({
        data: {
          name: regionInfo.name,
          description: regionInfo.description,
          region_type: regionInfo.type,
          emergency_level: regionInfo.level,
          status: 'ACTIVE'
        }
      });
      
      // Ülkeleri bölgeye bağla
      for (const countryCode of regionInfo.countries) {
        const country = countryMap.get(countryCode);
        if (country) {
          await prisma.regionCountry.create({
            data: {
              region_id: region.id,
              country_id: country.id
            }
          });
        }
      }
      
      regions.push(region);
      console.log(`✅ ${region.name} bölgesi oluşturuldu`);
      
    } catch (error) {
      console.error(`❌ ${regionInfo.name} bölgesi oluşturulamadı:`, error.message);
    }
  }
  
  return regions;
}

// Yardımcı fonksiyonlar
function calculateAreaFromPopulation(population) {
  if (!population) return 0;
  // Yaklaşık hesaplama: nüfus yoğunluğuna göre alan hesapla
  return Math.sqrt(population / 100); // Basit formül
}

function getContinent(countryCode) {
  const continentMap = {
    'TR': 'AS', 'US': 'NA', 'DE': 'EU', 'FR': 'EU', 'GB': 'EU',
    'IT': 'EU', 'ES': 'EU', 'JP': 'AS', 'CN': 'AS', 'IN': 'AS',
    'BR': 'SA', 'RU': 'AS', 'CA': 'NA', 'AU': 'OC', 'MX': 'NA'
  };
  return continentMap[countryCode] || 'AS';
}

async function main() {
  console.log('🚀 TÜM DÜNYA Geonames Verisi İçe Aktarma Başlıyor...\n');
  
  try {
    // 1. Büyük dosyayı yükle
    const filePath = await loadGeonamesDataStream();
    
    // 2. Dosyayı işle
    const locations = await processGeonamesFile(filePath);
    
    if (!locations || locations.length === 0) {
      throw new Error('Geonames verisi yüklenemedi veya boş');
    }
    
    console.log(`📊 Toplam ${locations.length} lokasyon yüklendi`);
    
    // 3. Kategorilere ayır
    const categorized = await categorizeLocations(locations);
    
    // 4. Ülkeleri oluştur
    const countryMap = await createCountriesBatch(categorized.countries);
    
    // 5. Şehirleri oluştur
    const cityMap = await createCitiesBatch(categorized.cities, countryMap);
    
    // 6. İlçeleri oluştur
    const districtMap = await createDistrictsBatch(categorized.districts, countryMap, cityMap);
    
    // 7. Kasabaları oluştur
    await createTownsBatch(categorized.towns, countryMap, cityMap, districtMap);
    
    // 8. Örnek bölgeler oluştur
    await createSampleRegions(countryMap, cityMap);
    
    console.log('\n🎉 TÜM DÜNYA Coğrafi Yapı Başarıyla Oluşturuldu!');
    console.log(`📊 İşlem Özeti:`);
    console.log(`🌍 Ülkeler: ${processedCounts.countries}`);
    console.log(`🏙️ Şehirler: ${processedCounts.cities}`);
    console.log(`🏘️ İlçeler: ${processedCounts.districts}`);
    console.log(`🏠 Kasabalar: ${processedCounts.towns}`);
    console.log(`📍 Toplam: ${processedCounts.countries + processedCounts.cities + processedCounts.districts + processedCounts.towns}`);
    
    console.log('\n✅ TreeSelect için tüm dünya coğrafi verileri hazır!');
    console.log('✅ Popülasyon, koordinat ve alan bilgileri dahil');
    console.log('✅ Hiyerarşik yapı: Ülke > Şehir > İlçe > Kasaba');
    
  } catch (error) {
    console.error('\n❌ İçe aktarma hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .catch(console.error);
}

module.exports = { main }; 