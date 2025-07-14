const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllData() {
  try {
    // Ülke sayıları
    const countryCount = await prisma.country.count();
    console.log(`📊 Toplam ülke sayısı: ${countryCount}`);
    
    // Şehir sayıları
    const cityCount = await prisma.city.count();
    console.log(`🏙️ Toplam şehir sayısı: ${cityCount}`);
    
    // İlçe sayıları
    const districtCount = await prisma.district.count();
    console.log(`🏘️ Toplam ilçe sayısı: ${districtCount}`);
    
    // Kasaba sayıları
    const townCount = await prisma.town.count();
    console.log(`🏠 Toplam kasaba sayısı: ${townCount}`);
    
    console.log(`📍 TOPLAM LOKASYON: ${countryCount + cityCount + districtCount + townCount}`);
    
    // En büyük şehirler
    console.log('\n🏙️ En büyük 10 şehir:');
    const biggestCities = await prisma.city.findMany({
      take: 10,
      orderBy: { population: 'desc' },
      include: { country: true }
    });
    
    biggestCities.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name}, ${city.country.name} - ${city.population.toLocaleString()} kişi`);
    });
    
    // Ülkelere göre şehir dağılımı
    console.log('\n🌍 Ülkelere göre şehir sayıları (İlk 10):');
    const cityByCountry = await prisma.city.groupBy({
      by: ['country_id'],
      _count: { country_id: true },
      orderBy: { _count: { country_id: 'desc' } },
      take: 10
    });
    
    for (const item of cityByCountry) {
      const country = await prisma.country.findUnique({
        where: { id: item.country_id }
      });
      console.log(`${country.name}: ${item._count.country_id} şehir`);
    }
    
    // Kıtalara göre dağılım
    console.log('\n🌎 Kıtalara göre ülke dağılımı:');
    const continents = await prisma.country.groupBy({
      by: ['continent'],
      _count: { continent: true },
      orderBy: { _count: { continent: 'desc' } }
    });
    
    continents.forEach(continent => {
      console.log(`${continent.continent}: ${continent._count.continent} ülke`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData(); 