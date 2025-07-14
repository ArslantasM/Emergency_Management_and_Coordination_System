const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Coğrafi tablolar migration başlatılıyor...\n');

    // 1. SQL dosyasını oku
    const sqlPath = path.join(__dirname, 'migrate-geography-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // 2. SQL'i parçalara ayır (her komut ayrı çalıştırılmalı)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📄 ${commands.length} SQL komutu bulundu`);

    // 3. Her komutu sırayla çalıştır
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.toLowerCase().includes('create table') || 
          command.toLowerCase().includes('insert into') ||
          command.toLowerCase().includes('create index')) {
        
        console.log(`⚡ Komut ${i + 1}/${commands.length} çalıştırılıyor...`);
        
        try {
          await prisma.$executeRawUnsafe(command);
          console.log(`✅ Başarılı: ${command.substring(0, 50)}...`);
        } catch (error) {
          console.error(`❌ Hata: ${command.substring(0, 50)}...`);
          console.error(`   Detay: ${error.message}`);
          
          // Kritik hatalar için durduralım
          if (error.message.includes('already exists')) {
            console.log('   ⚠️  Tablo zaten mevcut, devam ediliyor...');
          } else {
            throw error;
          }
        }
      }
    }

    console.log('\n🎉 Migration başarıyla tamamlandı!');
    
    // 4. Sonuçları kontrol et
    await checkMigrationResults();

  } catch (error) {
    console.error('💥 Migration hatası:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkMigrationResults() {
  try {
    console.log('\n📊 Migration sonuçları kontrol ediliyor...');

    // Yeni tabloları kontrol et
    const countries = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Country"`;
    const cities = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "City"`;
    const districts = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "District"`;
    const towns = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Town"`;
    const regions = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "RegionNew"`;

    console.log(`🏛️  Ülkeler: ${countries[0].count}`);
    console.log(`🏙️  Şehirler: ${cities[0].count}`);
    console.log(`🏘️  İlçeler: ${districts[0].count}`);
    console.log(`🏠  Kasabalar: ${towns[0].count}`);
    console.log(`🗺️  Acil Durum Bölgeleri: ${regions[0].count}`);

    // Örnek veriler
    console.log('\n📋 Örnek veriler:');
    
    const sampleCountries = await prisma.$queryRaw`
      SELECT name, code FROM "Country" LIMIT 5
    `;
    console.log('Ülkeler:', sampleCountries.map(c => `${c.name} (${c.code})`).join(', '));

    const sampleCities = await prisma.$queryRaw`
      SELECT c.name, co.name as country_name 
      FROM "City" c 
      JOIN "Country" co ON c."countryId" = co.id 
      LIMIT 5
    `;
    console.log('Şehirler:', sampleCities.map(c => `${c.name} (${c.country_name})`).join(', '));

    const sampleDistricts = await prisma.$queryRaw`
      SELECT d.name, c.name as city_name 
      FROM "District" d 
      JOIN "City" c ON d."cityId" = c.id 
      LIMIT 5
    `;
    console.log('İlçeler:', sampleDistricts.map(d => `${d.name} (${d.city_name})`).join(', '));

    console.log('\n✅ Migration kontrolleri tamamlandı!');

  } catch (error) {
    console.error('❌ Kontrol hatası:', error);
  }
}

// Ana fonksiyonu çalıştır
runMigration(); 