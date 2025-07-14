import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Region sayısını kontrol et
    const regionCount = await prisma.region.count();
    console.log(`Region sayısı: ${regionCount}`);

    // Province sayısını kontrol et
    const provinceCount = await prisma.province.count();
    console.log(`Province sayısı: ${provinceCount}`);

    // District sayısını kontrol et
    const districtCount = await prisma.district.count();
    console.log(`District sayısı: ${districtCount}`);

    // Town sayısını kontrol et
    const townCount = await prisma.town.count();
    console.log(`Town sayısı: ${townCount}`);

    // Geonames verilerinin kontrolü
    const provincesWithGeonames = await prisma.province.count({
      where: {
        NOT: { geonameid: null }
      }
    });
    console.log(`Geonames verisi olan il sayısı: ${provincesWithGeonames}`);

    const districtsWithGeonames = await prisma.district.count({
      where: {
        NOT: { geonameid: null }
      }
    });
    console.log(`Geonames verisi olan ilçe sayısı: ${districtsWithGeonames}`);

    const townsWithGeonames = await prisma.town.count({
      where: {
        NOT: { geonameid: null }
      }
    });
    console.log(`Geonames verisi olan kasaba sayısı: ${townsWithGeonames}`);

  } catch (error) {
    console.error('Veri kontrolü sırasında hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 