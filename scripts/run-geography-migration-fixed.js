const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Coğrafi tablolar migration başlatılıyor...\n');

    // 1. Backup tabloları oluştur
    console.log('📦 Backup tabloları oluşturuluyor...');
    await createBackupTables();

    // 2. Yeni coğrafi tabloları oluştur
    console.log('🏛️ Yeni coğrafi tabloları oluşturuluyor...');
    await createGeographyTables();

    // 3. Örnek verileri ekle
    console.log('📋 Örnek veriler ekleniyor...');
    await insertSampleData();

    // 4. Acil durum bölgelerini oluştur
    console.log('🗺️ Acil durum bölgeleri oluşturuluyor...');
    await createEmergencyRegions();

    // 5. Sonuçları kontrol et
    console.log('✅ Migration başarıyla tamamlandı!');
    await checkMigrationResults();

  } catch (error) {
    console.error('💥 Migration hatası:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createBackupTables() {
  const backupCommands = [
    'CREATE TABLE region_backup AS SELECT * FROM "Region"',
    'CREATE TABLE region_user_backup AS SELECT * FROM "RegionUser"',
    'CREATE TABLE emergency_backup AS SELECT * FROM "Emergency"',
    'CREATE TABLE warehouse_backup AS SELECT * FROM "Warehouse"',
    'CREATE TABLE camp_site_backup AS SELECT * FROM "CampSite"'
  ];

  for (const command of backupCommands) {
    try {
      await prisma.$executeRawUnsafe(command);
      console.log(`✅ Backup: ${command.split(' ')[2]}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  Backup zaten mevcut: ${command.split(' ')[2]}`);
      } else {
        console.error(`❌ Backup hatası: ${error.message}`);
      }
    }
  }
}

async function createGeographyTables() {
  // Countries tablosu
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Country" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL UNIQUE,
        "continent" TEXT,
        "geometry" geometry,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Country tablosu oluşturuldu');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Country tablosu zaten mevcut');
    } else {
      throw error;
    }
  }

  // Cities tablosu
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "City" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT,
        "countryId" TEXT NOT NULL,
        "geometry" geometry,
        "population" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    console.log('✅ City tablosu oluşturuldu');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  City tablosu zaten mevcut');
    } else {
      throw error;
    }
  }

  // Districts tablosu
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "District" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT,
        "cityId" TEXT NOT NULL,
        "geometry" geometry,
        "population" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    console.log('✅ District tablosu oluşturuldu');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  District tablosu zaten mevcut');
    } else {
      throw error;
    }
  }

  // Towns tablosu
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Town" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT,
        "districtId" TEXT NOT NULL,
        "geometry" geometry,
        "population" INTEGER,
        "type" TEXT NOT NULL DEFAULT 'TOWN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);
    console.log('✅ Town tablosu oluşturuldu');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Town tablosu zaten mevcut');
    } else {
      throw error;
    }
  }

  // RegionNew tablosu
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "RegionNew" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "color" TEXT,
        "geometry" geometry,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "priority" TEXT NOT NULL DEFAULT 'NORMAL',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ RegionNew tablosu oluşturuldu');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  RegionNew tablosu zaten mevcut');
    } else {
      throw error;
    }
  }

  // Many-to-Many ilişki tabloları
  const relationTables = [
    {
      name: 'RegionCountry',
      sql: `
        CREATE TABLE "RegionCountry" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "regionId" TEXT NOT NULL,
          "countryId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE("regionId", "countryId")
        )
      `
    },
    {
      name: 'RegionCity',
      sql: `
        CREATE TABLE "RegionCity" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "regionId" TEXT NOT NULL,
          "cityId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE("regionId", "cityId")
        )
      `
    },
    {
      name: 'RegionDistrict',
      sql: `
        CREATE TABLE "RegionDistrict" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "regionId" TEXT NOT NULL,
          "districtId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE("regionId", "districtId")
        )
      `
    },
    {
      name: 'RegionTown',
      sql: `
        CREATE TABLE "RegionTown" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "regionId" TEXT NOT NULL,
          "townId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("townId") REFERENCES "Town"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE("regionId", "townId")
        )
      `
    }
  ];

  for (const table of relationTables) {
    try {
      await prisma.$executeRawUnsafe(table.sql);
      console.log(`✅ ${table.name} tablosu oluşturuldu`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`⚠️  ${table.name} tablosu zaten mevcut`);
      } else {
        throw error;
      }
    }
  }
}

