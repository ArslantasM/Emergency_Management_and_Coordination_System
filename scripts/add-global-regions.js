const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addGlobalRegions() {
  try {
    console.log('🌍 Dünya geneli bölge verilerini ekleme başlıyor...\n');

    // Mevcut ülke sayısını kontrol et
    const existingCountries = await prisma.region.count({
      where: { type: 'COUNTRY' }
    });
    
    console.log(`📊 Mevcut ülke sayısı: ${existingCountries}`);

    // Ülkeler
    const countries = [
      { id: 'country-tr', name: 'Türkiye', code: 'TR' },
      { id: 'country-us', name: 'Amerika Birleşik Devletleri', code: 'US' },
      { id: 'country-de', name: 'Almanya', code: 'DE' },
      { id: 'country-fr', name: 'Fransa', code: 'FR' },
      { id: 'country-gb', name: 'Birleşik Krallık', code: 'GB' },
      { id: 'country-it', name: 'İtalya', code: 'IT' },
      { id: 'country-es', name: 'İspanya', code: 'ES' },
      { id: 'country-jp', name: 'Japonya', code: 'JP' },
      { id: 'country-cn', name: 'Çin', code: 'CN' },
      { id: 'country-in', name: 'Hindistan', code: 'IN' }
    ];

    console.log('🏛️ Ülkeler ekleniyor...');
    for (const country of countries) {
      await prisma.region.upsert({
        where: { id: country.id },
        update: {},
        create: {
          id: country.id,
          name: country.name,
          code: country.code,
          type: 'COUNTRY',
          parentId: null
        }
      });
      console.log(`  ✅ ${country.name} eklendi/güncellendi`);
    }

    // Türkiye şehirleri
    const turkishCities = [
      { id: 'city-istanbul', name: 'İstanbul', code: '34', parentId: 'country-tr' },
      { id: 'city-ankara', name: 'Ankara', code: '06', parentId: 'country-tr' },
      { id: 'city-izmir', name: 'İzmir', code: '35', parentId: 'country-tr' },
      { id: 'city-bursa', name: 'Bursa', code: '16', parentId: 'country-tr' },
      { id: 'city-antalya', name: 'Antalya', code: '07', parentId: 'country-tr' }
    ];

    console.log('🏙️ Türkiye şehirleri ekleniyor...');
    for (const city of turkishCities) {
      await prisma.region.upsert({
        where: { id: city.id },
        update: {},
        create: {
          id: city.id,
          name: city.name,
          code: city.code,
          type: 'CITY',
          parentId: city.parentId
        }
      });
      console.log(`  ✅ ${city.name} eklendi/güncellendi`);
    }

    // İstanbul ilçeleri
    const istanbulDistricts = [
      { id: 'district-kadikoy', name: 'Kadıköy', code: '34-KAD', parentId: 'city-istanbul' },
      { id: 'district-besiktas', name: 'Beşiktaş', code: '34-BES', parentId: 'city-istanbul' },
      { id: 'district-sisli', name: 'Şişli', code: '34-SIS', parentId: 'city-istanbul' },
      { id: 'district-fatih', name: 'Fatih', code: '34-FAT', parentId: 'city-istanbul' },
      { id: 'district-uskudar', name: 'Üsküdar', code: '34-USK', parentId: 'city-istanbul' }
    ];

    console.log('🏘️ İstanbul ilçeleri ekleniyor...');
    for (const district of istanbulDistricts) {
      await prisma.region.upsert({
        where: { id: district.id },
        update: {},
        create: {
          id: district.id,
          name: district.name,
          code: district.code,
          type: 'DISTRICT',
          parentId: district.parentId
        }
      });
      console.log(`    ✅ ${district.name} eklendi/güncellendi`);
    }

    // ABD şehirleri
    const usCities = [
      { id: 'city-newyork', name: 'New York', code: 'NY', parentId: 'country-us' },
      { id: 'city-losangeles', name: 'Los Angeles', code: 'LA', parentId: 'country-us' },
      { id: 'city-chicago', name: 'Chicago', code: 'CHI', parentId: 'country-us' },
      { id: 'city-houston', name: 'Houston', code: 'HOU', parentId: 'country-us' }
    ];

    console.log('🏙️ ABD şehirleri ekleniyor...');
    for (const city of usCities) {
      await prisma.region.upsert({
        where: { id: city.id },
        update: {},
        create: {
          id: city.id,
          name: city.name,
          code: city.code,
          type: 'CITY',
          parentId: city.parentId
        }
      });
      console.log(`  ✅ ${city.name} eklendi/güncellendi`);
    }

    // New York ilçeleri
    const nyDistricts = [
      { id: 'district-manhattan', name: 'Manhattan', code: 'NY-MAN', parentId: 'city-newyork' },
      { id: 'district-brooklyn', name: 'Brooklyn', code: 'NY-BRO', parentId: 'city-newyork' },
      { id: 'district-queens', name: 'Queens', code: 'NY-QUE', parentId: 'city-newyork' },
      { id: 'district-bronx', name: 'Bronx', code: 'NY-BRX', parentId: 'city-newyork' }
    ];

    console.log('🏘️ New York ilçeleri ekleniyor...');
    for (const district of nyDistricts) {
      await prisma.region.upsert({
        where: { id: district.id },
        update: {},
        create: {
          id: district.id,
          name: district.name,
          code: district.code,
          type: 'DISTRICT',
          parentId: district.parentId
        }
      });
      console.log(`    ✅ ${district.name} eklendi/güncellendi`);
    }

    // Almanya şehirleri
    const germanCities = [
      { id: 'city-berlin', name: 'Berlin', code: 'BER', parentId: 'country-de' },
      { id: 'city-hamburg', name: 'Hamburg', code: 'HAM', parentId: 'country-de' },
      { id: 'city-munich', name: 'München', code: 'MUN', parentId: 'country-de' },
      { id: 'city-cologne', name: 'Köln', code: 'COL', parentId: 'country-de' }
    ];

    console.log('🏙️ Almanya şehirleri ekleniyor...');
    for (const city of germanCities) {
      await prisma.region.upsert({
        where: { id: city.id },
        update: {},
        create: {
          id: city.id,
          name: city.name,
          code: city.code,
          type: 'CITY',
          parentId: city.parentId
        }
      });
      console.log(`  ✅ ${city.name} eklendi/güncellendi`);
    }

    // Berlin ilçeleri
    const berlinDistricts = [
      { id: 'district-mitte', name: 'Mitte', code: 'BER-MIT', parentId: 'city-berlin' },
      { id: 'district-kreuzberg', name: 'Kreuzberg', code: 'BER-KRE', parentId: 'city-berlin' },
      { id: 'district-charlottenburg', name: 'Charlottenburg', code: 'BER-CHA', parentId: 'city-berlin' }
    ];

    console.log('🏘️ Berlin ilçeleri ekleniyor...');
    for (const district of berlinDistricts) {
      await prisma.region.upsert({
        where: { id: district.id },
        update: {},
        create: {
          id: district.id,
          name: district.name,
          code: district.code,
          type: 'DISTRICT',
          parentId: district.parentId
        }
      });
      console.log(`    ✅ ${district.name} eklendi/güncellendi`);
    }

    // Diğer ülkeler için de basit şehirler ekle
    const otherCountryCities = [
      // Fransa
      { id: 'city-paris', name: 'Paris', code: 'PAR', parentId: 'country-fr' },
      { id: 'city-lyon', name: 'Lyon', code: 'LYO', parentId: 'country-fr' },
      { id: 'city-marseille', name: 'Marseille', code: 'MAR', parentId: 'country-fr' },
      
      // İngiltere
      { id: 'city-london', name: 'London', code: 'LON', parentId: 'country-gb' },
      { id: 'city-manchester', name: 'Manchester', code: 'MAN', parentId: 'country-gb' },
      { id: 'city-birmingham', name: 'Birmingham', code: 'BIR', parentId: 'country-gb' },
      
      // İtalya
      { id: 'city-rome', name: 'Roma', code: 'ROM', parentId: 'country-it' },
      { id: 'city-milan', name: 'Milano', code: 'MIL', parentId: 'country-it' },
      { id: 'city-naples', name: 'Napoli', code: 'NAP', parentId: 'country-it' },
      
      // İspanya
      { id: 'city-madrid', name: 'Madrid', code: 'MAD', parentId: 'country-es' },
      { id: 'city-barcelona', name: 'Barcelona', code: 'BCN', parentId: 'country-es' },
      { id: 'city-valencia', name: 'Valencia', code: 'VAL', parentId: 'country-es' },
      
      // Japonya
      { id: 'city-tokyo', name: 'Tokyo', code: 'TKY', parentId: 'country-jp' },
      { id: 'city-osaka', name: 'Osaka', code: 'OSA', parentId: 'country-jp' },
      { id: 'city-kyoto', name: 'Kyoto', code: 'KYO', parentId: 'country-jp' },
      
      // Çin
      { id: 'city-beijing', name: 'Beijing', code: 'BEI', parentId: 'country-cn' },
      { id: 'city-shanghai', name: 'Shanghai', code: 'SHA', parentId: 'country-cn' },
      { id: 'city-guangzhou', name: 'Guangzhou', code: 'GUA', parentId: 'country-cn' },
      
      // Hindistan
      { id: 'city-delhi', name: 'Delhi', code: 'DEL', parentId: 'country-in' },
      { id: 'city-mumbai', name: 'Mumbai', code: 'MUM', parentId: 'country-in' },
      { id: 'city-bangalore', name: 'Bangalore', code: 'BAN', parentId: 'country-in' }
    ];

    console.log('🏙️ Diğer ülke şehirleri ekleniyor...');
    for (const city of otherCountryCities) {
      await prisma.region.upsert({
        where: { id: city.id },
        update: {},
        create: {
          id: city.id,
          name: city.name,
          code: city.code,
          type: 'CITY',
          parentId: city.parentId
        }
      });
      console.log(`  ✅ ${city.name} eklendi/güncellendi`);
    }

    // Son durum raporu
    const finalCountries = await prisma.region.count({ where: { type: 'COUNTRY' } });
    const finalCities = await prisma.region.count({ where: { type: 'CITY' } });
    const finalDistricts = await prisma.region.count({ where: { type: 'DISTRICT' } });
    
    console.log('\n📊 Final durum:');
    console.log(`   Ülkeler: ${finalCountries}`);
    console.log(`   Şehirler: ${finalCities}`);
    console.log(`   İlçeler: ${finalDistricts}`);
    console.log('\n✅ Dünya geneli bölge verileri başarıyla eklendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  addGlobalRegions();
}

module.exports = { addGlobalRegions }; 