const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importWorldData() {
  try {
    console.log('🌍 Dünya geneli bölge verilerini PostgreSQL\'e aktarma başlıyor...\n');

    // Mevcut ülke sayısını kontrol et
    const existingCountries = await prisma.region.count({
      where: { type: 'COUNTRY' }
    });
    
    console.log(`📊 Mevcut ülke sayısı: ${existingCountries}`);
    
    if (existingCountries >= 5) {
      console.log('✅ Zaten yeterli ülke verisi var, import atlanıyor.');
      return;
    }

    // Dünya geneli ülkeler
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
      { name: 'Hindistan', code: 'IN' },
      { name: 'Brezilya', code: 'BR' },
      { name: 'Kanada', code: 'CA' },
      { name: 'Avustralya', code: 'AU' },
      { name: 'Rusya', code: 'RU' },
      { name: 'Güney Afrika', code: 'ZA' }
    ];

    console.log('🌍 Ülkeler ekleniyor...');
    
    for (const countryData of countries) {
      const existingCountry = await prisma.region.findFirst({
        where: { 
          name: countryData.name, 
          type: 'COUNTRY' 
        }
      });
      
      if (!existingCountry) {
        const newCountry = await prisma.region.create({
          data: {
            name: countryData.name,
            code: countryData.code,
            type: 'COUNTRY'
          }
        });
        console.log(`  ✅ ${countryData.name} eklendi`);
        
        // Her ülke için şehirler ekle
        await addCitiesForCountry(newCountry.id, countryData.code);
      } else {
        console.log(`  ⏭️  ${countryData.name} zaten mevcut`);
      }
    }

    console.log('\n✅ Dünya geneli veriler başarıyla aktarıldı!');
    
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
      { name: 'İzmir', code: '35', districts: ['Konak', 'Karşıyaka', 'Bornova', 'Buca'] },
      { name: 'Bursa', code: '16', districts: ['Osmangazi', 'Nilüfer', 'Yıldırım'] },
      { name: 'Antalya', code: '07', districts: ['Muratpaşa', 'Kepez', 'Konyaaltı'] }
    ],
    'US': [
      { name: 'New York', code: 'NY', districts: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx'] },
      { name: 'Los Angeles', code: 'LA', districts: ['Hollywood', 'Beverly Hills', 'Santa Monica'] },
      { name: 'Chicago', code: 'CHI', districts: ['Downtown', 'North Side', 'South Side'] },
      { name: 'Houston', code: 'HOU', districts: ['Downtown', 'Midtown', 'Uptown'] }
    ],
    'DE': [
      { name: 'Berlin', code: 'BER', districts: ['Mitte', 'Kreuzberg', 'Charlottenburg'] },
      { name: 'Hamburg', code: 'HAM', districts: ['Altona', 'Eimsbüttel', 'Wandsbek'] },
      { name: 'München', code: 'MUN', districts: ['Altstadt', 'Maxvorstadt', 'Schwabing'] },
      { name: 'Köln', code: 'COL', districts: ['Innenstadt', 'Ehrenfeld', 'Nippes'] }
    ],
    'FR': [
      { name: 'Paris', code: 'PAR', districts: ['1er arrondissement', '2e arrondissement', '3e arrondissement'] },
      { name: 'Lyon', code: 'LYO', districts: ['1er arrondissement', '2e arrondissement', '3e arrondissement'] },
      { name: 'Marseille', code: 'MAR', districts: ['1er arrondissement', '2e arrondissement', '3e arrondissement'] }
    ],
    'GB': [
      { name: 'London', code: 'LON', districts: ['Westminster', 'Camden', 'Islington', 'Tower Hamlets'] },
      { name: 'Manchester', code: 'MAN', districts: ['City Centre', 'Northern Quarter', 'Ancoats'] },
      { name: 'Birmingham', code: 'BIR', districts: ['City Centre', 'Digbeth', 'Jewellery Quarter'] }
    ],
    'IT': [
      { name: 'Roma', code: 'ROM', districts: ['Centro Storico', 'Trastevere', 'Testaccio'] },
      { name: 'Milano', code: 'MIL', districts: ['Centro', 'Brera', 'Navigli'] },
      { name: 'Napoli', code: 'NAP', districts: ['Centro Storico', 'Vomero', 'Chiaia'] }
    ]
  };

  const cities = citiesData[countryCode] || [
    { name: 'Başkent', code: '001', districts: ['Merkez', 'Kuzey', 'Güney'] },
    { name: 'Büyük Şehir', code: '002', districts: ['Doğu', 'Batı', 'Merkez'] }
  ];

  for (const cityData of cities) {
    const newCity = await prisma.region.create({
      data: {
        name: cityData.name,
        code: cityData.code,
        type: 'CITY',
        parentId: countryId
      }
    });
    
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
  }
}

// Script'i çalıştır
if (require.main === module) {
  importWorldData();
}

module.exports = { importWorldData }; 