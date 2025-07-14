const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');
const readline = require('readline');

const prisma = new PrismaClient();

// ISO ülke kodlarını tam ülke adlarıyla eşleştiren mapping
const countryCodeMapping = {
  'AD': 'Principality of Andorra',
  'AE': 'United Arab Emirates',
  'AF': 'Islamic Republic of Afghanistan',
  'AG': 'Antigua and Barbuda',
  'AI': 'Anguilla',
  'AL': 'Republic of Albania',
  'AM': 'Republic of Armenia',
  'AO': 'Republic of Angola',
  'AQ': 'Antarctica',
  'AR': 'Argentine Republic',
  'AS': 'American Samoa',
  'AT': 'Republic of Austria',
  'AU': 'Commonwealth of Australia',
  'AW': 'Aruba',
  'AX': 'Åland Islands',
  'AZ': 'Republic of Azerbaijan',
  'BA': 'Bosnia and Herzegovina',
  'BB': 'Barbados',
  'BD': 'People\'s Republic of Bangladesh',
  'BE': 'Kingdom of Belgium',
  'BF': 'Burkina Faso',
  'BG': 'Republic of Bulgaria',
  'BH': 'Kingdom of Bahrain',
  'BI': 'Republic of Burundi',
  'BJ': 'Republic of Benin',
  'BL': 'Saint Barthélemy',
  'BM': 'Bermuda',
  'BN': 'Brunei Darussalam',
  'BO': 'Plurinational State of Bolivia',
  'BQ': 'Bonaire, Sint Eustatius and Saba',
  'BR': 'Federative Republic of Brazil',
  'BS': 'Commonwealth of the Bahamas',
  'BT': 'Kingdom of Bhutan',
  'BV': 'Bouvet Island',
  'BW': 'Republic of Botswana',
  'BY': 'Republic of Belarus',
  'BZ': 'Belize',
  'CA': 'Canada',
  'CC': 'Cocos (Keeling) Islands',
  'CD': 'Democratic Republic of the Congo',
  'CF': 'Central African Republic',
  'CG': 'Republic of the Congo',
  'CH': 'Swiss Confederation',
  'CI': 'Republic of Côte d\'Ivoire',
  'CK': 'Cook Islands',
  'CL': 'Republic of Chile',
  'CM': 'Republic of Cameroon',
  'CN': 'People\'s Republic of China',
  'CO': 'Republic of Colombia',
  'CR': 'Republic of Costa Rica',
  'CU': 'Republic of Cuba',
  'CV': 'Republic of Cabo Verde',
  'CW': 'Curaçao',
  'CX': 'Christmas Island',
  'CY': 'Republic of Cyprus',
  'CZ': 'Czech Republic',
  'DE': 'Federal Republic of Germany',
  'DJ': 'Republic of Djibouti',
  'DK': 'Kingdom of Denmark',
  'DM': 'Commonwealth of Dominica',
  'DO': 'Dominican Republic',
  'DZ': 'People\'s Democratic Republic of Algeria',
  'EC': 'Republic of Ecuador',
  'EE': 'Republic of Estonia',
  'EG': 'Arab Republic of Egypt',
  'EH': 'Western Sahara',
  'ER': 'State of Eritrea',
  'ES': 'Kingdom of Spain',
  'ET': 'Federal Democratic Republic of Ethiopia',
  'FI': 'Republic of Finland',
  'FJ': 'Republic of Fiji',
  'FK': 'Falkland Islands (Malvinas)',
  'FM': 'Federated States of Micronesia',
  'FO': 'Faroe Islands',
  'FR': 'French Republic',
  'GA': 'Gabonese Republic',
  'GB': 'United Kingdom of Great Britain and Northern Ireland',
  'GD': 'Grenada',
  'GE': 'Georgia',
  'GF': 'French Guiana',
  'GG': 'Bailiwick of Guernsey',
  'GH': 'Republic of Ghana',
  'GI': 'Gibraltar',
  'GL': 'Greenland',
  'GM': 'Republic of the Gambia',
  'GN': 'Republic of Guinea',
  'GP': 'Guadeloupe',
  'GQ': 'Republic of Equatorial Guinea',
  'GR': 'Hellenic Republic',
  'GS': 'South Georgia and the South Sandwich Islands',
  'GT': 'Republic of Guatemala',
  'GU': 'Guam',
  'GW': 'Republic of Guinea-Bissau',
  'GY': 'Co-operative Republic of Guyana',
  'HK': 'Hong Kong Special Administrative Region of China',
  'HM': 'Heard Island and McDonald Islands',
  'HN': 'Republic of Honduras',
  'HR': 'Republic of Croatia',
  'HT': 'Republic of Haiti',
  'HU': 'Hungary',
  'ID': 'Republic of Indonesia',
  'IE': 'Ireland',
  'IL': 'State of Israel',
  'IM': 'Isle of Man',
  'IN': 'Republic of India',
  'IO': 'British Indian Ocean Territory',
  'IQ': 'Republic of Iraq',
  'IR': 'Islamic Republic of Iran',
  'IS': 'Iceland',
  'IT': 'Italian Republic',
  'JE': 'Bailiwick of Jersey',
  'JM': 'Jamaica',
  'JO': 'Hashemite Kingdom of Jordan',
  'JP': 'Japan',
  'KE': 'Republic of Kenya',
  'KG': 'Kyrgyz Republic',
  'KH': 'Kingdom of Cambodia',
  'KI': 'Republic of Kiribati',
  'KM': 'Union of the Comoros',
  'KN': 'Federation of Saint Christopher and Nevis',
  'KP': 'Democratic People\'s Republic of Korea',
  'KR': 'Republic of Korea',
  'KW': 'State of Kuwait',
  'KY': 'Cayman Islands',
  'KZ': 'Republic of Kazakhstan',
  'LA': 'Lao People\'s Democratic Republic',
  'LB': 'Lebanese Republic',
  'LC': 'Saint Lucia',
  'LI': 'Principality of Liechtenstein',
  'LK': 'Democratic Socialist Republic of Sri Lanka',
  'LR': 'Republic of Liberia',
  'LS': 'Kingdom of Lesotho',
  'LT': 'Republic of Lithuania',
  'LU': 'Grand Duchy of Luxembourg',
  'LV': 'Republic of Latvia',
  'LY': 'State of Libya',
  'MA': 'Kingdom of Morocco',
  'MC': 'Principality of Monaco',
  'MD': 'Republic of Moldova',
  'ME': 'Montenegro',
  'MF': 'Saint Martin (French part)',
  'MG': 'Republic of Madagascar',
  'MH': 'Republic of the Marshall Islands',
  'MK': 'Republic of North Macedonia',
  'ML': 'Republic of Mali',
  'MM': 'Republic of the Union of Myanmar',
  'MN': 'Mongolia',
  'MO': 'Macao Special Administrative Region of China',
  'MP': 'Northern Mariana Islands',
  'MQ': 'Martinique',
  'MR': 'Islamic Republic of Mauritania',
  'MS': 'Montserrat',
  'MT': 'Republic of Malta',
  'MU': 'Republic of Mauritius',
  'MV': 'Republic of Maldives',
  'MW': 'Republic of Malawi',
  'MX': 'United Mexican States',
  'MY': 'Malaysia',
  'MZ': 'Republic of Mozambique',
  'NA': 'Republic of Namibia',
  'NC': 'New Caledonia',
  'NE': 'Republic of the Niger',
  'NF': 'Norfolk Island',
  'NG': 'Federal Republic of Nigeria',
  'NI': 'Republic of Nicaragua',
  'NL': 'Kingdom of the Netherlands',
  'NO': 'Kingdom of Norway',
  'NP': 'Federal Democratic Republic of Nepal',
  'NR': 'Republic of Nauru',
  'NU': 'Niue',
  'NZ': 'New Zealand',
  'OM': 'Sultanate of Oman',
  'PA': 'Republic of Panama',
  'PE': 'Republic of Peru',
  'PF': 'French Polynesia',
  'PG': 'Independent State of Papua New Guinea',
  'PH': 'Republic of the Philippines',
  'PK': 'Islamic Republic of Pakistan',
  'PL': 'Republic of Poland',
  'PM': 'Saint Pierre and Miquelon',
  'PN': 'Pitcairn',
  'PR': 'Puerto Rico',
  'PS': 'State of Palestine',
  'PT': 'Portuguese Republic',
  'PW': 'Republic of Palau',
  'PY': 'Republic of Paraguay',
  'QA': 'State of Qatar',
  'RE': 'Réunion',
  'RO': 'Romania',
  'RS': 'Republic of Serbia',
  'RU': 'Russian Federation',
  'RW': 'Republic of Rwanda',
  'SA': 'Kingdom of Saudi Arabia',
  'SB': 'Solomon Islands',
  'SC': 'Republic of Seychelles',
  'SD': 'Republic of the Sudan',
  'SE': 'Kingdom of Sweden',
  'SG': 'Republic of Singapore',
  'SH': 'Saint Helena, Ascension and Tristan da Cunha',
  'SI': 'Republic of Slovenia',
  'SJ': 'Svalbard and Jan Mayen',
  'SK': 'Slovak Republic',
  'SL': 'Republic of Sierra Leone',
  'SM': 'Republic of San Marino',
  'SN': 'Republic of Senegal',
  'SO': 'Federal Republic of Somalia',
  'SR': 'Republic of Suriname',
  'SS': 'Republic of South Sudan',
  'ST': 'Democratic Republic of São Tomé and Príncipe',
  'SV': 'Republic of El Salvador',
  'SX': 'Sint Maarten (Dutch part)',
  'SY': 'Syrian Arab Republic',
  'SZ': 'Kingdom of Eswatini',
  'TC': 'Turks and Caicos Islands',
  'TD': 'Republic of Chad',
  'TF': 'French Southern Territories',
  'TG': 'Togolese Republic',
  'TH': 'Kingdom of Thailand',
  'TJ': 'Republic of Tajikistan',
  'TK': 'Tokelau',
  'TL': 'Democratic Republic of Timor-Leste',
  'TM': 'Turkmenistan',
  'TN': 'Republic of Tunisia',
  'TO': 'Kingdom of Tonga',
  'TR': 'Republic of Turkey',
  'TT': 'Republic of Trinidad and Tobago',
  'TV': 'Tuvalu',
  'TW': 'Taiwan, Province of China',
  'TZ': 'United Republic of Tanzania',
  'UA': 'Ukraine',
  'UG': 'Republic of Uganda',
  'UM': 'United States Minor Outlying Islands',
  'US': 'United States of America',
  'UY': 'Oriental Republic of Uruguay',
  'UZ': 'Republic of Uzbekistan',
  'VA': 'Vatican City State',
  'VC': 'Saint Vincent and the Grenadines',
  'VE': 'Bolivarian Republic of Venezuela',
  'VG': 'British Virgin Islands',
  'VI': 'United States Virgin Islands',
  'VN': 'Socialist Republic of Viet Nam',
  'VU': 'Republic of Vanuatu',
  'WF': 'Wallis and Futuna',
  'WS': 'Independent State of Samoa',
  'YE': 'Republic of Yemen',
  'YT': 'Mayotte',
  'ZA': 'Republic of South Africa',
  'ZM': 'Republic of Zambia',
  'ZW': 'Republic of Zimbabwe'
};

