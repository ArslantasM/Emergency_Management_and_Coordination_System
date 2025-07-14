const Database = require('better-sqlite3');
const path = require('path');

// Geonames.db dosyasının yolu
const dbPath = path.join(__dirname, '..', 'prisma', 'data', 'geonames.db');

try {
  // Veritabanını aç
  const db = new Database(dbPath, { readonly: true });
  
  console.log('🔍 Geonames.db Analizi\n');
  
  // Tabloları listele
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Tablolar:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  console.log('\n');
  
  // Her tablo için şema bilgisi
  tables.forEach(table => {
    console.log(`📊 ${table.name} Tablo Şeması:`);
    const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
    schema.forEach(col => {
      console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // İlk 5 kayıt
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`  📈 Toplam Kayıt: ${count.count}`);
      
      if (count.count > 0) {
        const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
        console.log('  📝 Örnek Veriler:');
        sample.forEach((row, index) => {
          console.log(`    ${index + 1}. ${JSON.stringify(row)}`);
        });
      }
    } catch (error) {
      console.log(`  ❌ Veri okuma hatası: ${error.message}`);
    }
    
    console.log('\n');
  });
  
  // Ülke verilerini kontrol et
  try {
    console.log('🌍 Ülke Verileri Analizi:');
    const countries = db.prepare(`
      SELECT * FROM geonames 
      WHERE feature_code = 'PCLI' 
      ORDER BY name 
      LIMIT 10
    `).all();
    
    console.log('İlk 10 Ülke:');
    countries.forEach(country => {
      console.log(`  ${country.name} (${country.country_code}) - Population: ${country.population}`);
    });
  } catch (error) {
    console.log(`❌ Ülke verisi okuma hatası: ${error.message}`);
  }
  
  // Şehir verilerini kontrol et
  try {
    console.log('\n🏙️ Şehir Verileri Analizi:');
    const cities = db.prepare(`
      SELECT * FROM geonames 
      WHERE feature_code IN ('PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC')
      AND country_code = 'TR'
      ORDER BY population DESC
      LIMIT 10
    `).all();
    
    console.log('Türkiye\'nin En Büyük 10 Şehri:');
    cities.forEach(city => {
      console.log(`  ${city.name} - Population: ${city.population}`);
    });
  } catch (error) {
    console.log(`❌ Şehir verisi okuma hatası: ${error.message}`);
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Veritabanı bağlantı hatası:', error.message);
  
  // Better-sqlite3 kurulu değilse
  if (error.message.includes('Cannot find module')) {
    console.log('\n💡 Çözüm: npm install better-sqlite3 komutu ile paketi kurun');
  }
} 