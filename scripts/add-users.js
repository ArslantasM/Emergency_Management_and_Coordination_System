const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Demo kullanıcılar
const DEMO_USERS = [
  {
    name: 'Sistem Yöneticisi',
    email: 'admin@ornek.com',
    password: 'admin1234',
    role: 'ADMIN',
    phone_number: '+90 532 111 1111',
    organization: 'AFAD',
    department: 'Bilgi İşlem',
    position: 'Sistem Yöneticisi'
  },
  {
    name: 'Marmara Bölge Yöneticisi',
    email: 'byonetici@ornek.com',
    password: 'byonetici1234',
    role: 'REGIONAL_GOVERNOR',
    phone_number: '+90 532 222 2222',
    organization: 'AFAD',
    department: 'Bölge Müdürlüğü',
    position: 'Bölge Müdürü',
    region: 'Marmara Bölgesi'
  },
  {
    name: 'İstanbul İl Müdürü',
    email: 'kyonetici@ornek.com',
    password: 'kyonetici1234',
    role: 'MANAGER',
    phone_number: '+90 532 333 3333',
    organization: 'AFAD',
    department: 'İl Müdürlüğü',
    position: 'İl Müdürü',
    region: 'İstanbul'
  },
  {
    name: 'Acil Durum Personeli',
    email: 'personel@ornek.com',
    password: 'personel1234',
    role: 'STAFF',
    phone_number: '+90 532 444 4444',
    organization: 'AFAD',
    department: 'Operasyon',
    position: 'Uzman'
  },
  {
    name: 'Gönüllü Koordinatörü',
    email: 'gonullu@ornek.com',
    password: 'gonullu1234',
    role: 'VOLUNTEER',
    phone_number: '+90 532 555 5555',
    organization: 'Kızılay',
    department: 'Gönüllü Hizmetleri',
    position: 'Koordinatör'
  },
  {
    name: 'Vatandaş Kullanıcı',
    email: 'vatandas@ornek.com',
    password: 'vatandas1234',
    role: 'USER',
    phone_number: '+90 532 666 6666'
  }
];

async function addUsers() {
  console.log('👤 Demo kullanıcılar ekleniyor...');

  try {
    for (const user of DEMO_USERS) {
      // Kullanıcı zaten var mı kontrol et
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (existingUser) {
        console.log(`   ⚠️  ${user.name} zaten mevcut (${user.email})`);
        continue;
      }

      // Şifreyi hash'le
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Kullanıcıyı oluştur
      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password_hash: hashedPassword,
          role: user.role,
          phone_number: user.phone_number,
          organization: user.organization,
          department: user.department,
          position: user.position,
          region: user.region
        }
      });

      console.log(`   ✅ ${user.name} oluşturuldu (${user.email})`);
    }

    console.log('\n🎉 Demo kullanıcılar başarıyla eklendi!');
    console.log('\n🔑 Giriş bilgileri:');
    DEMO_USERS.forEach(user => {
      console.log(`   ${user.role}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Kullanıcı ekleme hatası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUsers(); 