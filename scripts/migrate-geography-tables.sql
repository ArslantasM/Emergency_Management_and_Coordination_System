-- Geography Tables Migration Script
-- Bu script mevcut Region tablosunu yeniden yapılandırır

-- ==================== BACKUP OLUŞTURMA ====================

-- Mevcut Region tablosunu yedekle
CREATE TABLE region_backup AS SELECT * FROM "Region";

-- Mevcut ilişkili tabloları yedekle
CREATE TABLE region_user_backup AS SELECT * FROM "RegionUser";
CREATE TABLE emergency_backup AS SELECT * FROM "Emergency";
CREATE TABLE warehouse_backup AS SELECT * FROM "Warehouse";
CREATE TABLE camp_site_backup AS SELECT * FROM "CampSite";

-- ==================== YENİ COĞRAFI TABLOLAR ====================

-- Countries tablosu
CREATE TABLE "Country" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "continent" TEXT,
    "geometry" geometry,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Cities tablosu
CREATE TABLE "City" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "countryId" TEXT NOT NULL,
    "geometry" geometry,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Districts tablosu
CREATE TABLE "District" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "cityId" TEXT NOT NULL,
    "geometry" geometry,
    "population" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Towns tablosu
CREATE TABLE "Town" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "districtId" TEXT NOT NULL,
    "geometry" geometry,
    "population" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'TOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Geometry indeksleri
CREATE INDEX "Country_geometry_idx" ON "Country" USING GIST ("geometry");
CREATE INDEX "City_geometry_idx" ON "City" USING GIST ("geometry");
CREATE INDEX "District_geometry_idx" ON "District" USING GIST ("geometry");
CREATE INDEX "Town_geometry_idx" ON "Town" USING GIST ("geometry");

-- ==================== VERİ AKTARIMI ====================

-- Mevcut Region verilerini yeni tablolara aktar
INSERT INTO "Country" ("id", "name", "code", "createdAt", "updatedAt")
SELECT 
    "id",
    "name",
    COALESCE("code", 'UNKNOWN'),
    "createdAt",
    "updatedAt"
FROM "Region" 
WHERE "type" = 'COUNTRY';

INSERT INTO "City" ("id", "name", "code", "countryId", "createdAt", "updatedAt")
SELECT 
    r."id",
    r."name",
    r."code",
    r."parentId",
    r."createdAt",
    r."updatedAt"
FROM "Region" r
WHERE r."type" = 'CITY' AND r."parentId" IS NOT NULL;

INSERT INTO "District" ("id", "name", "code", "cityId", "createdAt", "updatedAt")
SELECT 
    r."id",
    r."name",
    r."code",
    r."parentId",
    r."createdAt",
    r."updatedAt"
FROM "Region" r
WHERE r."type" = 'DISTRICT' AND r."parentId" IS NOT NULL;

INSERT INTO "Town" ("id", "name", "code", "districtId", "type", "createdAt", "updatedAt")
SELECT 
    r."id",
    r."name",
    r."code",
    r."parentId",
    'NEIGHBORHOOD',
    r."createdAt",
    r."updatedAt"
FROM "Region" r
WHERE r."type" = 'NEIGHBORHOOD' AND r."parentId" IS NOT NULL;

-- ==================== YENİ REGION TABLOSU ====================

-- Yeni Region tablosu (sadece acil durum bölgeleri için)
CREATE TABLE "RegionNew" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "geometry" geometry,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Many-to-Many ilişki tabloları
CREATE TABLE "RegionCountry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("regionId", "countryId")
);

CREATE TABLE "RegionCity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("regionId", "cityId")
);

CREATE TABLE "RegionDistrict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("regionId", "districtId")
);

CREATE TABLE "RegionTown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "townId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("regionId") REFERENCES "RegionNew"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("townId") REFERENCES "Town"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("regionId", "townId")
);

-- Geometry indeksi
CREATE INDEX "RegionNew_geometry_idx" ON "RegionNew" USING GIST ("geometry");

-- ==================== ÖRNEK ACİL DURUM BÖLGELERİ ====================

-- Örnek bölgeler oluştur
INSERT INTO "RegionNew" ("id", "name", "description", "color", "priority", "createdAt", "updatedAt") VALUES
('region-marmara-emergency', 'Marmara Acil Durum Bölgesi', 'Marmara Bölgesi acil durum koordinasyon alanı', '#FF6B6B', 'HIGH', NOW(), NOW()),
('region-aegean-emergency', 'Ege Acil Durum Bölgesi', 'Ege Bölgesi acil durum koordinasyon alanı', '#4ECDC4', 'NORMAL', NOW(), NOW()),
('region-mediterranean-emergency', 'Akdeniz Acil Durum Bölgesi', 'Akdeniz Bölgesi acil durum koordinasyon alanı', '#45B7D1', 'NORMAL', NOW(), NOW()),
('region-central-anatolia-emergency', 'İç Anadolu Acil Durum Bölgesi', 'İç Anadolu Bölgesi acil durum koordinasyon alanı', '#96CEB4', 'NORMAL', NOW(), NOW()),
('region-black-sea-emergency', 'Karadeniz Acil Durum Bölgesi', 'Karadeniz Bölgesi acil durum koordinasyon alanı', '#FFEAA7', 'NORMAL', NOW(), NOW()),
('region-eastern-anatolia-emergency', 'Doğu Anadolu Acil Durum Bölgesi', 'Doğu Anadolu Bölgesi acil durum koordinasyon alanı', '#DDA0DD', 'NORMAL', NOW(), NOW()),
('region-southeastern-anatolia-emergency', 'Güneydoğu Anadolu Acil Durum Bölgesi', 'Güneydoğu Anadolu Bölgesi acil durum koordinasyon alanı', '#F4A460', 'NORMAL', NOW(), NOW());

