-- Dünya geneli ülke, şehir ve ilçe verileri ekleme
-- Önce mevcut verileri kontrol et
SELECT COUNT(*) as country_count FROM "Region" WHERE type = 'COUNTRY';

-- Ülkeler ekle
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('country-tr', 'Türkiye', 'TR', 'COUNTRY', NULL, NOW(), NOW()),
('country-us', 'Amerika Birleşik Devletleri', 'US', 'COUNTRY', NULL, NOW(), NOW()),
('country-de', 'Almanya', 'DE', 'COUNTRY', NULL, NOW(), NOW()),
('country-fr', 'Fransa', 'FR', 'COUNTRY', NULL, NOW(), NOW()),
('country-gb', 'Birleşik Krallık', 'GB', 'COUNTRY', NULL, NOW(), NOW()),
('country-it', 'İtalya', 'IT', 'COUNTRY', NULL, NOW(), NOW()),
('country-es', 'İspanya', 'ES', 'COUNTRY', NULL, NOW(), NOW()),
('country-jp', 'Japonya', 'JP', 'COUNTRY', NULL, NOW(), NOW()),
('country-cn', 'Çin', 'CN', 'COUNTRY', NULL, NOW(), NOW()),
('country-in', 'Hindistan', 'IN', 'COUNTRY', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Türkiye şehirleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('city-istanbul', 'İstanbul', '34', 'CITY', 'country-tr', NOW(), NOW()),
('city-ankara', 'Ankara', '06', 'CITY', 'country-tr', NOW(), NOW()),
('city-izmir', 'İzmir', '35', 'CITY', 'country-tr', NOW(), NOW()),
('city-bursa', 'Bursa', '16', 'CITY', 'country-tr', NOW(), NOW()),
('city-antalya', 'Antalya', '07', 'CITY', 'country-tr', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- İstanbul ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-kadikoy', 'Kadıköy', '34-KAD', 'DISTRICT', 'city-istanbul', NOW(), NOW()),
('district-besiktas', 'Beşiktaş', '34-BES', 'DISTRICT', 'city-istanbul', NOW(), NOW()),
('district-sisli', 'Şişli', '34-SIS', 'DISTRICT', 'city-istanbul', NOW(), NOW()),
('district-fatih', 'Fatih', '34-FAT', 'DISTRICT', 'city-istanbul', NOW(), NOW()),
('district-uskudar', 'Üsküdar', '34-USK', 'DISTRICT', 'city-istanbul', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Ankara ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-cankaya', 'Çankaya', '06-CAN', 'DISTRICT', 'city-ankara', NOW(), NOW()),
('district-kecioren', 'Keçiören', '06-KEC', 'DISTRICT', 'city-ankara', NOW(), NOW()),
('district-yenimahalle', 'Yenimahalle', '06-YEN', 'DISTRICT', 'city-ankara', NOW(), NOW()),
('district-mamak', 'Mamak', '06-MAM', 'DISTRICT', 'city-ankara', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ABD şehirleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('city-newyork', 'New York', 'NY', 'CITY', 'country-us', NOW(), NOW()),
('city-losangeles', 'Los Angeles', 'LA', 'CITY', 'country-us', NOW(), NOW()),
('city-chicago', 'Chicago', 'CHI', 'CITY', 'country-us', NOW(), NOW()),
('city-houston', 'Houston', 'HOU', 'CITY', 'country-us', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- New York ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-manhattan', 'Manhattan', 'NY-MAN', 'DISTRICT', 'city-newyork', NOW(), NOW()),
('district-brooklyn', 'Brooklyn', 'NY-BRO', 'DISTRICT', 'city-newyork', NOW(), NOW()),
('district-queens', 'Queens', 'NY-QUE', 'DISTRICT', 'city-newyork', NOW(), NOW()),
('district-bronx', 'Bronx', 'NY-BRO', 'DISTRICT', 'city-newyork', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Almanya şehirleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('city-berlin', 'Berlin', 'BER', 'CITY', 'country-de', NOW(), NOW()),
('city-hamburg', 'Hamburg', 'HAM', 'CITY', 'country-de', NOW(), NOW()),
('city-munich', 'München', 'MUN', 'CITY', 'country-de', NOW(), NOW()),
('city-cologne', 'Köln', 'COL', 'CITY', 'country-de', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Berlin ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-mitte', 'Mitte', 'BER-MIT', 'DISTRICT', 'city-berlin', NOW(), NOW()),
('district-kreuzberg', 'Kreuzberg', 'BER-KRE', 'DISTRICT', 'city-berlin', NOW(), NOW()),
('district-charlottenburg', 'Charlottenburg', 'BER-CHA', 'DISTRICT', 'city-berlin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Fransa şehirleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('city-paris', 'Paris', 'PAR', 'CITY', 'country-fr', NOW(), NOW()),
('city-lyon', 'Lyon', 'LYO', 'CITY', 'country-fr', NOW(), NOW()),
('city-marseille', 'Marseille', 'MAR', 'CITY', 'country-fr', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Paris ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-1st-arr', '1er arrondissement', 'PAR-1ST', 'DISTRICT', 'city-paris', NOW(), NOW()),
('district-2nd-arr', '2e arrondissement', 'PAR-2ND', 'DISTRICT', 'city-paris', NOW(), NOW()),
('district-3rd-arr', '3e arrondissement', 'PAR-3RD', 'DISTRICT', 'city-paris', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- İngiltere şehirleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('city-london', 'London', 'LON', 'CITY', 'country-gb', NOW(), NOW()),
('city-manchester', 'Manchester', 'MAN', 'CITY', 'country-gb', NOW(), NOW()),
('city-birmingham', 'Birmingham', 'BIR', 'CITY', 'country-gb', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- London ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-westminster', 'Westminster', 'LON-WES', 'DISTRICT', 'city-london', NOW(), NOW()),
('district-camden', 'Camden', 'LON-CAM', 'DISTRICT', 'city-london', NOW(), NOW()),
('district-islington', 'Islington', 'LON-ISL', 'DISTRICT', 'city-london', NOW(), NOW()),
('district-tower-hamlets', 'Tower Hamlets', 'LON-TOW', 'DISTRICT', 'city-london', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- İtalya şehirleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('city-rome', 'Roma', 'ROM', 'CITY', 'country-it', NOW(), NOW()),
('city-milan', 'Milano', 'MIL', 'CITY', 'country-it', NOW(), NOW()),
('city-naples', 'Napoli', 'NAP', 'CITY', 'country-it', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Roma ilçeleri
INSERT INTO "Region" (id, name, code, type, "parentId", "createdAt", "updatedAt") VALUES
('district-centro-storico', 'Centro Storico', 'ROM-CEN', 'DISTRICT', 'city-rome', NOW(), NOW()),
('district-trastevere', 'Trastevere', 'ROM-TRA', 'DISTRICT', 'city-rome', NOW(), NOW()),
('district-testaccio', 'Testaccio', 'ROM-TES', 'DISTRICT', 'city-rome', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sonuç kontrolü
SELECT 
  (SELECT COUNT(*) FROM "Region" WHERE type = 'COUNTRY') as countries,
  (SELECT COUNT(*) FROM "Region" WHERE type = 'CITY') as cities,
  (SELECT COUNT(*) FROM "Region" WHERE type = 'DISTRICT') as districts; 