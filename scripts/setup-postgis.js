const { Client } = require('pg');

async function setupPostGIS() {
  console.log('PostGIS kurulum script\'i başlatılıyor...');
  
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'emergency_management',
    password: '2458',
    port: 5432,
  });

  try {
    console.log('PostgreSQL\'e bağlanmaya çalışılıyor...');
    await client.connect();
    console.log('✅ PostgreSQL\'e başarıyla bağlanıldı');

    // Mevcut extension'ları kontrol et
    console.log('📋 Mevcut extension\'lar kontrol ediliyor...');
    const existingExtensions = await client.query(`
      SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'postgis_topology')
    `);
    console.log('Mevcut PostGIS extension\'ları:', existingExtensions.rows);

    // PostGIS extension'ını etkinleştir
    console.log('🔧 PostGIS extension\'ı etkinleştiriliyor...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('✅ PostGIS extension\'ı etkinleştirildi');
    } catch (err) {
      console.log('❌ PostGIS extension hatası:', err.message);
    }

    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis_topology;');
      console.log('✅ PostGIS topology extension\'ı etkinleştirildi');
    } catch (err) {
      console.log('❌ PostGIS topology extension hatası:', err.message);
    }

    // Extension'ların kurulduğunu kontrol et
    console.log('📋 Extension\'lar tekrar kontrol ediliyor...');
    const result = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('postgis', 'postgis_topology')
    `);
    
    console.log('✅ Kurulu PostGIS extension\'ları:', result.rows);

    // Mevcut tabloları kontrol et
    console.log('📋 Mevcut tablolar kontrol ediliyor...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Warehouse', 'Camp', 'Earthquake', 'TsunamiAlert')
    `);
    console.log('Mevcut tablolar:', tables.rows);

    // Geometry sütunlarını ekle
    console.log('🔧 Geometry sütunları ekleniyor...');
    
    const geometryColumns = [
      { table: 'Warehouse', column: 'geom' },
      { table: 'Camp', column: 'geom' },
      { table: 'Earthquake', column: 'geom' },
      { table: 'TsunamiAlert', column: 'geom' }
    ];

    for (const { table, column } of geometryColumns) {
      try {
        await client.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS ${column} geometry;`);
        console.log(`✅ ${table}.${column} sütunu eklendi`);
      } catch (err) {
        console.log(`❌ ${table}.${column} sütunu eklenirken hata:`, err.message);
      }
    }
    
    console.log('🎉 PostGIS kurulumu tamamlandı!');

  } catch (error) {
    console.error('❌ Genel hata:', error.message);
    console.error('Tam hata:', error);
  } finally {
    try {
      await client.end();
      console.log('🔌 Veritabanı bağlantısı kapatıldı');
    } catch (err) {
      console.log('Bağlantı kapatma hatası:', err.message);
    }
  }
}

console.log('🚀 Script başlatılıyor...');
setupPostGIS().then(() => {
  console.log('✅ Script tamamlandı');
}).catch(err => {
  console.error('❌ Script hatası:', err);
}); 