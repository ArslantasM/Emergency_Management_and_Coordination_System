const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');
const readline = require('readline');

const prisma = new PrismaClient();

// Tüm ülke feature kodları
const COUNTRY_FEATURE_CODES = [
  'PCLI', // independent political entity
  'PCLD', // dependent political entity
  'PCLF', // freely associated state
  'PCLS', // semi-independent political entity
  'TERR'  // territory
];

// Kıta bilgileri (genişletilmiş)
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

let stats = {
  countries: 0,
  byFeatureCode: {}
};

async function extractAndProcessCountries() {
  console.log('🌍 AllCountries.zip dosyasından TÜM ülke türleri çıkarılıyor...');
  console.log(`🔍 Aranan feature kodları: ${COUNTRY_FEATURE_CODES.join(', ')}`);
  
  const zipPath = path.join(__dirname, '../prisma/data/allCountries.zip');
  const countries = new Map();
  
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
            
            rl.on('line', (line) => {
              const parts = line.split('\t');
              if (parts.length >= 17) {
                const featureCode = parts[7];
                const countryCode = parts[8];
                
                // Tüm ülke tiplerini al
                if (COUNTRY_FEATURE_CODES.includes(featureCode)) {
                  const country = {
                    geonameid: parseInt(parts[0]),
                    name: parts[1],
                    asciiname: parts[2],
                    alternatenames: parts[3],
                    latitude: parseFloat(parts[4]) || 0,
                    longitude: parseFloat(parts[5]) || 0,
                    country_code: countryCode,
                    population: parseInt(parts[14]) || 0,
                    timezone: parts[17] || 'UTC',
                    feature_code: featureCode
                  };
                  
                  // Aynı ülke kodu için en büyük population'lı olanı al
                  if (!countries.has(countryCode) || 
                      countries.get(countryCode).population < country.population) {
                    countries.set(countryCode, country);
                  }
                  
                  // İstatistik
                  stats.byFeatureCode[featureCode] = (stats.byFeatureCode[featureCode] || 0) + 1;
                  
                  if (countries.size % 10 === 0) {
                    console.log(`📍 ${countries.size} ülke bulundu`);
                  }
                }
              }
            });
            
            rl.on('close', () => {
              console.log(`✅ Toplam ${countries.size} ülke bulundu`);
              console.log('📊 Feature kodlarına göre dağılım:');
              Object.entries(stats.byFeatureCode).forEach(([code, count]) => {
                console.log(`  ${code}: ${count}`);
              });
              resolve(Array.from(countries.values()));
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
          reject(new Error('Hiç ülke bulunamadı'));
        }
      });
    });
  });
}

function calculateAreaFromPopulation(population) {
  if (!population || population === 0) return 0;
  return Math.round(population * 0.5);
}

async function createCountries(countries) {
  console.log('\n🌍 Ülkeler veritabanına ekleniyor...');
  
  // Önce mevcut ülkeleri temizle
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
  
  console.log(`✅ Toplam ${stats.countries} ülke başarıyla eklendi`);
  return countryMap;
}

function getCurrencyCode(countryCode) {
  const currencies = {
    'TR': 'TRY', 'US': 'USD', 'DE': 'EUR', 'FR': 'EUR', 'GB': 'GBP', 'IT': 'EUR',
    'ES': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'RU': 'RUB',
    'CA': 'CAD', 'AU': 'AUD', 'MX': 'MXN', 'AR': 'ARS', 'ZA': 'ZAR', 'EG': 'EGP',
    'NG': 'NGN', 'KE': 'KES', 'AT': 'EUR', 'BE': 'EUR', 'NL': 'EUR', 'PT': 'EUR',
    'GR': 'EUR', 'IE': 'EUR', 'FI': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR',
    'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'SI': 'EUR', 'SK': 'EUR', 'CH': 'CHF',
    'NO': 'NOK', 'SE': 'SEK', 'DK': 'DKK', 'IS': 'ISK', 'PL': 'PLN', 'CZ': 'CZK',
    'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK', 'RS': 'RSD', 'BA': 'BAM',
    'MK': 'MKD', 'AL': 'ALL', 'ME': 'EUR', 'XK': 'EUR', 'MD': 'MDL', 'UA': 'UAH',
    'BY': 'BYN', 'LI': 'CHF', 'AD': 'EUR', 'MC': 'EUR', 'SM': 'EUR', 'VA': 'EUR'
  };
  return currencies[countryCode] || 'USD';
}

function getPhoneCode(countryCode) {
  const phones = {
    'TR': '+90', 'US': '+1', 'DE': '+49', 'FR': '+33', 'GB': '+44', 'IT': '+39',
    'ES': '+34', 'JP': '+81', 'CN': '+86', 'IN': '+91', 'BR': '+55', 'RU': '+7',
    'CA': '+1', 'AU': '+61', 'MX': '+52', 'AR': '+54', 'ZA': '+27', 'EG': '+20',
    'NG': '+234', 'KE': '+254', 'AT': '+43', 'BE': '+32', 'NL': '+31', 'PT': '+351',
    'GR': '+30', 'IE': '+353', 'FI': '+358', 'LU': '+352', 'MT': '+356', 'CY': '+357',
    'EE': '+372', 'LV': '+371', 'LT': '+370', 'SI': '+386', 'SK': '+421', 'CH': '+41',
    'NO': '+47', 'SE': '+46', 'DK': '+45', 'IS': '+354', 'PL': '+48', 'CZ': '+420',
    'HU': '+36', 'RO': '+40', 'BG': '+359', 'HR': '+385', 'RS': '+381', 'BA': '+387',
    'MK': '+389', 'AL': '+355', 'ME': '+382', 'MD': '+373', 'UA': '+380', 'BY': '+375'
  };
  return phones[countryCode] || '+1';
}

async function main() {
  try {
    console.log('🚀 TÜM dünya ülkeleri ve bağımlı bölgeleri import ediliyor...');
    console.log('⏳ Bu işlem birkaç dakika sürebilir...\n');
    
    // AllCountries.zip'ten ülkeleri çıkar
    const countries = await extractAndProcessCountries();
    
    // Ülkeleri veritabanına ekle
    const countryMap = await createCountries(countries);
    
    console.log('\n📊 İmport tamamlandı!');
    console.log(`🌍 Toplam ${stats.countries} ülke/bölge eklendi`);
    console.log(`📍 Kıtalar: ${new Set(Object.values(CONTINENT_INFO)).size}`);
    
  } catch (error) {
    console.error('❌ Import hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 