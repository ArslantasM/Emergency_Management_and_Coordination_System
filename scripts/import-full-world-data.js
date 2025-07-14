const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');
const readline = require('readline');

const prisma = new PrismaClient();

// Feature kodları
const FEATURE_CODES = {
  COUNTRIES: ['PCLI', 'PCLD', 'PCLF', 'PCLS', 'TERR'],
  CITIES: ['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLF', 'PPLG', 'PPLL', 'PPLR', 'PPLS', 'STLMT'],
  DISTRICTS: ['ADM2', 'ADM3'],
  TOWNS: ['PPLX', 'PPLH', 'PPLL', 'PPLS']
};

let stats = {
  countries: 0,
  cities: 0,
  districts: 0,
  towns: 0,
  processed: 0
};

// Kıta bilgileri
const CONTINENT_INFO = {
  'AF': 'Asia', 'AL': 'Europe', 'DZ': 'Africa', 'AS': 'Oceania', 'AD': 'Europe',
  'AO': 'Africa', 'AI': 'North America', 'AQ': 'Antarctica', 'AG': 'North America',
  'AR': 'South America', 'AM': 'Asia', 'AW': 'North America', 'AU': 'Oceania',
  'AT': 'Europe', 'AZ': 'Asia', 'BS': 'North America', 'BH': 'Asia', 'BD': 'Asia',
  'BB': 'North America', 'BY': 'Europe', 'BE': 'Europe', 'BZ': 'North America',
  'BJ': 'Africa', 'BM': 'North America', 'BT': 'Asia', 'BO': 'South America',
  'BA': 'Europe', 'BW': 'Africa', 'BV': 'Antarctica', 'BR': 'South America',
  'IO': 'Asia', 'BN': 'Asia', 'BG': 'Europe', 'BF': 'Africa', 'BI': 'Africa',
  'KH': 'Asia', 'CM': 'Africa', 'CA': 'North America', 'CV': 'Africa',
  'KY': 'North America', 'CF': 'Africa', 'TD': 'Africa', 'CL': 'South America',
  'CN': 'Asia', 'CX': 'Asia', 'CC': 'Asia', 'CO': 'South America', 'KM': 'Africa',
  'CG': 'Africa', 'CD': 'Africa', 'CK': 'Oceania', 'CR': 'North America',
  'CI': 'Africa', 'HR': 'Europe', 'CU': 'North America', 'CW': 'North America',
  'CY': 'Europe', 'CZ': 'Europe', 'DK': 'Europe', 'DJ': 'Africa', 'DM': 'North America',
  'DO': 'North America', 'EC': 'South America', 'EG': 'Africa', 'SV': 'North America',
  'GQ': 'Africa', 'ER': 'Africa', 'EE': 'Europe', 'ET': 'Africa', 'FK': 'South America',
  'FO': 'Europe', 'FJ': 'Oceania', 'FI': 'Europe', 'FR': 'Europe', 'GF': 'South America',
  'PF': 'Oceania', 'TF': 'Antarctica', 'GA': 'Africa', 'GM': 'Africa', 'GE': 'Asia',
  'DE': 'Europe', 'GH': 'Africa', 'GI': 'Europe', 'GR': 'Europe', 'GL': 'North America',
  'GD': 'North America', 'GP': 'North America', 'GU': 'Oceania', 'GT': 'North America',
  'GG': 'Europe', 'GN': 'Africa', 'GW': 'Africa', 'GY': 'South America', 'HT': 'North America',
  'HM': 'Antarctica', 'VA': 'Europe', 'HN': 'North America', 'HK': 'Asia',
  'HU': 'Europe', 'IS': 'Europe', 'IN': 'Asia', 'ID': 'Asia', 'IR': 'Asia',
  'IQ': 'Asia', 'IE': 'Europe', 'IM': 'Europe', 'IL': 'Asia', 'IT': 'Europe',
  'JM': 'North America', 'JP': 'Asia', 'JE': 'Europe', 'JO': 'Asia', 'KZ': 'Asia',
  'KE': 'Africa', 'KI': 'Oceania', 'KP': 'Asia', 'KR': 'Asia', 'KW': 'Asia',
  'KG': 'Asia', 'LA': 'Asia', 'LV': 'Europe', 'LB': 'Asia', 'LS': 'Africa',
  'LR': 'Africa', 'LY': 'Africa', 'LI': 'Europe', 'LT': 'Europe', 'LU': 'Europe',
  'MO': 'Asia', 'MK': 'Europe', 'MG': 'Africa', 'MW': 'Africa', 'MY': 'Asia',
  'MV': 'Asia', 'ML': 'Africa', 'MT': 'Europe', 'MH': 'Oceania', 'MQ': 'North America',
  'MR': 'Africa', 'MU': 'Africa', 'YT': 'Africa', 'MX': 'North America', 'FM': 'Oceania',
  'MD': 'Europe', 'MC': 'Europe', 'MN': 'Asia', 'ME': 'Europe', 'MS': 'North America',
  'MA': 'Africa', 'MZ': 'Africa', 'MM': 'Asia', 'NA': 'Africa', 'NR': 'Oceania',
  'NP': 'Asia', 'NL': 'Europe', 'NC': 'Oceania', 'NZ': 'Oceania', 'NI': 'North America',
  'NE': 'Africa', 'NG': 'Africa', 'NU': 'Oceania', 'NF': 'Oceania', 'MP': 'Oceania',
  'NO': 'Europe', 'OM': 'Asia', 'PK': 'Asia', 'PW': 'Oceania', 'PS': 'Asia',
  'PA': 'North America', 'PG': 'Oceania', 'PY': 'South America', 'PE': 'South America',
  'PH': 'Asia', 'PN': 'Oceania', 'PL': 'Europe', 'PT': 'Europe', 'PR': 'North America',
  'QA': 'Asia', 'RE': 'Africa', 'RO': 'Europe', 'RU': 'Europe', 'RW': 'Africa',
  'BL': 'North America', 'SH': 'Africa', 'KN': 'North America', 'LC': 'North America',
  'MF': 'North America', 'PM': 'North America', 'VC': 'North America', 'WS': 'Oceania',
  'SM': 'Europe', 'ST': 'Africa', 'SA': 'Asia', 'SN': 'Africa', 'RS': 'Europe',
  'SC': 'Africa', 'SL': 'Africa', 'SG': 'Asia', 'SX': 'North America', 'SK': 'Europe',
  'SI': 'Europe', 'SB': 'Oceania', 'SO': 'Africa', 'ZA': 'Africa', 'GS': 'Antarctica',
  'SS': 'Africa', 'ES': 'Europe', 'LK': 'Asia', 'SD': 'Africa', 'SR': 'South America',
  'SJ': 'Europe', 'SZ': 'Africa', 'SE': 'Europe', 'CH': 'Europe', 'SY': 'Asia',
  'TW': 'Asia', 'TJ': 'Asia', 'TZ': 'Africa', 'TH': 'Asia', 'TL': 'Asia',
  'TG': 'Africa', 'TK': 'Oceania', 'TO': 'Oceania', 'TT': 'North America',
  'TN': 'Africa', 'TR': 'Asia', 'TM': 'Asia', 'TC': 'North America', 'TV': 'Oceania',
  'UG': 'Africa', 'UA': 'Europe', 'AE': 'Asia', 'GB': 'Europe', 'US': 'North America',
  'UM': 'Oceania', 'UY': 'South America', 'UZ': 'Asia', 'VU': 'Oceania',
  'VE': 'South America', 'VN': 'Asia', 'VG': 'North America', 'VI': 'North America',
  'WF': 'Oceania', 'EH': 'Africa', 'YE': 'Asia', 'ZM': 'Africa', 'ZW': 'Africa'
};

