import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Geonames alanları ekleniyor...');

  try {
    // Region tablosuna alanları ekle
    await prisma.$executeRaw`
      ALTER TABLE "Region" 
      ADD COLUMN IF NOT EXISTS "geonameid" INTEGER,
      ADD COLUMN IF NOT EXISTS "asciiname" TEXT,
      ADD COLUMN IF NOT EXISTS "alternatenames" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_class" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_code" TEXT,
      ADD COLUMN IF NOT EXISTS "timezone" TEXT,
      ADD COLUMN IF NOT EXISTS "elevation" REAL,
      ADD COLUMN IF NOT EXISTS "dem" INTEGER
    `;
    console.log('Region tablosu güncellendi.');

    // Province tablosuna alanları ekle
    await prisma.$executeRaw`
      ALTER TABLE "Province" 
      ADD COLUMN IF NOT EXISTS "geonameid" INTEGER,
      ADD COLUMN IF NOT EXISTS "asciiname" TEXT,
      ADD COLUMN IF NOT EXISTS "alternatenames" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_class" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_code" TEXT,
      ADD COLUMN IF NOT EXISTS "timezone" TEXT,
      ADD COLUMN IF NOT EXISTS "elevation" REAL,
      ADD COLUMN IF NOT EXISTS "dem" INTEGER
    `;
    console.log('Province tablosu güncellendi.');

    // District tablosuna alanları ekle
    await prisma.$executeRaw`
      ALTER TABLE "District" 
      ADD COLUMN IF NOT EXISTS "geonameid" INTEGER,
      ADD COLUMN IF NOT EXISTS "asciiname" TEXT,
      ADD COLUMN IF NOT EXISTS "alternatenames" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_class" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_code" TEXT,
      ADD COLUMN IF NOT EXISTS "timezone" TEXT,
      ADD COLUMN IF NOT EXISTS "elevation" REAL,
      ADD COLUMN IF NOT EXISTS "dem" INTEGER
    `;
    console.log('District tablosu güncellendi.');

    // Town tablosuna alanları ekle
    await prisma.$executeRaw`
      ALTER TABLE "Town" 
      ADD COLUMN IF NOT EXISTS "geonameid" INTEGER,
      ADD COLUMN IF NOT EXISTS "asciiname" TEXT,
      ADD COLUMN IF NOT EXISTS "alternatenames" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_class" TEXT,
      ADD COLUMN IF NOT EXISTS "feature_code" TEXT,
      ADD COLUMN IF NOT EXISTS "timezone" TEXT,
      ADD COLUMN IF NOT EXISTS "elevation" REAL,
      ADD COLUMN IF NOT EXISTS "dem" INTEGER
    `;
    console.log('Town tablosu güncellendi.');

    console.log('Tüm tablolar başarıyla güncellendi!');
  } catch (error) {
    console.error('Hata oluştu:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 