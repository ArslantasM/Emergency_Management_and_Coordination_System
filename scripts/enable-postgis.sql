-- PostGIS Extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Extension'ların kurulduğunu kontrol et
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name IN ('postgis', 'postgis_topology'); 