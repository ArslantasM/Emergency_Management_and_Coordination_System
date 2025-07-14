const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Geonames JSON dosyasından veri okuma
async function importGeonamesData() {
  try {
    console.log('🌍 Geonames verilerini PostgreSQL\'e aktarma başlıyor...\n');

    // Mevcut regions sayısını kontrol et
    const existingRegions = await prisma.region.count();
    console.log(`📊 Mevcut bölge sayısı: ${existingRegions}`);
    
    if (existingRegions > 10) {
      console.log('✅ Zaten yeterli veri var, import atlanıyor.');
      return;
    }

    // Ülkeler için örnek veriler
    const countries = [
      { name: 'Türkiye', code: 'TR', type: 'COUNTRY' },
      { name: 'Amerika Birleşik Devletleri', code: 'US', type: 'COUNTRY' },
      { name: 'Almanya', code: 'DE', type: 'COUNTRY' },
      { name: 'Fransa', code: 'FR', type: 'COUNTRY' },
      { name: 'İtalya', code: 'IT', type: 'COUNTRY' },
      { name: 'İspanya', code: 'ES', type: 'COUNTRY' },
      { name: 'Birleşik Krallık', code: 'GB', type: 'COUNTRY' },
      { name: 'Japonya', code: 'JP', type: 'COUNTRY' },
      { name: 'Çin', code: 'CN', type: 'COUNTRY' },
      { name: 'Hindistan', code: 'IN', type: 'COUNTRY' }
    ];

    console.log('🌍 Ülkeler ekleniyor...');
    
    for (const country of countries) {
      const existingCountry = await prisma.region.findFirst({
        where: { name: country.name, type: 'COUNTRY' }
      });
      
      if (!existingCountry) {
        const newCountry = await prisma.region.create({
          data: {
            name: country.name,
            code: country.code,
            type: country.type
          }
        });
        console.log(`  ✅ ${country.name} eklendi`);
        
        // Türkiye için özel şehirler ekle
        if (country.code === 'TR') {
          await addTurkishCities(newCountry.id);
        } else {
          // Diğer ülkeler için örnek şehirler
          await addSampleCities(newCountry.id, country.code);
        }
      } else {
        console.log(`  ⏭️  ${country.name} zaten mevcut`);
      }
    }

    console.log('\n✅ Geonames verileri başarıyla aktarıldı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Türkiye şehirleri ekleme
async function addTurkishCities(countryId) {
  const turkishCities = [
    { name: 'İstanbul', code: '34' },
    { name: 'Ankara', code: '06' },
    { name: 'İzmir', code: '35' },
    { name: 'Bursa', code: '16' },
    { name: 'Antalya', code: '07' },
    { name: 'Adana', code: '01' },
    { name: 'Konya', code: '42' },
    { name: 'Şanlıurfa', code: '63' },
    { name: 'Gaziantep', code: '27' },
    { name: 'Kocaeli', code: '41' }
  ];

  for (const city of turkishCities) {
    const newCity = await prisma.region.create({
      data: {
        name: city.name,
        code: city.code,
        type: 'CITY',
        parentId: countryId
      }
    });
    
    // İstanbul için örnek ilçeler
    if (city.code === '34') {
      await addIstanbulDistricts(newCity.id);
    }
    // Ankara için örnek ilçeler
    else if (city.code === '06') {
      await addAnkaraDistricts(newCity.id);
    }
  }
}

// Diğer ülkeler için örnek şehirler
async function addSampleCities(countryId, countryCode) {
  const sampleCities = {
    'US': [
      { name: 'New York', code: 'NY' },
      { name: 'Los Angeles', code: 'LA' },
      { name: 'Chicago', code: 'CHI' }
    ],
    'DE': [
      { name: 'Berlin', code: 'BER' },
      { name: 'Hamburg', code: 'HAM' },
      { name: 'München', code: 'MUN' }
    ],
    'FR': [
      { name: 'Paris', code: 'PAR' },
      { name: 'Lyon', code: 'LYO' },
      { name: 'Marseille', code: 'MAR' }
    ],
    'GB': [
      { name: 'London', code: 'LON' },
      { name: 'Manchester', code: 'MAN' },
      { name: 'Birmingham', code: 'BIR' }
    ]
  };

  const cities = sampleCities[countryCode] || [];
  
  for (const city of cities) {
    await prisma.region.create({
      data: {
        name: city.name,
        code: city.code,
        type: 'CITY',
        parentId: countryId
      }
    });
  }
}

// İstanbul ilçeleri
async function addIstanbulDistricts(cityId) {
  const districts = [
    { name: 'Kadıköy', code: '34-KDK' },
    { name: 'Beşiktaş', code: '34-BSK' },
    { name: 'Şişli', code: '34-SLI' },
    { name: 'Fatih', code: '34-FTH' },
    { name: 'Üsküdar', code: '34-USK' }
  ];

  for (const district of districts) {
    await prisma.region.create({
      data: {
        name: district.name,
        code: district.code,
        type: 'DISTRICT',
        parentId: cityId
      }
    });
  }
}

// Ankara ilçeleri
async function addAnkaraDistricts(cityId) {
  const districts = [
    { name: 'Çankaya', code: '06-CKY' },
    { name: 'Keçiören', code: '06-KCR' },
    { name: 'Yenimahalle', code: '06-YMH' },
    { name: 'Mamak', code: '06-MMK' }
  ];

  for (const district of districts) {
    await prisma.region.create({
      data: {
        name: district.name,
        code: district.code,
        type: 'DISTRICT',
        parentId: cityId
      }
    });
  }
}

// Script'i çalıştır
if (require.main === module) {
  importGeonamesData();
}

module.exports = { importGeonamesData }; 