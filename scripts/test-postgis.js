const { Client } = require('pg');

async function testPostGIS() {
  console.log('🧪 PostGIS test başlatılıyor...');
  
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'emergency_management',
    password: '2458',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL bağlantısı başarılı');

    // PostGIS version kontrolü
    const versionResult = await client.query('SELECT PostGIS_Version();');
    console.log('📍 PostGIS Version:', versionResult.rows[0].postgis_version);

    // Geometry sütunlarının varlığını kontrol et
    const geometryColumns = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE data_type = 'USER-DEFINED' 
      AND table_name IN ('Warehouse', 'Camp', 'Earthquake', 'TsunamiAlert')
      ORDER BY table_name, column_name;
    `);
    
    console.log('🗂️ Geometry sütunları:');
    geometryColumns.rows.forEach(row => {
      console.log(`  - ${row.table_name}.${row.column_name} (${row.data_type})`);
    });

    // Örnek geometry verisi ekleme testi
    console.log('🔧 Geometry verisi test ediliyor...');
    
    // İstanbul koordinatları ile test
    const testGeometry = 'POINT(28.9784 41.0082)';
    
    const testResult = await client.query(`
      SELECT ST_AsText(ST_GeomFromText($1, 4326)) as point_text,
             ST_X(ST_GeomFromText($1, 4326)) as longitude,
             ST_Y(ST_GeomFromText($1, 4326)) as latitude
    `, [testGeometry]);
    
    console.log('📍 Test geometry sonucu:', testResult.rows[0]);

    // Veritabanındaki toplam kayıt sayıları
    const tables = ['Region', 'Province', 'District', 'User', 'Warehouse', 'Earthquake'];
    console.log('📊 Veritabanı kayıt sayıları:');
    
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`  - ${table}: ${countResult.rows[0].count} kayıt`);
      } catch (err) {
        console.log(`  - ${table}: Hata - ${err.message}`);
      }
    }

    // Kullanıcı detaylarını göster
    try {
      const userResult = await client.query(`SELECT email, role, name FROM "User" ORDER BY email`);
      if (userResult.rows.length > 0) {
        console.log('👥 Kullanıcı listesi:');
        userResult.rows.forEach(u => {
          console.log(`  - ${u.name || 'İsimsiz'} (${u.email}) - ${u.role}`);
        });
      }
    } catch (err) {
      console.log('👥 Kullanıcı listesi alınamadı:', err.message);
    }

    console.log('🎉 PostGIS test başarıyla tamamlandı!');

  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Bağlantı kapatıldı');
  }
}

console.log('🚀 PostGIS test script başlatılıyor...');
testPostGIS().then(() => {
  console.log('✅ Test tamamlandı');
}).catch(err => {
  console.error('❌ Test script hatası:', err);
}); 