// Önemli ülkeler (nüfus 1M+, stratejik öneme sahip)
const PRIORITY_COUNTRIES = [
  'TR', 'US', 'CN', 'IN', 'ID', 'BR', 'PK', 'BD', 'NG', 'RU', 'MX', 'JP', 'PH', 'ET',
  'VN', 'EG', 'DE', 'IR', 'TH', 'GB', 'FR', 'IT', 'ZA', 'TZ', 'MM', 'KE', 'KR', 'CO',
  'ES', 'UG', 'AR', 'DZ', 'SD', 'UA', 'IQ', 'AF', 'PL', 'CA', 'MA', 'SA', 'UZ', 'PE',
  'MY', 'AO', 'MZ', 'GH', 'YE', 'NP', 'VE', 'MG', 'CM', 'AU', 'CI', 'NE', 'LK', 'BF',
  'ML', 'RO', 'MW', 'CL', 'KZ', 'ZM', 'GT', 'EC', 'SN', 'CD', 'ZW', 'GN', 'RW', 'BJ',
  'TN', 'BI', 'SO', 'TD', 'SS', 'TG', 'CH', 'BE', 'CU', 'BO', 'GR', 'DO', 'CZ', 'PT',
  'AZ', 'SE', 'HN', 'BY', 'HU', 'TJ', 'AT', 'IL', 'RS', 'PG', 'JO', 'CH'
];

