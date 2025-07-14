import fetch from 'node-fetch';

async function testLogin() {
  console.log('🔐 Giriş sistemi test ediliyor...');
  
  const testUsers = [
    { email: 'admin@ornek.com', password: 'admin1234', name: 'Admin' },
    { email: 'byonetici@ornek.com', password: 'byonetici1234', name: 'Bölge Yöneticisi' },
    { email: 'kyonetici@ornek.com', password: 'kyonetici1234', name: 'Kurum Yöneticisi' },
    { email: 'personel@ornek.com', password: 'personel1234', name: 'Personel' },
    { email: 'gonullu@ornek.com', password: 'gonullu1234', name: 'Gönüllü' },
    { email: 'vatandas@ornek.com', password: 'vatandas1234', name: 'Vatandaş' }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n👤 ${user.name} girişi test ediliyor...`);
      
      // NextAuth credentials endpoint'ini test et
      const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email,
          password: user.password,
          csrfToken: 'test-token',
          callbackUrl: 'http://localhost:3000/dashboard',
          json: 'true'
        })
      });

      if (response.ok) {
        console.log(`✅ ${user.name} giriş başarılı`);
      } else {
        console.log(`❌ ${user.name} giriş başarısız - Status: ${response.status}`);
        const text = await response.text();
        console.log(`   Hata: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${user.name} giriş hatası: ${error.message}`);
    }
  }
}

// Test'i çalıştır
testLogin().then(() => {
  console.log('\n✅ Giriş testleri tamamlandı');
}).catch(err => {
  console.error('❌ Test hatası:', err);
}); 