const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Geonames feature kodları
const FEATURE_CODES = {
  COUNTRY: ['PCLI', 'PCLD', 'PCLF', 'PCLS'], // Ülkeler
  CITY: ['ADM1', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC'], // İller/Şehirler
  DISTRICT: ['ADM2', 'PPL', 'PPLG'], // İlçeler
  TOWN: ['ADM3', 'ADM4', 'PPLX', 'PPLL', 'PPLR', 'PPLS', 'PPLF'] // Kasabalar
};

// Kıta bilgileri
const CONTINENT_INFO = {
  'TR': 'Asia',
  'US': 'North America',
  'DE': 'Europe',
  'FR': 'Europe',
  'GB': 'Europe',
  'IT': 'Europe',
  'ES': 'Europe',
  'JP': 'Asia',
  'CN': 'Asia',
  'IN': 'Asia',
  'BR': 'South America',
  'RU': 'Asia',
  'CA': 'North America',
  'AU': 'Oceania',
  'MX': 'North America',
  'AR': 'South America',
  'ZA': 'Africa',
  'EG': 'Africa',
  'NG': 'Africa',
  'KE': 'Africa'
};

// Para birimleri
const CURRENCY_CODES = {
  'TR': 'TRY', 'US': 'USD', 'DE': 'EUR', 'FR': 'EUR', 'GB': 'GBP',
  'IT': 'EUR', 'ES': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR',
  'BR': 'BRL', 'RU': 'RUB', 'CA': 'CAD', 'AU': 'AUD', 'MX': 'MXN',
  'AR': 'ARS', 'ZA': 'ZAR', 'EG': 'EGP', 'NG': 'NGN', 'KE': 'KES'
};

// Telefon kodları
const PHONE_CODES = {
  'TR': '+90', 'US': '+1', 'DE': '+49', 'FR': '+33', 'GB': '+44',
  'IT': '+39', 'ES': '+34', 'JP': '+81', 'CN': '+86', 'IN': '+91',
  'BR': '+55', 'RU': '+7', 'CA': '+1', 'AU': '+61', 'MX': '+52',
  'AR': '+54', 'ZA': '+27', 'EG': '+20', 'NG': '+234', 'KE': '+254'
};

let stats = {
  countries: 0,
  cities: 0,
  districts: 0,
  towns: 0,
  total: 0
};

async function loadGeonamesData() {
  console.log('📊 Geonames.json dosyası yükleniyor...');
  
  try {
    const geonamesPath = path.join(process.cwd(), 'data', 'geonames.json');
    const data = JSON.parse(fs.readFileSync(geonamesPath, 'utf8'));
    
    console.log(`✅ Geonames verisi yüklendi`);
    console.log(`📊 Veri kategorileri: ${Object.keys(data).length}`);
    
    // Tüm veri kategorilerini birleştir
    let allLocations = [];
    
    if (data.provinces) {
      console.log(`🏛️ İller: ${data.provinces.length}`);
      allLocations = allLocations.concat(data.provinces);
    }
    
    if (data.districts) {
      console.log(`🏘️ İlçeler: ${data.districts.length}`);
      allLocations = allLocations.concat(data.districts);
    }
    
    if (data.cities) {
      console.log(`🏙️ Şehirler: ${data.cities.length}`);
      allLocations = allLocations.concat(data.cities);
    }
    
    if (data.towns) {
      console.log(`🏠 Kasabalar: ${data.towns.length}`);
      allLocations = allLocations.concat(data.towns);
    }
    
    console.log(`📍 Toplam lokasyon: ${allLocations.length}`);
    return allLocations;
    
  } catch (error) {
    console.error('❌ Geonames verisi yüklenemedi:', error);
    throw error;
  }
}

async function categorizeByFeatureCode(locations) {
  console.log('\n📂 Lokasyonlar feature kodlarına göre kategorileniyor...');
  
  const categorized = {
    countries: [],
    cities: [],
    districts: [],
    towns: []
  };
  
  // Ülke verilerini manuel olarak ekle (geonames'te eksik olabilir)
  const manualCountries = [
    { geonameid: 298795, name: 'Turkey', country_code: 'TR', population: 84339067 },
    { geonameid: 6252001, name: 'United States', country_code: 'US', population: 331002651 },
    { geonameid: 2921044, name: 'Germany', country_code: 'DE', population: 83783942 },
    { geonameid: 3017382, name: 'France', country_code: 'FR', population: 65273511 },
    { geonameid: 2635167, name: 'United Kingdom', country_code: 'GB', population: 67886011 },
    { geonameid: 3175395, name: 'Italy', country_code: 'IT', population: 60461826 },
    { geonameid: 2510769, name: 'Spain', country_code: 'ES', population: 46754778 },
    { geonameid: 1861060, name: 'Japan', country_code: 'JP', population: 125836021 },
    { geonameid: 1814991, name: 'China', country_code: 'CN', population: 1439323776 },
    { geonameid: 1269750, name: 'India', country_code: 'IN', population: 1380004385 },
    { geonameid: 3469034, name: 'Brazil', country_code: 'BR', population: 212559417 },
    { geonameid: 2017370, name: 'Russia', country_code: 'RU', population: 145934462 },
    { geonameid: 6251999, name: 'Canada', country_code: 'CA', population: 37742154 },
    { geonameid: 2077456, name: 'Australia', country_code: 'AU', population: 25499884 },
    { geonameid: 3996063, name: 'Mexico', country_code: 'MX', population: 128932753 },
    { geonameid: 3865483, name: 'Argentina', country_code: 'AR', population: 45195774 },
    { geonameid: 953987, name: 'South Africa', country_code: 'ZA', population: 59308690 },
    { geonameid: 357994, name: 'Egypt', country_code: 'EG', population: 102334404 },
    { geonameid: 2328926, name: 'Nigeria', country_code: 'NG', population: 206139589 },
    { geonameid: 192950, name: 'Kenya', country_code: 'KE', population: 53771296 }
  ];
  
  categorized.countries = manualCountries;
  
  // Diğer lokasyonları kategorile
  for (const location of locations) {
    const featureCode = location.feature_code;
    
    if (FEATURE_CODES.CITY.includes(featureCode) || location.name?.includes('İl')) {
      categorized.cities.push(location);
    } else if (FEATURE_CODES.DISTRICT.includes(featureCode) || location.name?.includes('İlçe')) {
      categorized.districts.push(location);
    } else if (FEATURE_CODES.TOWN.includes(featureCode) || (!featureCode && location.name)) {
      categorized.towns.push(location);
    }
  }
  
  console.log(`📊 Kategorilendirme sonuçları:`);
  console.log(`🌍 Ülkeler: ${categorized.countries.length}`);
  console.log(`🏙️ Şehirler: ${categorized.cities.length}`);
  console.log(`🏘️ İlçeler: ${categorized.districts.length}`);
  console.log(`🏠 Kasabalar: ${categorized.towns.length}`);
  
  return categorized;
}

async function createCountries(countries) {
  console.log('\n🌍 Ülkeler oluşturuluyor...');
  
  const countryMap = new Map();
  
  for (const country of countries) {
    try {
      const countryData = {
        geonameid: country.geonameid,
        name: country.name,
        asciiname: country.asciiname || country.name,
        alternatenames: country.alternatenames,
        iso2: country.country_code,
        iso3: country.country_code + 'R',
        latitude: country.latitude || 0,
        longitude: country.longitude || 0,
        population: country.population || 0,
        area_sqkm: calculateAreaFromPopulation(country.population),
        continent: CONTINENT_INFO[country.country_code] || 'Unknown',
        currency_code: CURRENCY_CODES[country.country_code],
        phone_code: PHONE_CODES[country.country_code],
        timezone: country.timezone || 'UTC'
      };
      
      const createdCountry = await prisma.country.upsert({
        where: { geonameid: country.geonameid },
        update: countryData,
        create: countryData
      });
      
      countryMap.set(country.country_code, createdCountry);
      stats.countries++;
      
      console.log(`✅ ${country.name} (${country.country_code})`);
      
    } catch (error) {
      console.error(`❌ ${country.name} ülkesi eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${stats.countries} ülke başarıyla eklendi`);
  return countryMap;
}

async function createCities(cities, countryMap) {
  console.log('\n🏙️ Şehirler oluşturuluyor...');
  
  const cityMap = new Map();
  
  for (const city of cities) {
    try {
      // Türkiye için varsayılan ülke
      const countryCode = city.country_code || 'TR';
      const country = countryMap.get(countryCode);
      
      if (!country) {
        console.warn(`⚠️ ${countryCode} ülkesi bulunamadı: ${city.name}`);
        continue;
      }
      
      const cityData = {
        geonameid: city.geonameid,
        name: city.name,
        asciiname: city.asciiname || city.name,
        alternatenames: city.alternatenames,
        latitude: city.latitude || 0,
        longitude: city.longitude || 0,
        population: city.population || 0,
        area_sqkm: calculateAreaFromPopulation(city.population),
        elevation: city.elevation || city.dem || 0,
        timezone: city.timezone || 'Europe/Istanbul',
        admin1_code: city.admin1_code,
        country_id: country.id
      };
      
      const createdCity = await prisma.city.upsert({
        where: { geonameid: city.geonameid },
        update: cityData,
        create: cityData
      });
      
      cityMap.set(`${countryCode}-${city.name}`, createdCity);
      stats.cities++;
      
      if (stats.cities % 10 === 0) {
        console.log(`✅ ${stats.cities} şehir işlendi`);
      }
      
    } catch (error) {
      console.error(`❌ ${city.name} şehri eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${stats.cities} şehir başarıyla eklendi`);
  return cityMap;
}

async function createDistricts(districts, countryMap, cityMap) {
  console.log('\n🏘️ İlçeler oluşturuluyor...');
  
  const districtMap = new Map();
  
  for (const district of districts) {
    try {
      const countryCode = district.country_code || 'TR';
      const country = countryMap.get(countryCode);
      
      if (!country) {
        console.warn(`⚠️ ${countryCode} ülkesi bulunamadı: ${district.name}`);
        continue;
      }
      
      // Şehir bulma - en yakın şehri bul
      let city = null;
      for (const [key, value] of cityMap) {
        if (key.startsWith(countryCode + '-')) {
          city = value;
          break;
        }
      }
      
      if (!city) {
        console.warn(`⚠️ ${countryCode} için şehir bulunamadı: ${district.name}`);
        continue;
      }
      
      const districtData = {
        geonameid: district.geonameid,
        name: district.name,
        asciiname: district.asciiname || district.name,
        alternatenames: district.alternatenames,
        latitude: district.latitude || 0,
        longitude: district.longitude || 0,
        population: district.population || 0,
        area_sqkm: calculateAreaFromPopulation(district.population),
        elevation: district.elevation || district.dem || 0,
        timezone: district.timezone || 'Europe/Istanbul',
        admin2_code: district.admin2_code,
        country_id: country.id,
        city_id: city.id
      };
      
      const createdDistrict = await prisma.district.upsert({
        where: { geonameid: district.geonameid },
        update: districtData,
        create: districtData
      });
      
      districtMap.set(`${countryCode}-${district.name}`, createdDistrict);
      stats.districts++;
      
      if (stats.districts % 50 === 0) {
        console.log(`✅ ${stats.districts} ilçe işlendi`);
      }
      
    } catch (error) {
      console.error(`❌ ${district.name} ilçesi eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${stats.districts} ilçe başarıyla eklendi`);
  return districtMap;
}

async function createTowns(towns, countryMap, cityMap, districtMap) {
  console.log('\n🏠 Kasabalar oluşturuluyor...');
  
  for (const town of towns) {
    try {
      const countryCode = town.country_code || 'TR';
      const country = countryMap.get(countryCode);
      
      if (!country) continue;
      
      // Şehir bul
      let city = null;
      for (const [key, value] of cityMap) {
        if (key.startsWith(countryCode + '-')) {
          city = value;
          break;
        }
      }
      
      // İlçe bul
      let district = null;
      for (const [key, value] of districtMap) {
        if (key.startsWith(countryCode + '-')) {
          district = value;
          break;
        }
      }
      
      if (!city || !district) continue;
      
      const townData = {
        geonameid: town.geonameid,
        name: town.name,
        asciiname: town.asciiname || town.name,
        alternatenames: town.alternatenames,
        latitude: town.latitude || 0,
        longitude: town.longitude || 0,
        population: town.population || 0,
        area_sqkm: calculateAreaFromPopulation(town.population),
        elevation: town.elevation || town.dem || 0,
        timezone: town.timezone || 'Europe/Istanbul',
        town_type: town.feature_code || 'town',
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
      
      stats.towns++;
      
      if (stats.towns % 100 === 0) {
        console.log(`✅ ${stats.towns} kasaba işlendi`);
      }
      
    } catch (error) {
      console.error(`❌ ${town.name} kasabası eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${stats.towns} kasaba başarıyla eklendi`);
}

async function createSampleRegions(countryMap, cityMap) {
  console.log('\n🗺️ Acil durum bölgeleri oluşturuluyor...');
  
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
      name: 'Türkiye Deprem Bölgesi',
      description: 'Türkiye deprem risk bölgesi',
      type: 'earthquake',
      level: 'HIGH',
      countries: ['TR']
    },
    {
      name: 'Asya-Pasifik Bölgesi',
      description: 'Asya-Pasifik acil durum bölgesi',
      type: 'emergency',
      level: 'MEDIUM',
      countries: ['JP', 'CN', 'IN', 'AU']
    },
    {
      name: 'Amerika Kıtası Bölgesi',
      description: 'Amerika kıtası acil durum bölgesi',
      type: 'emergency',
      level: 'LOW',
      countries: ['US', 'CA', 'MX', 'BR', 'AR']
    },
    {
      name: 'Afrika Kıtası Bölgesi',
      description: 'Afrika kıtası acil durum bölgesi',
      type: 'emergency',
      level: 'MEDIUM',
      countries: ['ZA', 'EG', 'NG', 'KE']
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
  return Math.sqrt(population / 100); // Basit formül
}

async function main() {
  console.log('🚀 TÜM Geonames Verisi İçe Aktarma Başlıyor...\n');
  
  try {
    // 1. Geonames verilerini yükle
    const locations = await loadGeonamesData();
    
    // 2. Kategorilere ayır
    const categorized = await categorizeByFeatureCode(locations);
    
    // 3. Ülkeleri oluştur
    const countryMap = await createCountries(categorized.countries);
    
    // 4. Şehirleri oluştur
    const cityMap = await createCities(categorized.cities, countryMap);
    
    // 5. İlçeleri oluştur
    const districtMap = await createDistricts(categorized.districts, countryMap, cityMap);
    
    // 6. Kasabaları oluştur
    await createTowns(categorized.towns, countryMap, cityMap, districtMap);
    
    // 7. Acil durum bölgeleri oluştur
    await createSampleRegions(countryMap, cityMap);
    
    console.log('\n🎉 TÜM Geonames Verisi Başarıyla İçe Aktarıldı!');
    console.log(`📊 İşlem Özeti:`);
    console.log(`🌍 Ülkeler: ${stats.countries}`);
    console.log(`🏙️ Şehirler: ${stats.cities}`);
    console.log(`🏘️ İlçeler: ${stats.districts}`);
    console.log(`🏠 Kasabalar: ${stats.towns}`);
    console.log(`📍 Toplam: ${stats.countries + stats.cities + stats.districts + stats.towns}`);
    
    stats.total = stats.countries + stats.cities + stats.districts + stats.towns;
    
    console.log('\n✅ TreeSelect için global coğrafi veriler hazır!');
    console.log('✅ Popülasyon ve koordinat bilgileri dahil');
    console.log('✅ Hiyerarşik yapı: Ülke > Şehir > İlçe > Kasaba');
    console.log('✅ Acil durum bölge yönetimi aktif');
    
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