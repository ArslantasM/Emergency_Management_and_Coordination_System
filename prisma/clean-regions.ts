import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Bölge verilerini temizleme başladı...');

    // Önce ilişkili tabloları temizle
    await prisma.camp.updateMany({
      where: { region_id: { not: null } },
      data: { region_id: null }
    });

    // Bölgeleri hiyerarşik olarak temizle (önce alt bölgeler)
    await prisma.region.deleteMany({
      where: { type: 'DISTRICT' }
    });
    console.log('İlçeler silindi');

    await prisma.region.deleteMany({
      where: { type: 'CITY' }
    });
    console.log('İller silindi');

    await prisma.region.deleteMany({
      where: { 
        type: 'REGION',
        code: { startsWith: 'EQ-ZONE-' }
      }
    });
    console.log('Deprem bölgeleri silindi');

    await prisma.region.deleteMany({
      where: { type: 'COUNTRY' }
    });
    console.log('Ülkeler silindi');

    await prisma.region.deleteMany({
      where: { type: 'REGION' }
    });
    console.log('Ana bölgeler silindi');

    console.log('Bölge verileri başarıyla temizlendi');
  } catch (error) {
    console.error('Veri temizleme sırasında hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 