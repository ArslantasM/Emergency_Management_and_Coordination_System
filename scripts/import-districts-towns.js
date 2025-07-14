const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');
const readline = require('readline');

const prisma = new PrismaClient();

// Önemli ülkeler (mevcut ülkelerle aynı)
const PRIORITY_COUNTRIES = [
  'TR', 'US', 'CN', 'IN', 'ID', 'BR', 'PK', 'BD', 'NG', 'RU', 'MX', 'JP', 'PH', 'ET',
  'VN', 'EG', 'DE', 'IR', 'TH', 'GB', 'FR', 'IT', 'ZA', 'TZ', 'MM', 'KE', 'KR', 'CO',
  'ES', 'UG', 'AR', 'DZ', 'SD', 'UA', 'IQ', 'AF', 'PL', 'CA', 'MA', 'SA', 'UZ', 'PE',
  'MY', 'AO', 'MZ', 'GH', 'YE', 'NP', 'VE', 'MG', 'CM', 'AU', 'CI', 'NE', 'LK', 'BF',
  'ML', 'RO', 'MW', 'CL', 'KZ', 'ZM', 'GT', 'EC', 'SN', 'CD', 'ZW', 'GN', 'RW', 'BJ',
  'TN', 'BI', 'SO', 'TD', 'SS', 'TG', 'CH', 'BE', 'CU', 'BO', 'GR', 'DO', 'CZ', 'PT',
  'AZ', 'SE', 'HN', 'BY', 'HU', 'TJ', 'AT', 'IL', 'RS', 'PG', 'JO', 'CH'
];

// Genişletilmiş feature kodları
const FEATURE_CODES = {
  DISTRICTS: [
    'ADM2',     // second-order administrative division
    'ADM3',     // third-order administrative division
    'ADM4',     // fourth-order administrative division
    'ADMD',     // administrative division
    'ADMF'      // administrative facility
  ],
  TOWNS: [
    'PPLS',     // populated places
    'PPLX',     // section of populated place
    'PPLH',     // historical populated place
    'PPLL',     // populated locality
    'PPLR',     // religious populated place
    'PPLF',     // farm village
    'PPLG',     // seat of government
    'PPL'       // populated place (genel)
  ]
};

let stats = {
  districts: 0,
  towns: 0,
  processed: 0,
  errors: 0
};

async function loadExistingData() {
  console.log('📊 Mevcut veriler yükleniyor...');
  
  const countries = await prisma.country.findMany();
  const cities = await prisma.city.findMany();
  
  const countryMap = new Map();
  const cityMap = new Map();
  
  countries.forEach(country => {
    countryMap.set(country.iso2, country);
  });
  
  cities.forEach(city => {
    cityMap.set(`${city.country_id}-${city.geonameid}`, city);
  });
  
  console.log(`✅ ${countries.length} ülke ve ${cities.length} şehir yüklendi`);
  return { countryMap, cityMap };
}

async function processDistrictsAndTowns() {
  console.log('🏘️ İlçe ve kasabalar işleniyor...');
  console.log('⏳ Bu işlem 5-10 dakika sürebilir...\n');
  
  const zipPath = path.join(__dirname, '../prisma/data/allCountries.zip');
  
  const districts = [];
  const towns = [];
  
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        console.error('❌ ZIP dosyası açılamadı:', err);
        reject(err);
        return;
      }
      
      zipfile.readEntry();
      
      zipfile.on('entry', (entry) => {
        if (entry.fileName === 'allCountries.txt') {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err);
              return;
            }
            
            const rl = readline.createInterface({
              input: readStream,
              crlfDelay: Infinity
            });
            
            let lineCount = 0;
            
            rl.on('line', (line) => {
              lineCount++;
              
              if (lineCount % 500000 === 0) {
                console.log(`📊 ${lineCount} satır işlendi...`);
              }
              
              const parts = line.split('\t');
              if (parts.length >= 17) {
                const featureCode = parts[7];
                const countryCode = parts[8];
                
                // Sadece öncelikli ülkeleri işle
                if (!PRIORITY_COUNTRIES.includes(countryCode)) {
                  return;
                }
                
                const location = {
                  geonameid: parseInt(parts[0]),
                  name: parts[1],
                  asciiname: parts[2],
                  alternatenames: parts[3],
                  latitude: parseFloat(parts[4]) || 0,
                  longitude: parseFloat(parts[5]) || 0,
                  feature_code: featureCode,
                  country_code: countryCode,
                  admin1_code: parts[10],
                  admin2_code: parts[11],
                  admin3_code: parts[12],
                  admin4_code: parts[13],
                  population: parseInt(parts[14]) || 0,
                  elevation: parseInt(parts[15]) || 0,
                  dem: parseInt(parts[16]) || 0,
                  timezone: parts[17] || 'UTC'
                };
                
                // İlçeleri topla (nüfus filtresi yok)
                if (FEATURE_CODES.DISTRICTS.includes(featureCode)) {
                  districts.push(location);
                } 
                // Kasabaları topla (minimum 1000 nüfus)
                else if (FEATURE_CODES.TOWNS.includes(featureCode) && location.population >= 1000) {
                  towns.push(location);
                }
                
                stats.processed++;
              }
            });
            
            rl.on('close', () => {
              console.log(`✅ Toplam ${lineCount} satır işlendi`);
              console.log(`🏘️ ${districts.length} ilçe bulundu`);
              console.log(`🏠 ${towns.length} kasaba bulundu (1K+ nüfus)`);
              
              resolve({ districts, towns });
            });
            
            rl.on('error', (err) => {
              reject(err);
            });
          });
        } else {
          zipfile.readEntry();
        }
      });
      
      zipfile.on('end', () => {
        if (districts.length === 0 && towns.length === 0) {
          reject(new Error('Hiç ilçe/kasaba bulunamadı'));
        }
      });
    });
  });
}