function calculateAreaFromPopulation(population) {
  if (!population || population === 0) return 0;
  // Basit hesaplama: nüfusa göre yaklaşık alan
  return Math.round(population * 0.3);
}

async function processAllCountriesData() {
  console.log('🌍 AllCountries.zip dosyasından TÜM dünya verileri işleniyor...');
  console.log('⏳ Bu işlem 10-15 dakika sürebilir...\n');
  
  const zipPath = path.join(__dirname, '../prisma/data/allCountries.zip');
  
  // Veri koleksiyonları
  const countries = new Map();
  const cities = [];
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
              
              if (lineCount % 100000 === 0) {
                console.log(`📊 ${lineCount} satır işlendi...`);
              }
              
              const parts = line.split('\t');
              if (parts.length >= 17) {
                const featureCode = parts[7];
                const countryCode = parts[8];
                
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
                
                // Kategorilere ayır
                if (FEATURE_CODES.COUNTRIES.includes(featureCode)) {
                  if (!countries.has(countryCode) || 
                      countries.get(countryCode).population < location.population) {
                    countries.set(countryCode, location);
                  }
                } else if (FEATURE_CODES.CITIES.includes(featureCode)) {
                  cities.push(location);
                } else if (FEATURE_CODES.DISTRICTS.includes(featureCode)) {
                  districts.push(location);
                } else if (FEATURE_CODES.TOWNS.includes(featureCode)) {
                  towns.push(location);
                }
                
                stats.processed++;
              }
            });
            
            rl.on('close', () => {
              console.log(`✅ Toplam ${lineCount} satır işlendi`);
              console.log(`🌍 ${countries.size} ülke bulundu`);
              console.log(`🏙️ ${cities.length} şehir bulundu`);
              console.log(`🏘️ ${districts.length} ilçe bulundu`);
              console.log(`🏠 ${towns.length} kasaba bulundu`);
              
              resolve({
                countries: Array.from(countries.values()),
                cities,
                districts,
                towns
              });
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
        if (countries.size === 0) {
          reject(new Error('Hiç veri bulunamadı'));
        }
      });
    });
  });
}