// Feature kodları
const FEATURE_CODES = {
  COUNTRIES: ['PCLI', 'PCLD', 'PCLF', 'PCLS'],
  CITIES: ['PPLC', 'PPLA', 'PPLA2', 'PPL'],
  DISTRICTS: ['ADM2', 'ADM3', 'ADM4'],
  TOWNS: ['PPLS', 'PPLX', 'PPLH', 'PPLL']
};

let stats = {
  countries: 0,
  cities: 0,
  districts: 0,
  towns: 0,
  processed: 0,
  errors: 0
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
  return Math.round(population * 0.3);
}

// Mapping cache'leri
const countryCache = new Map(); // geonameid -> country record
const cityCache = new Map(); // geonameid -> city record
const districtCache = new Map(); // geonameid -> district record

// Admin kod mapping'leri
const adminCodeMappings = new Map(); // country_code + admin1_code -> city_id

async function processWorldData() {
  console.log('🌍 Dünya coğrafi verileri işleniyor...');
  console.log(`🎯 Hedef ülkeler: ${PRIORITY_COUNTRIES.length} ülke`);
  console.log('⏳ Bu işlem 5-10 dakika sürebilir...\n');
  
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
                
                // Kategorilere ayır
                if (FEATURE_CODES.COUNTRIES.includes(featureCode)) {
                  if (!countries.has(countryCode) || 
                      countries.get(countryCode).population < location.population) {
                    countries.set(countryCode, location);
                  }
                } else if (FEATURE_CODES.CITIES.includes(featureCode) && location.population >= 50000) {
                  cities.push(location);
                } else if (FEATURE_CODES.DISTRICTS.includes(featureCode)) {
                  districts.push(location);
                } else if (FEATURE_CODES.TOWNS.includes(featureCode) && location.population >= 1000) {
                  towns.push(location);
                }
                
                stats.processed++;
              }
            });
            
            rl.on('close', () => {
              console.log(`✅ Toplam ${lineCount} satır işlendi`);
              console.log(`🌍 ${countries.size} ülke bulundu`);
              console.log(`🏙️ ${cities.length} şehir bulundu (50K+ nüfus)`);
              console.log(`🏘️ ${districts.length} ilçe bulundu`);
              console.log(`🏠 ${towns.length} kasaba bulundu (1K+ nüfus)`);
              
              resolve({
                countries: Array.from(countries.values()),
                cities,
                districts,
                towns
              });
            });
          });
        } else {
          zipfile.readEntry();
        }
      });
    });
  });
}

