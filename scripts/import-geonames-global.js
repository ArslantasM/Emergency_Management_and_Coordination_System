const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Geonames feature kodları
const FEATURE_CODES = {
  COUNTRY: ['PCLI', 'PCLD', 'PCLF', 'PCLS'], // Ülkeler
  CITY: ['ADM1', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4'], // İller/Şehirler 
  DISTRICT: ['ADM2', 'PPL', 'PPLA2'], // İlçeler
  TOWN: ['ADM3', 'ADM4', 'PPLX', 'PPLL', 'PPLR', 'PPLS'] // Kasabalar/Mahalleler
};

// Öncelikli ülkeler (global test için)
const PRIORITY_COUNTRIES = {
  'TR': { name: 'Turkey', continent: 'Asia', currency: 'TRY', phone: '+90' },
  'US': { name: 'United States', continent: 'North America', currency: 'USD', phone: '+1' },
  'DE': { name: 'Germany', continent: 'Europe', currency: 'EUR', phone: '+49' },
  'FR': { name: 'France', continent: 'Europe', currency: 'EUR', phone: '+33' },
  'GB': { name: 'United Kingdom', continent: 'Europe', currency: 'GBP', phone: '+44' },
  'IT': { name: 'Italy', continent: 'Europe', currency: 'EUR', phone: '+39' },
  'ES': { name: 'Spain', continent: 'Europe', currency: 'EUR', phone: '+34' },
  'JP': { name: 'Japan', continent: 'Asia', currency: 'JPY', phone: '+81' },
  'CN': { name: 'China', continent: 'Asia', currency: 'CNY', phone: '+86' },
  'IN': { name: 'India', continent: 'Asia', currency: 'INR', phone: '+91' }
};

async function loadGeonamesData() {
  console.log('📊 Geonames verilerini yüklüyor...');
  
  try {
    const geonamesPath = path.join(process.cwd(), 'data', 'geonames.json');
    const data = JSON.parse(fs.readFileSync(geonamesPath, 'utf8'));
    
    console.log(`✅ ${Object.keys(data).length} veri kategorisi yüklendi`);
    return data;
  } catch (error) {
    console.error('❌ Geonames verisi yüklenemedi:', error);
    throw error;
  }
}

async function createCountries(geonamesData) {
  console.log('\n🌍 Ülkeler oluşturuluyor...');
  
  const countries = [];
  
  // Öncelikli ülkeleri ekle
  for (const [iso2, countryInfo] of Object.entries(PRIORITY_COUNTRIES)) {
    try {
      const country = await prisma.country.upsert({
        where: { iso2 },
        update: {},
        create: {
          geonameid: Math.floor(Math.random() * 1000000), // Geçici ID
          name: countryInfo.name,
          asciiname: countryInfo.name,
          iso2: iso2,
          iso3: iso2 === 'GB' ? 'GBR' : iso2 + 'R', // Basit ISO3
          continent: countryInfo.continent,
          currency_code: countryInfo.currency,
          phone_code: countryInfo.phone,
          population: 0, // Sonradan hesaplanacak
          area_sqkm: 0   // Sonradan hesaplanacak
        }
      });
      
      countries.push(country);
      console.log(`✅ ${country.name} ülkesi eklendi`);
    } catch (error) {
      console.error(`❌ ${countryInfo.name} ülkesi eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${countries.length} ülke başarıyla eklendi`);
  return countries;
}

async function createCities(geonamesData, countries) {
  console.log('\n🏙️ Şehirler oluşturuluyor...');
  
  const cities = [];
  const cityData = [
    // Türkiye
    { name: 'İstanbul', country: 'TR', geonameid: 745044, lat: 41.0082, lng: 28.9784, pop: 15462452 },
    { name: 'Ankara', country: 'TR', geonameid: 323786, lat: 39.9334, lng: 32.8597, pop: 5663322 },
    { name: 'İzmir', country: 'TR', geonameid: 311044, lat: 38.4237, lng: 27.1428, pop: 4394694 },
    
    // ABD
    { name: 'New York', country: 'US', geonameid: 5128581, lat: 40.7128, lng: -74.0060, pop: 8336817 },
    { name: 'Los Angeles', country: 'US', geonameid: 5368361, lat: 34.0522, lng: -118.2437, pop: 3979576 },
    
    // Almanya
    { name: 'Berlin', country: 'DE', geonameid: 2950159, lat: 52.5200, lng: 13.4050, pop: 3669491 },
    { name: 'Hamburg', country: 'DE', geonameid: 2911298, lat: 53.5511, lng: 9.9937, pop: 1899160 },
    
    // Fransa
    { name: 'Paris', country: 'FR', geonameid: 2988507, lat: 48.8566, lng: 2.3522, pop: 2165423 },
    
    // İngiltere
    { name: 'London', country: 'GB', geonameid: 2643743, lat: 51.5074, lng: -0.1278, pop: 9648110 },
    
    // İtalya
    { name: 'Rome', country: 'IT', geonameid: 3169070, lat: 41.9028, lng: 12.4964, pop: 2872800 }
  ];
  
  for (const cityInfo of cityData) {
    try {
      const country = countries.find(c => c.iso2 === cityInfo.country);
      if (!country) {
        console.warn(`⚠️ ${cityInfo.country} ülkesi bulunamadı`);
        continue;
      }
      
      const city = await prisma.city.upsert({
        where: { geonameid: cityInfo.geonameid },
        update: {},
        create: {
          geonameid: cityInfo.geonameid,
          name: cityInfo.name,
          asciiname: cityInfo.name,
          latitude: cityInfo.lat,
          longitude: cityInfo.lng,
          population: cityInfo.pop,
          timezone: 'Europe/Istanbul', // Basitleştirme
          country_id: country.id
        }
      });
      
      cities.push(city);
      console.log(`✅ ${city.name} şehri eklendi`);
    } catch (error) {
      console.error(`❌ ${cityInfo.name} şehri eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${cities.length} şehir başarıyla eklendi`);
  return cities;
}

async function createDistricts(cities) {
  console.log('\n🏘️ İlçeler oluşturuluyor...');
  
  const districts = [];
  const districtData = [
    // İstanbul
    { name: 'Kadıköy', city: 'İstanbul', geonameid: 745042, lat: 40.9833, lng: 29.0333, pop: 467919 },
    { name: 'Beşiktaş', city: 'İstanbul', geonameid: 745041, lat: 41.0422, lng: 29.0061, pop: 175190 },
    { name: 'Şişli', city: 'İstanbul', geonameid: 745040, lat: 41.0602, lng: 28.9887, pop: 233353 },
    
    // New York
    { name: 'Manhattan', city: 'New York', geonameid: 5125771, lat: 40.7831, lng: -73.9712, pop: 1694251 },
    { name: 'Brooklyn', city: 'New York', geonameid: 5110302, lat: 40.6782, lng: -73.9442, pop: 2736074 },
    
    // Berlin
    { name: 'Mitte', city: 'Berlin', geonameid: 2867543, lat: 52.5170, lng: 13.3889, pop: 384172 },
    { name: 'Kreuzberg', city: 'Berlin', geonameid: 2867542, lat: 52.4988, lng: 13.4103, pop: 153073 },
    
    // London
    { name: 'Westminster', city: 'London', geonameid: 2634341, lat: 51.4975, lng: -0.1357, pop: 247614 },
    { name: 'Camden', city: 'London', geonameid: 2654675, lat: 51.5492, lng: -0.1426, pop: 270029 },
    
    // Paris
    { name: '1st Arrondissement', city: 'Paris', geonameid: 2988506, lat: 48.8607, lng: 2.3404, pop: 16888 }
  ];
  
  for (const districtInfo of districtData) {
    try {
      const city = cities.find(c => c.name === districtInfo.city);
      if (!city) {
        console.warn(`⚠️ ${districtInfo.city} şehri bulunamadı`);
        continue;
      }
      
      const district = await prisma.district.upsert({
        where: { geonameid: districtInfo.geonameid },
        update: {},
        create: {
          geonameid: districtInfo.geonameid,
          name: districtInfo.name,
          asciiname: districtInfo.name,
          latitude: districtInfo.lat,
          longitude: districtInfo.lng,
          population: districtInfo.pop,
          timezone: 'Europe/Istanbul', // Basitleştirme
          country_id: city.country_id,
          city_id: city.id
        }
      });
      
      districts.push(district);
      console.log(`✅ ${district.name} ilçesi eklendi`);
    } catch (error) {
      console.error(`❌ ${districtInfo.name} ilçesi eklenemedi:`, error.message);
    }
  }
  
  console.log(`✅ ${districts.length} ilçe başarıyla eklendi`);
  return districts;
}

async function createSampleRegions(countries, cities, districts) {
  console.log('\n🗺️ Örnek acil durum bölgeleri oluşturuluyor...');
  
  const regions = [];
  const regionData = [
    {
      name: 'Marmara Deprem Bölgesi',
      description: 'İstanbul ve çevresi deprem risk bölgesi',
      type: 'earthquake',
      level: 'HIGH'
    },
    {
      name: 'Akdeniz Yangın Bölgesi', 
      description: 'Güney Türkiye orman yangını risk bölgesi',
      type: 'fire',
      level: 'MEDIUM'
    },
    {
      name: 'Avrupa Sel Bölgesi',
      description: 'Avrupa şehirleri sel risk bölgesi', 
      type: 'flood',
      level: 'MEDIUM'
    },
    {
      name: 'Global Acil Müdahale Bölgesi',
      description: 'Dünya geneli acil durum koordinasyon bölgesi',
      type: 'emergency',
      level: 'LOW'
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
      
      regions.push(region);
      console.log(`✅ ${region.name} bölgesi oluşturuldu`);
    } catch (error) {
      console.error(`❌ ${regionInfo.name} bölgesi oluşturulamadı:`, error.message);
    }
  }
  
  console.log(`✅ ${regions.length} acil durum bölgesi başarıyla oluşturuldu`);
  return regions;
}

async function linkRegionsToGeography(regions, countries, cities, districts) {
  console.log('\n🔗 Bölgeleri coğrafi alanlara bağlıyor...');
  
  try {
    // Marmara Deprem Bölgesi -> Türkiye, İstanbul
    const marmaraRegion = regions.find(r => r.name.includes('Marmara'));
    const turkey = countries.find(c => c.iso2 === 'TR');
    const istanbul = cities.find(c => c.name === 'İstanbul');
    
    if (marmaraRegion && turkey && istanbul) {
      await prisma.regionCountry.create({
        data: { region_id: marmaraRegion.id, country_id: turkey.id }
      });
      await prisma.regionCity.create({
        data: { region_id: marmaraRegion.id, city_id: istanbul.id }
      });
      console.log('✅ Marmara bölgesi Türkiye/İstanbul\'a bağlandı');
    }
    
    // Avrupa Sel Bölgesi -> Almanya, Berlin
    const europeRegion = regions.find(r => r.name.includes('Avrupa'));
    const germany = countries.find(c => c.iso2 === 'DE');
    const berlin = cities.find(c => c.name === 'Berlin');
    
    if (europeRegion && germany && berlin) {
      await prisma.regionCountry.create({
        data: { region_id: europeRegion.id, country_id: germany.id }
      });
      await prisma.regionCity.create({
        data: { region_id: europeRegion.id, city_id: berlin.id }
      });
      console.log('✅ Avrupa bölgesi Almanya/Berlin\'e bağlandı');
    }
    
    // Global Bölge -> Tüm ülkeler
    const globalRegion = regions.find(r => r.name.includes('Global'));
    if (globalRegion) {
      for (const country of countries.slice(0, 3)) { // İlk 3 ülke
        await prisma.regionCountry.create({
          data: { region_id: globalRegion.id, country_id: country.id }
        });
      }
      console.log('✅ Global bölge ülkelere bağlandı');
    }
    
  } catch (error) {
    console.error('❌ Bölge bağlantıları oluşturulamadı:', error.message);
  }
}

async function updateRegionStatistics() {
  console.log('\n📊 Bölge istatistikleri hesaplanıyor...');
  
  try {
    const regions = await prisma.region.findMany({
      include: {
        countries: { include: { country: true } },
        cities: { include: { city: true } },
        districts: { include: { district: true } }
      }
    });
    
    for (const region of regions) {
      let totalPopulation = 0;
      let totalArea = 0;
      let centerLat = 0;
      let centerLng = 0;
      let locationCount = 0;
      
      // Şehir verilerinden hesapla
      for (const cityLink of region.cities) {
        const city = cityLink.city;
        if (city.population) totalPopulation += Number(city.population);
        if (city.area_sqkm) totalArea += city.area_sqkm;
        if (city.latitude && city.longitude) {
          centerLat += city.latitude;
          centerLng += city.longitude;
          locationCount++;
        }
      }
      
      // İlçe verilerinden hesapla
      for (const districtLink of region.districts) {
        const district = districtLink.district;
        if (district.population) totalPopulation += Number(district.population);
        if (district.area_sqkm) totalArea += district.area_sqkm;
        if (district.latitude && district.longitude) {
          centerLat += district.latitude;
          centerLng += district.longitude;
          locationCount++;
        }
      }
      
      // Merkez koordinatları hesapla
      if (locationCount > 0) {
        centerLat = centerLat / locationCount;
        centerLng = centerLng / locationCount;
      }
      
      // Bölgeyi güncelle
      await prisma.region.update({
        where: { id: region.id },
        data: {
          total_population: totalPopulation,
          total_area_sqkm: totalArea,
          center_latitude: locationCount > 0 ? centerLat : null,
          center_longitude: locationCount > 0 ? centerLng : null
        }
      });
      
      console.log(`✅ ${region.name}: ${totalPopulation.toLocaleString()} kişi, ${totalArea.toFixed(1)} km²`);
    }
    
  } catch (error) {
    console.error('❌ İstatistik hesaplama hatası:', error.message);
  }
}

async function main() {
  console.log('🚀 Global Geonames İçe Aktarma Başlıyor...\n');
  
  try {
    // 1. Geonames verilerini yükle
    const geonamesData = await loadGeonamesData();
    
    // 2. Ülkeleri oluştur
    const countries = await createCountries(geonamesData);
    
    // 3. Şehirleri oluştur
    const cities = await createCities(geonamesData, countries);
    
    // 4. İlçeleri oluştur
    const districts = await createDistricts(cities);
    
    // 5. Örnek acil durum bölgeleri oluştur
    const regions = await createSampleRegions(countries, cities, districts);
    
    // 6. Bölgeleri coğrafyaya bağla
    await linkRegionsToGeography(regions, countries, cities, districts);
    
    // 7. İstatistikleri hesapla
    await updateRegionStatistics();
    
    console.log('\n🎉 Global coğrafi yapı başarıyla oluşturuldu!');
    console.log('✅ Ülkeler, şehirler, ilçeler ve acil durum bölgeleri hazır');
    console.log('✅ TreeSelect yapısı için veriler kullanıma hazır');
    
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