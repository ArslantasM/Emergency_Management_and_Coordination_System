const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCountries() {
  try {
    const count = await prisma.country.count();
    console.log(`📊 Toplam ülke sayısı: ${count}`);
    
    // İlk 10 ülkeyi göster
    const countries = await prisma.country.findMany({
      take: 10,
      orderBy: { name: 'asc' }
    });
    
    console.log('\n🌍 İlk 10 ülke:');
    countries.forEach(country => {
      console.log(`${country.iso2}: ${country.name} (${country.continent})`);
    });
    
    // Kıtalara göre dağılım
    const continents = await prisma.country.groupBy({
      by: ['continent'],
      _count: { continent: true }
    });
    
    console.log('\n🌎 Kıtalara göre dağılım:');
    continents.forEach(continent => {
      console.log(`${continent.continent}: ${continent._count.continent} ülke`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCountries(); 