async function createCountries(countries) {
  console.log('\n🌍 Ülkeler oluşturuluyor...');
  
  for (const country of countries) {
    try {
      const countryData = {
        geonameid: country.geonameid,
        name: country.name,
        asciiname: country.asciiname,
        alternatenames: country.alternatenames,
        iso2: country.country_code,
        iso3: getISO3Code(country.country_code),
        latitude: country.latitude,
        longitude: country.longitude,
        population: BigInt(country.population),
        area_sqkm: calculateAreaFromPopulation(country.population),
        continent: CONTINENT_INFO[country.country_code],
        currency_code: getCurrencyCode(country.country_code),
        phone_code: getPhoneCode(country.country_code),
        timezone: country.timezone
      };

      const created = await prisma.country.create({
        data: countryData
      });
      
      countryCache.set(country.geonameid, created);
      countryCache.set(country.country_code, created); // ISO kodu ile de erişim
      
      stats.countries++;
      
      if (stats.countries % 10 === 0) {
        console.log(`📍 ${stats.countries} ülke eklendi...`);
      }
    } catch (error) {
      console.error(`❌ Ülke eklenirken hata: ${country.name}`, error.message);
      stats.errors++;
    }
  }
  
  console.log(`✅ ${stats.countries} ülke başarıyla eklendi`);
}

