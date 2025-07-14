const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRegions() {
  try {
    console.log('🔍 Region tablosu kontrol ediliyor...\n');

    // Tablo var mı kontrol et
    try {
      const regions = await prisma.region.findMany({
        take: 5
      });
      console.log('✅ Region tablosu mevcut');
    } catch (error) {
      console.log('❌ Region tablosu bulunamadı:', error.message);
      return;
    }

    // Toplam kayıt sayısı
    const totalCount = await prisma.region.count();
    console.log(`📊 Toplam bölge sayısı: ${totalCount}`);

    // Tip bazında sayılar
    const countryCount = await prisma.region.count({ where: { type: 'COUNTRY' } });
    const cityCount = await prisma.region.count({ where: { type: 'CITY' } });
    const districtCount = await prisma.region.count({ where: { type: 'DISTRICT' } });
    const regionCount = await prisma.region.count({ where: { type: 'REGION' } });

    console.log(`🏛️ Ülkeler: ${countryCount}`);
    console.log(`🏙️ Şehirler: ${cityCount}`);
    console.log(`🏘️ İlçeler: ${districtCount}`);
    console.log(`🗺️ Bölgeler: ${regionCount}`);

    // Örnek veriler
    if (countryCount > 0) {
      console.log('\n🌍 Ülke örnekleri:');
      const countries = await prisma.region.findMany({
        where: { type: 'COUNTRY' },
        take: 5
      });
      countries.forEach(country => {
        console.log(`  - ${country.name} (${country.code})`);
      });
    }

    if (cityCount > 0) {
      console.log('\n🏙️ Şehir örnekleri:');
      const cities = await prisma.region.findMany({
        where: { type: 'CITY' },
        include: {
          parent: true
        },
        take: 5
      });
      cities.forEach(city => {
        console.log(`  - ${city.name} (${city.parent?.name || 'Parent yok'})`);
      });
    }

    if (districtCount > 0) {
      console.log('\n🏘️ İlçe örnekleri:');
      const districts = await prisma.region.findMany({
        where: { type: 'DISTRICT' },
        include: {
          parent: {
            include: {
              parent: true
            }
          }
        },
        take: 5
      });
      districts.forEach(district => {
        const city = district.parent?.name || 'Şehir yok';
        const country = district.parent?.parent?.name || 'Ülke yok';
        console.log(`  - ${district.name} (${city}, ${country})`);
      });
    }

    // Hiyerarşi kontrolü
    console.log('\n🌳 Hiyerarşi kontrolü:');
    const countriesWithChildren = await prisma.region.findMany({
      where: { type: 'COUNTRY' },
      include: {
        children: {
          include: {
            children: true
          }
        }
      },
      take: 3
    });

    countriesWithChildren.forEach(country => {
      console.log(`\n${country.name}:`);
      console.log(`  Şehirler: ${country.children.length}`);
      country.children.forEach(city => {
        console.log(`    - ${city.name} (${city.children.length} ilçe)`);
      });
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  checkRegions();
}

module.exports = { checkRegions }; 