const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function updateCache() {
  try {
    console.log('Cache guncelleniyor...');
    
    // Demo deprem verisi oluştur (Kandilli API yerine)
    const demoEarthquakes = [
      {
        id: 'eq_' + Date.now() + '_1',
        eventId: 'KOERI_' + Date.now(),
        source: 'KOERI',
        date: new Date().toISOString(),
        latitude: 38.7437,
        longitude: 35.4781,
        depth: 10.5,
        magnitude: 4.2,
        type: 'earthquake',
        location: 'Kayseri, Türkiye',
        tsunamiAlert: false
      },
      {
        id: 'eq_' + Date.now() + '_2',
        eventId: 'KOERI_' + (Date.now() + 1),
        source: 'KOERI',
        date: new Date(Date.now() - 60000).toISOString(),
        latitude: 40.7128,
        longitude: 29.1734,
        depth: 15.2,
        magnitude: 3.8,
        type: 'earthquake',
        location: 'İstanbul, Türkiye',
        tsunamiAlert: false
      },
      {
        id: 'eq_' + Date.now() + '_3',
        eventId: 'KOERI_' + (Date.now() + 2),
        source: 'KOERI',
        date: new Date(Date.now() - 120000).toISOString(),
        latitude: 39.9334,
        longitude: 32.8597,
        depth: 8.7,
        magnitude: 4.5,
        type: 'earthquake',
        location: 'Ankara, Türkiye',
        tsunamiAlert: false
      }
    ];
    
    // Cache klasörünü oluştur
    const cacheDir = path.join(process.cwd(), 'cache');
    try {
      await fs.mkdir(cacheDir, { recursive: true });
    } catch (err) {
      // Klasör zaten varsa hata verme
    }
    
    // Cache service formatında veri hazırla
    const cacheData = {
      lastUpdated: new Date().toISOString(),
      count: demoEarthquakes.length,
      data: demoEarthquakes
    };
    
    // Cache dosyasına yaz
    const cacheFile = path.join(cacheDir, 'earthquakes.json');
    await fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2), 'utf8');
    
    console.log(demoEarthquakes.length + ' deprem verisi cache\'e yazildi');
    console.log('Cache dosyasi: ' + cacheFile);
    
  } catch (error) {
    console.error('Cache guncelleme hatasi:', error.message);
  }
}

updateCache(); 