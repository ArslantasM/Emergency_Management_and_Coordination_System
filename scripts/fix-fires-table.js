const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixFiresTable() {
  try {
    console.log("Fire tablosunu duzeltiliyor...");

    await prisma.$executeRaw`DROP TABLE IF EXISTS fires CASCADE;`;
    console.log("Eski fires tablosu silindi");

    await prisma.$executeRaw`
      CREATE TABLE fires (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "fireId" VARCHAR(255) UNIQUE,
        source VARCHAR(255) NOT NULL,
        date TIMESTAMP(3) NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        brightness DOUBLE PRECISION,
        confidence INTEGER,
        frp DOUBLE PRECISION,
        satellite VARCHAR(255),
        instrument VARCHAR(255),
        location VARCHAR(255),
        geom geometry,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Yeni fires tablosu olusturuldu");

    await prisma.$executeRaw`CREATE INDEX "fires_source_idx" ON "fires"("source");`;
    await prisma.$executeRaw`CREATE INDEX "fires_date_idx" ON "fires"("date");`;
    await prisma.$executeRaw`CREATE INDEX "fires_confidence_idx" ON "fires"("confidence");`;
    console.log("Indeksler olusturuldu");

    await prisma.fire.createMany({
      data: [
        {
          source: "NASA_FIRMS_MODIS",
          date: new Date(),
          latitude: 36.8969,
          longitude: 30.7133,
          brightness: 320.5,
          confidence: 85,
          frp: 45.2,
          satellite: "Terra",
          instrument: "MODIS",
          location: "Antalya, Turkiye"
        },
        {
          source: "NASA_FIRMS_VIIRS",
          date: new Date(),
          latitude: 37.0662,
          longitude: 37.3833,
          brightness: 340.2,
          confidence: 90,
          frp: 78.5,
          satellite: "Aqua",
          instrument: "MODIS",
          location: "Sanliurfa, Turkiye"
        },
        {
          source: "NASA_FIRMS_MODIS",
          date: new Date(),
          latitude: 38.4192,
          longitude: 27.1287,
          brightness: 298.7,
          confidence: 65,
          frp: 25.8,
          satellite: "NPP",
          instrument: "VIIRS",
          location: "Izmir, Turkiye"
        }
      ]
    });
    console.log("Ornek yangin verileri eklendi");

    const fireCount = await prisma.fire.count();
    console.log(`Toplam yangin kaydi: ${fireCount}`);

    console.log("Fire tablosu basariyla duzeltildi!");

  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFiresTable();
