const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Veritabanı analizi başlıyor...\n');

  try {
    // Tüm tabloları ve satır sayılarını kontrol et
    const tables = [
      { name: 'User', model: 'user' },
      { name: 'Region', model: 'region' },
      { name: 'RegionUser', model: 'regionUser' },
      { name: 'Emergency', model: 'emergency' },
      { name: 'Task', model: 'task' },
      { name: 'Notification', model: 'notification' },
      { name: 'CampSite', model: 'campSite' },
      { name: 'Warehouse', model: 'warehouse' },
      { name: 'WarehouseCategory', model: 'warehouseCategory' },
      { name: 'WarehouseInfrastructure', model: 'warehouseInfrastructure' },
      { name: 'WarehouseCondition', model: 'warehouseCondition' },
      { name: 'Equipment', model: 'equipment' },
      { name: 'EquipmentCategory', model: 'equipmentCategory' },
      { name: 'Resource', model: 'resource' },
      { name: 'Personnel', model: 'personnel' },
      { name: 'Volunteer', model: 'volunteer' },
      { name: 'Training', model: 'training' },
      { name: 'Earthquake', model: 'earthquake' },
      { name: 'Fire', model: 'fire' },
      { name: 'TsunamiAlert', model: 'tsunamiAlert' },
      { name: 'ChatMessage', model: 'chatMessage' },
      { name: 'Transfer', model: 'transfer' },
      { name: 'InventoryItem', model: 'inventoryItem' },
      { name: 'InventoryCategory', model: 'inventoryCategory' },
      { name: 'Infrastructure', model: 'infrastructure' },
      { name: 'Container', model: 'container' },
      { name: 'Resident', model: 'resident' },
      { name: 'Session', model: 'session' },
      { name: 'Role', model: 'role' },
      { name: 'Permission', model: 'permission' },
      { name: 'RolePermission', model: 'rolePermission' }
    ];

    const results = [];

    for (const table of tables) {
      try {
        const count = await prisma[table.model].count();
        results.push({
          tableName: table.name,
          rowCount: count,
          exists: true
        });
        console.log(`✅ ${table.name}: ${count} satır`);
      } catch (error) {
        results.push({
          tableName: table.name,
          rowCount: 0,
          exists: false,
          error: error.message
        });
        console.log(`❌ ${table.name}: Tablo bulunamadı veya erişim hatası`);
      }
    }

    // Özet rapor
    console.log('\n📊 VERİTABANI ÖZETİ:');
    console.log('='.repeat(50));
    
    const existingTables = results.filter(r => r.exists);
    const totalRows = existingTables.reduce((sum, r) => sum + r.rowCount, 0);
    
    console.log(`📋 Toplam Tablo Sayısı: ${existingTables.length}`);
    console.log(`📊 Toplam Satır Sayısı: ${totalRows}`);
    
    console.log('\n🏆 EN FAZLA VERİ İÇEREN TABLOLAR:');
    existingTables
      .sort((a, b) => b.rowCount - a.rowCount)
      .slice(0, 10)
      .forEach((table, index) => {
        console.log(`${index + 1}. ${table.tableName}: ${table.rowCount} satır`);
      });

    // JSON formatında detay rapor
    const report = {
      timestamp: new Date().toISOString(),
      totalTables: existingTables.length,
      totalRows: totalRows,
      tables: results
    };

    require('fs').writeFileSync('database-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Detaylı rapor database-report.json dosyasına kaydedildi');

    return report;

  } catch (error) {
    console.error('❌ Veritabanı analizi sırasında hata:', error);
    throw error;
  }
}

checkDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 