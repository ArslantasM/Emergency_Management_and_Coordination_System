const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Global Coğrafi Yapı Migration Başlıyor...\n');

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}`);
    console.log(`🔧 Komut: ${command}\n`);
    
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Hata: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`⚠️ Uyarı: ${stderr}`);
      }
      
      if (stdout) {
        console.log(`✅ Çıktı:\n${stdout}`);
      }
      
      console.log(`✅ ${description} tamamlandı\n`);
      resolve(stdout);
    });
  });
}

async function backupCurrentSchema() {
  console.log('💾 Mevcut şema yedekleniyor...');
  
  try {
    const currentSchema = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const backupSchema = path.join(process.cwd(), 'prisma', `schema-backup-${Date.now()}.prisma`);
    
    if (fs.existsSync(currentSchema)) {
      fs.copyFileSync(currentSchema, backupSchema);
      console.log(`✅ Şema yedeklendi: ${backupSchema}\n`);
    }
  } catch (error) {
    console.warn(`⚠️ Şema yedeklenemedi: ${error.message}\n`);
  }
}

async function main() {
  try {
    // 1. Mevcut şemayı yedekle
    await backupCurrentSchema();
    
    // 2. Yeni şemayı aktif hale getir
    const newSchema = path.join(process.cwd(), 'prisma', 'schema-global-geography.prisma');
    const currentSchema = path.join(process.cwd(), 'prisma', 'schema.prisma');
    
    if (fs.existsSync(newSchema)) {
      fs.copyFileSync(newSchema, currentSchema);
      console.log('✅ Yeni şema aktif hale getirildi\n');
    } else {
      throw new Error('schema-global-geography.prisma dosyası bulunamadı');
    }
    
    // 3. Prisma generate
    await runCommand(
      'npx prisma generate',
      'Prisma client oluşturuluyor...'
    );
    
    // 4. Database push (development için)
    await runCommand(
      'npx prisma db push --force-reset',
      'Veritabanı şeması güncelleniyor...'
    );
    
    // 5. Geonames verilerini içe aktar
    await runCommand(
      'node scripts/import-geonames-global.js',
      'Geonames verileri içe aktarılıyor...'
    );
    
    console.log('🎉 Global Coğrafi Yapı Migration Başarıyla Tamamlandı!');
    console.log('✅ Yeni veritabanı yapısı hazır');
    console.log('✅ TreeSelect için global coğrafi veriler yüklendi');
    console.log('✅ Acil durum bölge yönetimi aktif');
    console.log('\n📝 Sonraki adımlar:');
    console.log('1. Frontend TreeSelect komponenti güncelle');
    console.log('2. Bölge yönetimi sayfasını test et');
    console.log('3. API endpoint\'lerini kontrol et');
    
  } catch (error) {
    console.error('\n❌ Migration hatası:', error.message);
    console.log('\n🔄 Geri alma işlemi:');
    console.log('1. Yedeklenen şemayı geri yükle');
    console.log('2. npx prisma db push çalıştır');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 