async function insertSampleData() {
  // Ülkeler
  const countries = [
    { id: 'country-tr', name: 'Türkiye', code: 'TR', continent: 'Asia' },
    { id: 'country-us', name: 'Amerika Birleşik Devletleri', code: 'US', continent: 'North America' },
    { id: 'country-de', name: 'Almanya', code: 'DE', continent: 'Europe' },
    { id: 'country-fr', name: 'Fransa', code: 'FR', continent: 'Europe' },
    { id: 'country-gb', name: 'Birleşik Krallık', code: 'GB', continent: 'Europe' },
    { id: 'country-it', name: 'İtalya', code: 'IT', continent: 'Europe' },
    { id: 'country-es', name: 'İspanya', code: 'ES', continent: 'Europe' },
    { id: 'country-jp', name: 'Japonya', code: 'JP', continent: 'Asia' },
    { id: 'country-cn', name: 'Çin', code: 'CN', continent: 'Asia' },
    { id: 'country-in', name: 'Hindistan', code: 'IN', continent: 'Asia' }
  ];

  for (const country of countries) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "Country" ("id", "name", "code", "continent", "createdAt", "updatedAt") 
        VALUES ('${country.id}', '${country.name}', '${country.code}', '${country.continent}', NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING
      `);
    } catch (error) {
      console.log(`⚠️  Ülke zaten mevcut: ${country.name}`);
    }
  }

  // Türkiye şehirleri
  const cities = [
    { id: 'city-istanbul', name: 'İstanbul', code: '34', countryId: 'country-tr', population: 15840000 },
    { id: 'city-ankara', name: 'Ankara', code: '06', countryId: 'country-tr', population: 5750000 },
    { id: 'city-izmir', name: 'İzmir', code: '35', countryId: 'country-tr', population: 4400000 },
    { id: 'city-bursa', name: 'Bursa', code: '16', countryId: 'country-tr', population: 3100000 },
    { id: 'city-antalya', name: 'Antalya', code: '07', countryId: 'country-tr', population: 2600000 },
    { id: 'city-newyork', name: 'New York', code: 'NY', countryId: 'country-us', population: 8400000 },
    { id: 'city-losangeles', name: 'Los Angeles', code: 'LA', countryId: 'country-us', population: 3900000 },
    { id: 'city-berlin', name: 'Berlin', code: 'BER', countryId: 'country-de', population: 3700000 },
    { id: 'city-paris', name: 'Paris', code: 'PAR', countryId: 'country-fr', population: 2200000 },
    { id: 'city-london', name: 'London', code: 'LON', countryId: 'country-gb', population: 8900000 }
  ];

  for (const city of cities) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "City" ("id", "name", "code", "countryId", "population", "createdAt", "updatedAt") 
        VALUES ('${city.id}', '${city.name}', '${city.code}', '${city.countryId}', ${city.population}, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING
      `);
    } catch (error) {
      console.log(`⚠️  Şehir zaten mevcut: ${city.name}`);
    }
  }

  // İstanbul ilçeleri
  const districts = [
    { id: 'district-kadikoy', name: 'Kadıköy', code: '34-KAD', cityId: 'city-istanbul', population: 467919 },
    { id: 'district-besiktas', name: 'Beşiktaş', code: '34-BES', cityId: 'city-istanbul', population: 175190 },
    { id: 'district-sisli', name: 'Şişli', code: '34-SIS', cityId: 'city-istanbul', population: 265800 },
    { id: 'district-fatih', name: 'Fatih', code: '34-FAT', cityId: 'city-istanbul', population: 368227 },
    { id: 'district-uskudar', name: 'Üsküdar', code: '34-USK', cityId: 'city-istanbul', population: 524452 },
    { id: 'district-manhattan', name: 'Manhattan', code: 'NY-MAN', cityId: 'city-newyork', population: 1630000 },
    { id: 'district-brooklyn', name: 'Brooklyn', code: 'NY-BRO', cityId: 'city-newyork', population: 2600000 },
    { id: 'district-mitte', name: 'Mitte', code: 'BER-MIT', cityId: 'city-berlin', population: 380000 },
    { id: 'district-1st-arr', name: '1st Arrondissement', code: 'PAR-1ST', cityId: 'city-paris', population: 16000 },
    { id: 'district-westminster', name: 'Westminster', code: 'LON-WES', cityId: 'city-london', population: 250000 }
  ];

  for (const district of districts) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "District" ("id", "name", "code", "cityId", "population", "createdAt", "updatedAt") 
        VALUES ('${district.id}', '${district.name}', '${district.code}', '${district.cityId}', ${district.population}, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING
      `);
    } catch (error) {
      console.log(`⚠️  İlçe zaten mevcut: ${district.name}`);
    }
  }

  console.log('✅ Örnek veriler eklendi');
}

async function createEmergencyRegions() {
  const regions = [
    { id: 'region-marmara-emergency', name: 'Marmara Acil Durum Bölgesi', description: 'Marmara Bölgesi acil durum koordinasyon alanı', color: '#FF6B6B', priority: 'HIGH' },
    { id: 'region-aegean-emergency', name: 'Ege Acil Durum Bölgesi', description: 'Ege Bölgesi acil durum koordinasyon alanı', color: '#4ECDC4', priority: 'NORMAL' },
    { id: 'region-mediterranean-emergency', name: 'Akdeniz Acil Durum Bölgesi', description: 'Akdeniz Bölgesi acil durum koordinasyon alanı', color: '#45B7D1', priority: 'NORMAL' },
    { id: 'region-global-emergency', name: 'Küresel Acil Durum Bölgesi', description: 'Uluslararası acil durum koordinasyon alanı', color: '#FFD93D', priority: 'CRITICAL' }
  ];

  for (const region of regions) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "RegionNew" ("id", "name", "description", "color", "priority", "createdAt", "updatedAt") 
        VALUES ('${region.id}', '${region.name}', '${region.description}', '${region.color}', '${region.priority}', NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING
      `);
    } catch (error) {
      console.log(`⚠️  Bölge zaten mevcut: ${region.name}`);
    }
  }

  console.log('✅ Acil durum bölgeleri oluşturuldu');
}

