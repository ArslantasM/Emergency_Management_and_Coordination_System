-- Toplam kayıt sayısı
SELECT COUNT(*) as total_records FROM location_mappings;

-- Eşleşen/eşleşmeyen kayıt sayıları
SELECT is_matched, COUNT(*) as count
FROM location_mappings
GROUP BY is_matched;

-- Lokasyon tiplerine göre dağılım
SELECT location_type, COUNT(*) as count
FROM location_mappings
GROUP BY location_type
ORDER BY count DESC;

-- Nüfusu olan kayıt sayısı
SELECT COUNT(*) as records_with_population
FROM location_mappings
WHERE population IS NOT NULL;

-- En yüksek nüfuslu 10 lokasyon
SELECT geonames_name, our_name, population, location_type
FROM location_mappings
WHERE population IS NOT NULL
ORDER BY population DESC
LIMIT 10; 