function calculateAreaFromPopulation(population) {
  if (!population || population === 0) return 0;
  return Math.round(population * 0.3);
}

function findNearestCity(location, cityMap, countryMap) {
  const country = countryMap.get(location.country_code);
  if (!country) return null;
  
  // Aynı ülkedeki şehirleri bul
  const countryCities = [];
  for (const [key, city] of cityMap) {
    if (key.includes(`${country.id}-`)) {
      countryCities.push(city);
    }
  }
  
  if (countryCities.length === 0) return null;
  
  // En yakın şehri bul (koordinat mesafesi ile)
  let nearestCity = null;
  let minDistance = Infinity;
  
  for (const city of countryCities) {
    const distance = Math.sqrt(
      Math.pow(city.latitude - location.latitude, 2) + 
      Math.pow(city.longitude - location.longitude, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  return nearestCity;
}

async function createDistricts(districts, countryMap, cityMap) {
  console.log('\n🏘️ İlçeler veritabanına ekleniyor...');
  
  const districtMap = new Map();
  const batchSize = 100;
  
  for (let i = 0; i < districts.length; i += batchSize) {
    const batch = districts.slice(i, i + batchSize);
    
    for (const district of batch) {
      try {
        const country = countryMap.get(district.country_code);
        if (!country) {
          stats.errors++;
          continue;
        }
        
        // En yakın şehri bul
        const city = findNearestCity(district, cityMap, countryMap);
        
        const districtData = {
          geonameid: district.geonameid,
          name: district.name,
          asciiname: district.asciiname || district.name,
          alternatenames: district.alternatenames || '',
          latitude: district.latitude,
          longitude: district.longitude,
          population: district.population,
          area_sqkm: calculateAreaFromPopulation(district.population),
          elevation: district.elevation || district.dem || 0,
          admin1_code: district.admin1_code,
          admin2_code: district.admin2_code,
          country_id: country.id,
          city_id: city ? city.id : null
        };
        
        const createdDistrict = await prisma.district.create({
          data: districtData
        });
        
        districtMap.set(`${district.country_code}-${district.geonameid}`, createdDistrict);
        stats.districts++;
        
      } catch (error) {
        stats.errors++;
        if (stats.errors <= 5) {
          console.error(`❌ İlçe eklenemedi: ${district.name} - ${error.message}`);
        }
      }
    }
    
    console.log(`✅ ${Math.min(i + batchSize, districts.length)}/${districts.length} ilçe işlendi`);
  }
  
  console.log(`✅ Toplam ${stats.districts} ilçe eklendi (${stats.errors} hata)`);
  return districtMap;
}

async function createTowns(towns, countryMap, cityMap, districtMap) {
  console.log('\n🏠 Kasabalar veritabanına ekleniyor...');
  
  const batchSize = 100;
  
  for (let i = 0; i < towns.length; i += batchSize) {
    const batch = towns.slice(i, i + batchSize);
    
    for (const town of batch) {
      try {
        const country = countryMap.get(town.country_code);
        if (!country) {
          stats.errors++;
          continue;
        }
        
        // En yakın şehir ve ilçeyi bul
        const city = findNearestCity(town, cityMap, countryMap);
        
        let district = null;
        for (const [key, value] of districtMap) {
          if (key.startsWith(town.country_code + '-')) {
            district = value;
            break;
          }
        }
        
        const townData = {
          geonameid: town.geonameid,
          name: town.name,
          asciiname: town.asciiname || town.name,
          alternatenames: town.alternatenames || '',
          latitude: town.latitude,
          longitude: town.longitude,
          population: town.population,
          area_sqkm: calculateAreaFromPopulation(town.population),
          elevation: town.elevation || town.dem || 0,
          admin1_code: town.admin1_code,
          admin2_code: town.admin2_code,
          admin3_code: town.admin3_code,
          admin4_code: town.admin4_code,
          country_id: country.id,
          city_id: city ? city.id : null,
          district_id: district ? district.id : null
        };
        
        await prisma.town.create({
          data: townData
        });
        
        stats.towns++;
        
      } catch (error) {
        stats.errors++;
        if (stats.errors <= 5) {
          console.error(`❌ Kasaba eklenemedi: ${town.name} - ${error.message}`);
        }
      }
    }
    
    console.log(`✅ ${Math.min(i + batchSize, towns.length)}/${towns.length} kasaba işlendi`);
  }
  
  console.log(`✅ Toplam ${stats.towns} kasaba eklendi`);
}

async function main() {
  try {
    console.log('🚀 İlçe ve kasabalar import ediliyor...');
    console.log('📊 Mevcut ülke ve şehir verileri kullanılacak');
    console.log('⏳ Bu işlem 10-15 dakika sürebilir...\n');
    
    // Mevcut verileri yükle
    const { countryMap, cityMap } = await loadExistingData();
    
    // İlçe ve kasabaları çıkar
    const data = await processDistrictsAndTowns();
    
    // Sırayla import et
    const districtMap = await createDistricts(data.districts, countryMap, cityMap);
    await createTowns(data.towns, countryMap, cityMap, districtMap);
    
    console.log('\n🎉 İLÇE VE KASABA İMPORT TAMAMLANDI!');
    console.log('📊 İstatistikler:');
    console.log(`🏘️ İlçeler: ${stats.districts}`);
    console.log(`🏠 Kasabalar: ${stats.towns} (1K+ nüfus)`);
    console.log(`❌ Hatalar: ${stats.errors}`);
    console.log(`📍 Yeni lokasyon: ${stats.districts + stats.towns}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 