async function checkMigrationResults() {
  try {
    console.log('\n📊 Migration sonuçları:');

    const countries = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Country"`;
    const cities = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "City"`;
    const districts = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "District"`;
    const regions = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "RegionNew"`;

    console.log(`🏛️  Ülkeler: ${countries[0].count}`);
    console.log(`🏙️  Şehirler: ${cities[0].count}`);
    console.log(`🏘️  İlçeler: ${districts[0].count}`);
    console.log(`🗺️  Acil Durum Bölgeleri: ${regions[0].count}`);

    // Örnek veriler
    const sampleCountries = await prisma.$queryRaw`SELECT name, code FROM "Country" LIMIT 5`;
    console.log('\n🌍 Örnek ülkeler:', sampleCountries.map(c => `${c.name} (${c.code})`).join(', '));

    const sampleCities = await prisma.$queryRaw`
      SELECT c.name, co.name as country_name 
      FROM "City" c 
      JOIN "Country" co ON c."countryId" = co.id 
      LIMIT 5
    `;
    console.log('🏙️ Örnek şehirler:', sampleCities.map(c => `${c.name} (${c.country_name})`).join(', '));

    console.log('\n🎉 Migration başarıyla tamamlandı!');

  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  }
}

// Ana fonksiyonu çalıştır
runMigration(); 