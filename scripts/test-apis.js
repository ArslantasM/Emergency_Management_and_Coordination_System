const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`);
    
    if (response.data.success !== false) {
      console.log(`✅ Success: ${response.status}`);
      
      if (response.data.data) {
        console.log(`📊 Data count: ${Array.isArray(response.data.data) ? response.data.data.length : 'Single object'}`);
      }
      
      if (response.data.pagination) {
        console.log(`📄 Pagination: ${response.data.pagination.total} total items`);
      }
      
      if (response.data.stats) {
        console.log(`📈 Stats:`, response.data.stats);
      }
    } else {
      console.log(`❌ API Error: ${response.data.error}`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ HTTP Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
    } else {
      console.log(`❌ Request Error: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('🚀 API Test Suite Başlatılıyor...\n');
  
  // Coğrafi veri API'leri
  await testAPI('/countries?limit=5', 'Countries API - İlk 5 ülke');
  await testAPI('/countries?search=turkey', 'Countries API - Türkiye arama');
  
  await testAPI('/cities?limit=5', 'Cities API - İlk 5 şehir');
  await testAPI('/cities?search=istanbul', 'Cities API - İstanbul arama');
  
  await testAPI('/districts?limit=5', 'Districts API - İlk 5 ilçe');
  await testAPI('/districts?search=kadıköy', 'Districts API - Kadıköy arama');
  
  // Türkiye özel filtreleri
  const turkeyResponse = await axios.get(`${BASE_URL}/countries?search=turkey`).catch(() => null);
  if (turkeyResponse?.data?.data?.[0]?.id) {
    const turkeyId = turkeyResponse.data.data[0].id;
    await testAPI(`/cities?countryId=${turkeyId}&limit=5`, 'Cities API - Türkiye şehirleri');
    await testAPI(`/districts?countryId=${turkeyId}&limit=10`, 'Districts API - Türkiye ilçeleri');
  }
  
  // Regions API
  await testAPI('/regions', 'Regions API - Bölge ağacı');
  
  console.log('\n🎉 Test suite tamamlandı!');
}

// Axios varsayılan ayarları
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Accept'] = 'application/json';

runTests().catch(error => {
  console.error('❌ Test suite hatası:', error.message);
}); 