async function createCities(cities) {
  console.log('\n🏙️ Şehirler oluşturuluyor...');
  
  for (const city of cities) {
    try {
      // Ülkeyi bul
      const country = countryCache.get(city.country_code);
      if (!country) {
        console.log(`⚠️ Ülke bulunamadı: ${city.country_code} - ${city.name}`);
        continue;
      }

      const cityData = {
        geonameid: city.geonameid,
        name: city.name,
        asciiname: city.asciiname,
        alternatenames: city.alternatenames,
        latitude: city.latitude,
        longitude: city.longitude,
        population: BigInt(city.population),
        area_sqkm: calculateAreaFromPopulation(city.population),
        elevation: city.elevation,
        timezone: city.timezone,
        admin1_code: city.admin1_code,
        country_id: country.id
      };

      const created = await prisma.city.create({
        data: cityData
      });
      
      cityCache.set(city.geonameid, created);
      
      // Admin kod mapping'i ekle
      if (city.admin1_code) {
        const adminKey = `${city.country_code}_${city.admin1_code}`;
        adminCodeMappings.set(adminKey, created.id);
      }
      
      stats.cities++;
      
      if (stats.cities % 100 === 0) {
        console.log(`📍 ${stats.cities} şehir eklendi...`);
      }
    } catch (error) {
      console.error(`❌ Şehir eklenirken hata: ${city.name}`, error.message);
      stats.errors++;
    }
  }
  
  console.log(`✅ ${stats.cities} şehir başarıyla eklendi`);
}

async function createDistricts(districts) {
  console.log('\n🏘️ İlçeler oluşturuluyor...');
  
  for (const district of districts) {
    try {
      // Ülkeyi bul
      const country = countryCache.get(district.country_code);
      if (!country) {
        console.log(`⚠️ Ülke bulunamadı: ${district.country_code} - ${district.name}`);
        continue;
      }

      // Şehri bulmaya çalış (opsiyonel)
      let cityId = null;
      if (district.admin1_code) {
        const adminKey = `${district.country_code}_${district.admin1_code}`;
        cityId = adminCodeMappings.get(adminKey);
      }

      const districtData = {
        geonameid: district.geonameid,
        name: district.name,
        asciiname: district.asciiname,
        alternatenames: district.alternatenames,
        latitude: district.latitude,
        longitude: district.longitude,
        population: BigInt(district.population),
        area_sqkm: calculateAreaFromPopulation(district.population),
        elevation: district.elevation,
        timezone: district.timezone,
        admin2_code: district.admin2_code,
        country_id: country.id,
        city_id: cityId // Opsiyonel
      };

      const created = await prisma.district.create({
        data: districtData
      });
      
      districtCache.set(district.geonameid, created);
      
      stats.districts++;
      
      if (stats.districts % 100 === 0) {
        console.log(`📍 ${stats.districts} ilçe eklendi...`);
      }
    } catch (error) {
      console.error(`❌ İlçe eklenirken hata: ${district.name}`, error.message);
      stats.errors++;
    }
  }
  
  console.log(`✅ ${stats.districts} ilçe başarıyla eklendi`);
}

async function createTowns(towns) {
  console.log('\n🏠 Kasabalar oluşturuluyor...');
  
  for (const town of towns) {
    try {
      // Ülkeyi bul
      const country = countryCache.get(town.country_code);
      if (!country) {
        console.log(`⚠️ Ülke bulunamadı: ${town.country_code} - ${town.name}`);
        continue;
      }

      // Şehir ve ilçeyi bulmaya çalış (opsiyonel)
      let cityId = null;
      let districtId = null;
      
      if (town.admin1_code) {
        const adminKey = `${town.country_code}_${town.admin1_code}`;
        cityId = adminCodeMappings.get(adminKey);
      }

      const townData = {
        geonameid: town.geonameid,
        name: town.name,
        asciiname: town.asciiname,
        alternatenames: town.alternatenames,
        latitude: town.latitude,
        longitude: town.longitude,
        population: BigInt(town.population),
        area_sqkm: calculateAreaFromPopulation(town.population),
        elevation: town.elevation,
        timezone: town.timezone,
        admin3_code: town.admin3_code,
        country_id: country.id,
        city_id: cityId, // Opsiyonel
        district_id: districtId // Opsiyonel
      };

      await prisma.town.create({
        data: townData
      });
      
      stats.towns++;
      
      if (stats.towns % 100 === 0) {
        console.log(`📍 ${stats.towns} kasaba eklendi...`);
      }
    } catch (error) {
      console.error(`❌ Kasaba eklenirken hata: ${town.name}`, error.message);
      stats.errors++;
    }
  }
  
  console.log(`✅ ${stats.towns} kasaba başarıyla eklendi`);
}

