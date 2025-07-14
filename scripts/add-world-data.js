const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addWorldData() {
  try {
    console.log('🌍 Dünya geneli veri ekleme başlıyor...\n');

    // Önce mevcut verileri kontrol et
    const existingCountries = await prisma.region.count({
      where: { type: 'COUNTRY' }
    });
    
    console.log(`📊 Mevcut ülke sayısı: ${existingCountries}`);

    // Ülkeler
    const countries = [
      { name: 'Türkiye', code: 'TR' },
      { name: 'Amerika Birleşik Devletleri', code: 'US' },
      { name: 'Almanya', code: 'DE' },
      { name: 'Fransa', code: 'FR' },
      { name: 'İtalya', code: 'IT' },
      { name: 'İspanya', code: 'ES' },
      { name: 'Birleşik Krallık', code: 'GB' },
      { name: 'Japonya', code: 'JP' },
      { name: 'Çin', code: 'CN' },
      { name: 'Hindistan', code: 'IN' }
    ];

    for (const countryData of countries) {
      // Ülke var mı kontrol et
      let country = await prisma.region.findFirst({
        where: { 
          name: countryData.name,
          type: 'COUNTRY'
        }
      });

      if (!country) {
        // Ülke yoksa oluştur
        country = await prisma.region.create({
          data: {
            name: countryData.name,
            code: countryData.code,
            type: 'COUNTRY'
          }
        });
        console.log(`✅ ${countryData.name} ülkesi eklendi`);
      } else {
        console.log(`⏭️  ${countryData.name} ülkesi zaten mevcut`);
      }

      // Bu ülke için şehirler var mı kontrol et
      const existingCities = await prisma.region.count({
        where: {
          parentId: country.id,
          type: 'CITY'
        }
      });

      if (existingCities === 0) {
        // Şehirler ekle
        await addCitiesForCountry(country.id, countryData.code);
      } else {
        console.log(`  ⏭️  ${countryData.name} için şehirler zaten mevcut`);
      }
    }

    console.log('\n✅ Dünya geneli veriler başarıyla eklendi!');
    
    // Son durum
    const finalCountries = await prisma.region.count({ where: { type: 'COUNTRY' } });
    const finalCities = await prisma.region.count({ where: { type: 'CITY' } });
    const finalDistricts = await prisma.region.count({ where: { type: 'DISTRICT' } });
    
    console.log(`📊 Final durum:`);
    console.log(`   Ülkeler: ${finalCountries}`);
    console.log(`   Şehirler: ${finalCities}`);
    console.log(`   İlçeler: ${finalDistricts}`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addCitiesForCountry(countryId, countryCode) {
  const citiesData = {
    'TR': [
      { name: 'İstanbul', code: '34', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Fatih', 'Üsküdar'] },
      { name: 'Ankara', code: '06', districts: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak'] },
      { name: 'İzmir', code: '35', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca'] }
    ],
    'US': [
      { name: 'New York', code: 'NY', districts: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx'] },
      { name: 'Los Angeles', code: 'LA', districts: ['Hollywood', 'Beverly Hills', 'Santa Monica'] },
      { name: 'Chicago', code: 'CHI', districts: ['Downtown', 'North Side', 'South Side'] }
    ],
    'DE': [
      { name: 'Berlin', code: 'BER', districts: ['Mitte', 'Kreuzberg', 'Charlottenburg'] },
      { name: 'Hamburg', code: 'HAM', districts: ['Altona', 'Eimsbüttel', 'Wandsbek'] },
      { name: 'München', code: 'MUN', districts: ['Altstadt', 'Maxvorstadt', 'Schwabing'] }
    ],
    'FR': [
      { name: 'Paris', code: 'PAR', districts: ['1er arr.', '2e arr.', '3e arr.'] },
      { name: 'Lyon', code: 'LYO', districts: ['1er arr.', '2e arr.', '3e arr.'] },
      { name: 'Marseille', code: 'MAR', districts: ['1er arr.', '2e arr.', '3e arr.'] }
    ],
    'GB': [
      { name: 'London', code: 'LON', districts: ['Westminster', 'Camden', 'Islington'] },
      { name: 'Manchester', code: 'MAN', districts: ['City Centre', 'Northern Quarter', 'Ancoats'] },
      { name: 'Birmingham', code: 'BIR', districts: ['City Centre', 'Digbeth', 'Jewellery Quarter'] }
    ]
  };

  const cities = citiesData[countryCode] || [
    { name: 'Başkent', code: '001', districts: ['Merkez', 'Kuzey', 'Güney'] },
    { name: 'Büyük Şehir', code: '002', districts: ['Doğu', 'Batı', 'Merkez'] }
  ];

  for (const cityData of cities) {
    // Şehir oluştur
    const newCity = await prisma.region.create({
      data: {
        name: cityData.name,
        code: cityData.code,
        type: 'CITY',
        parentId: countryId
      }
    });
    
    console.log(`  ✅ ${cityData.name} şehri eklendi`);
    
    // İlçeler ekle
    for (const districtName of cityData.districts) {
      await prisma.region.create({
        data: {
          name: districtName,
          code: `${cityData.code}-${districtName.substring(0, 3).toUpperCase()}`,
          type: 'DISTRICT',
          parentId: newCity.id
        }
      });
    }
    console.log(`    ✅ ${cityData.districts.length} ilçe eklendi`);
  }
}

// Script'i çalıştır
if (require.main === module) {
  addWorldData();
}

module.exports = { addWorldData }; 