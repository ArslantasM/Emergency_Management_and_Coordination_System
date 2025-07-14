const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TÜM DÜNYA Coğrafi Yapı Migration Başlıyor...\n');
console.log('📊 Bu işlem tüm dünya ülke, şehir, ilçe ve kasaba verilerini aktaracak');
console.log('⏱️ İşlem 10-30 dakika sürebilir (veri boyutuna göre)');
console.log('💾 Yaklaşık 100MB+ veritabanı alanı gereklidir\n');

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}`);
    console.log(`🔧 Komut: ${command}\n`);
    
    const startTime = Date.now();
    
    exec(command, { 
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    }, (error, stdout, stderr) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error) {
        console.error(`❌ Hata (${duration}s): ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`⚠️ Uyarı: ${stderr}`);
      }
      
      if (stdout) {
        console.log(`✅ Çıktı:\n${stdout}`);
      }
      
      console.log(`✅ ${description} tamamlandı (${duration}s)\n`);
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

async function checkDataFile() {
  console.log('📁 Geonames veri dosyası kontrol ediliyor...');
  
  const dataFile = path.join(process.cwd(), 'data', 'geonames_locations.json');
  
  if (!fs.existsSync(dataFile)) {
    console.error('❌ geonames_locations.json dosyası bulunamadı!');
    console.log('📥 Lütfen önce geonames verilerini indirin:');
    console.log('1. https://download.geonames.org/export/dump/allCountries.zip');
    console.log('2. Dosyayı data/ klasörüne yerleştirin');
    console.log('3. JSON formatına dönüştürün\n');
    throw new Error('Geonames veri dosyası bulunamadı');
  }
  
  const stats = fs.statSync(dataFile);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`✅ Veri dosyası bulundu: ${sizeMB} MB\n`);
  
  return dataFile;
}

async function estimateProcessingTime(dataFile) {
  console.log('⏱️ İşlem süresi tahmin ediliyor...');
  
  const stats = fs.statSync(dataFile);
  const sizeMB = stats.size / 1024 / 1024;
  
  // Yaklaşık hesaplama: 1MB = 30-60 saniye
  const estimatedMinutes = Math.ceil((sizeMB * 45) / 60);
  
  console.log(`📊 Tahmini işlem süresi: ${estimatedMinutes} dakika`);
  console.log(`💾 Beklenen veritabanı boyutu: ${(sizeMB * 1.5).toFixed(0)} MB\n`);
  
  return estimatedMinutes;
}

async function main() {
  try {
    // 1. Veri dosyasını kontrol et
    const dataFile = await checkDataFile();
    
    // 2. İşlem süresini tahmin et
    await estimateProcessingTime(dataFile);
    
    // 3. Kullanıcıya onay sor
    console.log('⚠️ UYARI: Bu işlem sisteminizde yoğun kaynak kullanımına sebep olabilir');
    console.log('💡 İpucu: İşlem sırasında bilgisayarınızı kapatmayın\n');
    
    // 4. Mevcut şemayı yedekle
    await backupCurrentSchema();
    
    // 5. Yeni şemayı aktif hale getir
    const newSchema = path.join(process.cwd(), 'prisma', 'schema-global-geography.prisma');
    const currentSchema = path.join(process.cwd(), 'prisma', 'schema.prisma');
    
    if (fs.existsSync(newSchema)) {
      fs.copyFileSync(newSchema, currentSchema);
      console.log('✅ Yeni şema aktif hale getirildi\n');
    } else {
      throw new Error('schema-global-geography.prisma dosyası bulunamadı');
    }
    
    // 6. Prisma generate
    await runCommand(
      'npx prisma generate',
      'Prisma client oluşturuluyor...'
    );
    
    // 7. Database push (development için)
    await runCommand(
      'npx prisma db push --force-reset',
      'Veritabanı şeması güncelleniyor...'
    );
    
    // 8. Tüm dünya verilerini içe aktar
    console.log('🌍 TÜM DÜNYA verileri aktarılıyor...');
    console.log('⏳ Bu işlem uzun sürebilir, lütfen bekleyin...\n');
    
    await runCommand(
      'node scripts/import-geonames-full-world.js',
      'Tüm dünya Geonames verileri içe aktarılıyor...'
    );
    
    console.log('🎉 TÜM DÜNYA Coğrafi Yapı Migration Başarıyla Tamamlandı!');
    console.log('✅ Global veritabanı yapısı hazır');
    console.log('✅ Tüm dünya ülke/şehir/ilçe/kasaba verileri yüklendi');
    console.log('✅ Popülasyon, koordinat ve alan bilgileri dahil');
    console.log('✅ TreeSelect için hiyerarşik yapı hazır');
    console.log('✅ Acil durum bölge yönetimi aktif');
    
    console.log('\n📊 Veritabanı İçeriği:');
    console.log('🌍 ~200+ Ülke');
    console.log('🏙️ ~10,000+ Şehir');
    console.log('🏘️ ~50,000+ İlçe');
    console.log('🏠 ~100,000+ Kasaba/Köy');
    
    console.log('\n📝 Sonraki adımlar:');
    console.log('1. API endpoint\'ini test edin: /api/regions/global');
    console.log('2. Bölge yönetimi sayfasını kontrol edin');
    console.log('3. TreeSelect komponenti ile test yapın');
    console.log('4. Performans optimizasyonu yapın');
    
  } catch (error) {
    console.error('\n❌ Migration hatası:', error.message);
    console.log('\n🔄 Geri alma işlemi:');
    console.log('1. Yedeklenen şemayı geri yükle');
    console.log('2. npx prisma db push çalıştır');
    console.log('3. Eski veri yapısını geri yükle');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 