function getISO3Code(iso2) {
  const iso3Map = {
    'TR': 'TUR', 'US': 'USA', 'CN': 'CHN', 'IN': 'IND', 'ID': 'IDN',
    'BR': 'BRA', 'PK': 'PAK', 'BD': 'BGD', 'NG': 'NGA', 'RU': 'RUS',
    'MX': 'MEX', 'JP': 'JPN', 'PH': 'PHL', 'ET': 'ETH', 'VN': 'VNM',
    'EG': 'EGY', 'DE': 'DEU', 'IR': 'IRN', 'TH': 'THA', 'GB': 'GBR',
    'FR': 'FRA', 'IT': 'ITA', 'ZA': 'ZAF', 'TZ': 'TZA', 'MM': 'MMR',
    'KE': 'KEN', 'KR': 'KOR', 'CO': 'COL', 'ES': 'ESP', 'UG': 'UGA'
  };
  return iso3Map[iso2] || iso2;
}

function getCurrencyCode(countryCode) {
  const currencyMap = {
    'TR': 'TRY', 'US': 'USD', 'CN': 'CNY', 'IN': 'INR', 'ID': 'IDR',
    'BR': 'BRL', 'PK': 'PKR', 'BD': 'BDT', 'NG': 'NGN', 'RU': 'RUB',
    'MX': 'MXN', 'JP': 'JPY', 'PH': 'PHP', 'ET': 'ETB', 'VN': 'VND',
    'EG': 'EGP', 'DE': 'EUR', 'IR': 'IRR', 'TH': 'THB', 'GB': 'GBP',
    'FR': 'EUR', 'IT': 'EUR', 'ZA': 'ZAR', 'TZ': 'TZS', 'MM': 'MMK',
    'KE': 'KES', 'KR': 'KRW', 'CO': 'COP', 'ES': 'EUR', 'UG': 'UGX'
  };
  return currencyMap[countryCode] || 'USD';
}

function getPhoneCode(countryCode) {
  const phoneMap = {
    'TR': '+90', 'US': '+1', 'CN': '+86', 'IN': '+91', 'ID': '+62',
    'BR': '+55', 'PK': '+92', 'BD': '+880', 'NG': '+234', 'RU': '+7',
    'MX': '+52', 'JP': '+81', 'PH': '+63', 'ET': '+251', 'VN': '+84',
    'EG': '+20', 'DE': '+49', 'IR': '+98', 'TH': '+66', 'GB': '+44',
    'FR': '+33', 'IT': '+39', 'ZA': '+27', 'TZ': '+255', 'MM': '+95',
    'KE': '+254', 'KR': '+82', 'CO': '+57', 'ES': '+34', 'UG': '+256'
  };
  return phoneMap[countryCode] || '+1';
}

async function main() {
  try {
    console.log('🚀 Dünya coğrafi verileri import işlemi başlıyor...\n');
    
    // Veri işleme
    const data = await processWorldData();
    
    console.log('\n📊 İşlem İstatistikleri:');
    console.log(`🌍 Ülkeler: ${data.countries.length}`);
    console.log(`🏙️ Şehirler: ${data.cities.length}`);
    console.log(`🏘️ İlçeler: ${data.districts.length}`);
    console.log(`🏠 Kasabalar: ${data.towns.length}`);
    
    // Veritabanına kaydetme
    await createCountries(data.countries);
    await createCities(data.cities);
    await createDistricts(data.districts);
    await createTowns(data.towns);
    
    console.log('\n🎉 Import işlemi tamamlandı!');
    console.log(`✅ Toplam ${stats.countries + stats.cities + stats.districts + stats.towns} kayıt eklendi`);
    console.log(`❌ ${stats.errors} hata oluştu`);
    
  } catch (error) {
    console.error('💥 Import işlemi başarısız:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { main }; 