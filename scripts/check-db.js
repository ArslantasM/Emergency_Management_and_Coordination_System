const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Veritabanı durumu kontrol ediliyor...\n');
    
    const countries = await prisma.country.count();
    const cities = await prisma.city.count();
    const districts = await prisma.district.count();
    const towns = await prisma.town.count();
    
    console.log('📊 Mevcut Veriler:');
    console.log(`🌍 Ülkeler: ${countries}`);
    console.log(`🏙️ Şehirler: ${cities}`);
    console.log(`🏘️ İlçeler: ${districts}`);
    console.log(`🏠 Kasabalar: ${towns}`);
    console.log(`📈 Toplam: ${countries + cities + districts + towns}`);
    
    if (countries > 0) {
      console.log('\n🔍 Örnek ülkeler:');
      const sampleCountries = await prisma.country.findMany({
        take: 5,
        select: {
          name: true,
          iso2: true,
          population: true,
          continent: true
        }
      });
      
      sampleCountries.forEach(country => {
        console.log(`  - ${country.name} (${country.iso2}) - ${country.continent} - Nüfus: ${country.population}`);
      });
    }
    
    if (cities > 0) {
      console.log('\n🔍 Örnek şehirler:');
      const sampleCities = await prisma.city.findMany({
        take: 5,
        select: {
          name: true,
          population: true,
          country: {
            select: {
              name: true,
              iso2: true
            }
          }
        },
        orderBy: {
          population: 'desc'
        }
      });
      
      sampleCities.forEach(city => {
        console.log(`  - ${city.name} (${city.country.name}) - Nüfus: ${city.population}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Veritabanı kontrol hatası:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 