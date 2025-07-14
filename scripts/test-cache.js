const axios = require('axios');

async function testCache() {
  try {
    console.log('Cache sistemi test ediliyor...');
    
    // Cache status kontrolü
    const statusResponse = await axios.get('http://localhost:3000/api/cache/status');
    console.log('Cache durumu:', JSON.stringify(statusResponse.data, null, 2));
    
    // Deprem verilerini test et
    const earthquakeResponse = await axios.get('http://localhost:3000/api/cache/earthquakes');
    console.log('Cache\'den ' + earthquakeResponse.data.features.length + ' deprem verisi alindi');
    
    if (earthquakeResponse.data.features.length > 0) {
      console.log('Cache sistemi basariyla calisiyor!');
      console.log('Ilk deprem verisi:', earthquakeResponse.data.features[0]);
    } else {
      console.log('Cache\'de henuz veri yok');
    }
    
  } catch (error) {
    console.error('Cache test hatasi:', error.message);
  }
}

testCache();