async function createCountries(countries) {
  console.log('\n🌍 Ülkeler veritabanına ekleniyor...');
  
  // Önce mevcut verileri temizle
  console.log('🧹 Mevcut veriler temizleniyor...');
  await prisma.town.deleteMany({});
  await prisma.district.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.country.deleteMany({});
  
  const countryMap = new Map();
  
  for (const country of countries) {
    try {
      const countryData = {
        geonameid: country.geonameid,
        name: country.name,
        asciiname: country.asciiname || country.name,
        alternatenames: country.alternatenames || '',
        iso2: country.country_code,
        iso3: country.country_code + 'R',
        latitude: country.latitude,
        longitude: country.longitude,
        population: country.population,
        area_sqkm: calculateAreaFromPopulation(country.population),
        continent: CONTINENT_INFO[country.country_code] || 'Unknown',
        currency_code: getCurrencyCode(country.country_code),
        phone_code: getPhoneCode(country.country_code),
        timezone: country.timezone
      };
      
      const createdCountry = await prisma.country.create({
        data: countryData
      });
      
      countryMap.set(country.country_code, createdCountry);
      stats.countries++;
      
      if (stats.countries % 10 === 0) {
        console.log(`✅ ${stats.countries} ülke eklendi`);
      }
      
    } catch (error) {
      console.error(`❌ ${country.name} ülkesi eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ Toplam ${stats.countries} ülke eklendi`);
  return countryMap;
}

async function createCities(cities, countryMap) {
  console.log('\n🏙️ Şehirler veritabanına ekleniyor...');
  
  const cityMap = new Map();
  const batchSize = 1000;
  
  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    
    for (const city of batch) {
      try {
        const country = countryMap.get(city.country_code);
        if (!country) continue;
        
        const cityData = {
          geonameid: city.geonameid,
          name: city.name,
          asciiname: city.asciiname || city.name,
          alternatenames: city.alternatenames || '',
          latitude: city.latitude,
          longitude: city.longitude,
          population: city.population,
          area_sqkm: calculateAreaFromPopulation(city.population),
          elevation: city.elevation || city.dem || 0,
          timezone: city.timezone,
          admin1_code: city.admin1_code,
          country_id: country.id
        };
        
        const createdCity = await prisma.city.create({
          data: cityData
        });
        
        cityMap.set(`${city.country_code}-${city.geonameid}`, createdCity);
        stats.cities++;
        
      } catch (error) {
        // Hata durumunda devam et
        console.error(`❌ Şehir eklenemedi: ${city.name}`);
      }
    }
    
    console.log(`✅ ${Math.min(i + batchSize, cities.length)}/${cities.length} şehir işlendi`);
  }
  
  console.log(`✅ Toplam ${stats.cities} şehir eklendi`);
  return cityMap;
}

async function createDistricts(districts, countryMap, cityMap) {
  console.log('\n🏘️ İlçeler veritabanına ekleniyor...');
  
  const districtMap = new Map();
  const batchSize = 1000;
  
  for (let i = 0; i < districts.length; i += batchSize) {
    const batch = districts.slice(i, i + batchSize);
    
    for (const district of batch) {
      try {
        const country = countryMap.get(district.country_code);
        if (!country) continue;
        
        // En yakın şehri bul
        let city = null;
        for (const [key, value] of cityMap) {
          if (key.startsWith(district.country_code + '-')) {
            city = value;
            break;
          }
        }
        
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
        console.error(`❌ İlçe eklenemedi: ${district.name}`);
      }
    }
    
    console.log(`✅ ${Math.min(i + batchSize, districts.length)}/${districts.length} ilçe işlendi`);
  }
  
  console.log(`✅ Toplam ${stats.districts} ilçe eklendi`);
  return districtMap;
}

async function createTowns(towns, countryMap, cityMap, districtMap) {
  console.log('\n🏠 Kasabalar veritabanına ekleniyor...');
  
  const batchSize = 1000;
  
  for (let i = 0; i < towns.length; i += batchSize) {
    const batch = towns.slice(i, i + batchSize);
    
    for (const town of batch) {
      try {
        const country = countryMap.get(town.country_code);
        if (!country) continue;
        
        // En yakın şehir ve ilçeyi bul
        let city = null;
        let district = null;
        
        for (const [key, value] of cityMap) {
          if (key.startsWith(town.country_code + '-')) {
            city = value;
            break;
          }
        }
        
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
        console.error(`❌ Kasaba eklenemedi: ${town.name}`);
      }
    }
    
    console.log(`✅ ${Math.min(i + batchSize, towns.length)}/${towns.length} kasaba işlendi`);
  }
  
  console.log(`✅ Toplam ${stats.towns} kasaba eklendi`);
}

function getCurrencyCode(countryCode) {
  const currencies = {
    'TR': 'TRY', 'US': 'USD', 'DE': 'EUR', 'FR': 'EUR', 'GB': 'GBP', 'IT': 'EUR',
    'ES': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'RU': 'RUB',
    'CA': 'CAD', 'AU': 'AUD', 'MX': 'MXN', 'AR': 'ARS', 'ZA': 'ZAR', 'EG': 'EGP'
  };
  return currencies[countryCode] || 'USD';
}

function getPhoneCode(countryCode) {
  const phones = {
    'TR': '+90', 'US': '+1', 'DE': '+49', 'FR': '+33', 'GB': '+44', 'IT': '+39',
    'ES': '+34', 'JP': '+81', 'CN': '+86', 'IN': '+91', 'BR': '+55', 'RU': '+7',
    'CA': '+1', 'AU': '+61', 'MX': '+52', 'AR': '+54', 'ZA': '+27', 'EG': '+20'
  };
  return phones[countryCode] || '+1';
}

async function main() {
  try {
    console.log('🚀 TÜM dünya verileri import ediliyor...');
    console.log('📊 Ülkeler, şehirler, ilçeler ve kasabalar dahil');
    console.log('⏳ Bu işlem 15-20 dakika sürebilir...\n');
    
    // AllCountries.zip'ten tüm verileri çıkar
    const data = await processAllCountriesData();
    
    // Sırayla import et
    const countryMap = await createCountries(data.countries);
    const cityMap = await createCities(data.cities, countryMap);
    const districtMap = await createDistricts(data.districts, countryMap, cityMap);
    await createTowns(data.towns, countryMap, cityMap, districtMap);
    
    console.log('\n🎉 TÜM DÜNYA VERİLERİ İMPORT TAMAMLANDI!');
    console.log('📊 İstatistikler:');
    console.log(`🌍 Ülkeler: ${stats.countries}`);
    console.log(`🏙️ Şehirler: ${stats.cities}`);
    console.log(`🏘️ İlçeler: ${stats.districts}`);
    console.log(`🏠 Kasabalar: ${stats.towns}`);
    console.log(`📍 Toplam lokasyon: ${stats.countries + stats.cities + stats.districts + stats.towns}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 