-- ==================== DÜNYA GENELİ ÖRNEK VERİLER ====================

-- Dünya ülkeleri
INSERT INTO "Country" ("id", "name", "code", "continent", "createdAt", "updatedAt") VALUES
('country-tr', 'Türkiye', 'TR', 'Asia', NOW(), NOW()),
('country-us', 'Amerika Birleşik Devletleri', 'US', 'North America', NOW(), NOW()),
('country-de', 'Almanya', 'DE', 'Europe', NOW(), NOW()),
('country-fr', 'Fransa', 'FR', 'Europe', NOW(), NOW()),
('country-gb', 'Birleşik Krallık', 'GB', 'Europe', NOW(), NOW()),
('country-it', 'İtalya', 'IT', 'Europe', NOW(), NOW()),
('country-es', 'İspanya', 'ES', 'Europe', NOW(), NOW()),
('country-jp', 'Japonya', 'JP', 'Asia', NOW(), NOW()),
('country-cn', 'Çin', 'CN', 'Asia', NOW(), NOW()),
('country-in', 'Hindistan', 'IN', 'Asia', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Türkiye şehirleri
INSERT INTO "City" ("id", "name", "code", "countryId", "population", "createdAt", "updatedAt") VALUES
('city-istanbul', 'İstanbul', '34', 'country-tr', 15840000, NOW(), NOW()),
('city-ankara', 'Ankara', '06', 'country-tr', 5750000, NOW(), NOW()),
('city-izmir', 'İzmir', '35', 'country-tr', 4400000, NOW(), NOW()),
('city-bursa', 'Bursa', '16', 'country-tr', 3100000, NOW(), NOW()),
('city-antalya', 'Antalya', '07', 'country-tr', 2600000, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- İstanbul ilçeleri
INSERT INTO "District" ("id", "name", "code", "cityId", "population", "createdAt", "updatedAt") VALUES
('district-kadikoy', 'Kadıköy', '34-KAD', 'city-istanbul', 467919, NOW(), NOW()),
('district-besiktas', 'Beşiktaş', '34-BES', 'city-istanbul', 175190, NOW(), NOW()),
('district-sisli', 'Şişli', '34-SIS', 'city-istanbul', 265800, NOW(), NOW()),
('district-fatih', 'Fatih', '34-FAT', 'city-istanbul', 368227, NOW(), NOW()),
('district-uskudar', 'Üsküdar', '34-USK', 'city-istanbul', 524452, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- ABD şehirleri
INSERT INTO "City" ("id", "name", "code", "countryId", "population", "createdAt", "updatedAt") VALUES
('city-newyork', 'New York', 'NY', 'country-us', 8400000, NOW(), NOW()),
('city-losangeles', 'Los Angeles', 'LA', 'country-us', 3900000, NOW(), NOW()),
('city-chicago', 'Chicago', 'CHI', 'country-us', 2700000, NOW(), NOW()),
('city-houston', 'Houston', 'HOU', 'country-us', 2300000, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Almanya şehirleri
INSERT INTO "City" ("id", "name", "code", "countryId", "population", "createdAt", "updatedAt") VALUES
('city-berlin', 'Berlin', 'BER', 'country-de', 3700000, NOW(), NOW()),
('city-hamburg', 'Hamburg', 'HAM', 'country-de', 1900000, NOW(), NOW()),
('city-munich', 'München', 'MUN', 'country-de', 1500000, NOW(), NOW()),
('city-cologne', 'Köln', 'COL', 'country-de', 1100000, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- ==================== TEMİZLİK VE FİNALİZASYON ====================

-- Bu adımlar manuel olarak yapılmalıdır:
-- 1. Mevcut ilişkili tabloları güncelle
-- 2. Eski Region tablosunu sil
-- 3. RegionNew tablosunu Region olarak yeniden adlandır
-- 4. Foreign key'leri güncelle

-- Komut örnekleri (Manuel çalıştırılmalı):
-- DROP TABLE "Region" CASCADE;
-- ALTER TABLE "RegionNew" RENAME TO "Region";
-- ALTER TABLE "RegionUser" RENAME TO "RegionUserOld";
-- CREATE TABLE "RegionUser" (... yeni yapı ...);

COMMIT; 