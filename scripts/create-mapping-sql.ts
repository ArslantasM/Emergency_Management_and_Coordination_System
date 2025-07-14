import * as fs from 'fs';
import * as path from 'path';

interface Location {
    id: string;
    name: string;
    code: string;
    type: 'province' | 'district' | 'town';
    parent_id?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

interface GeonamesLocation {
    geonameid: number;
    name: string;
    asciiname: string;
    alternatenames: string;
    latitude: number;
    longitude: number;
    feature_class: string;
    feature_code: string;
    country_code: string;
    admin1_code: string;
    admin2_code: string;
    timezone: string;
    population: number;
    elevation: number;
    dem: number;
}

interface GeonamesData {
    provinces: GeonamesLocation[];
    districts: GeonamesLocation[];
    towns: GeonamesLocation[];
}

let totalMatches = 0;
let totalUnmatched = 0;
const usedGeonamesIds = new Set<number>();

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/â/g, 'a')
        .replace(/î/g, 'i')
        .replace(/û/g, 'u')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function findBestMatch(location: Location, candidates: GeonamesLocation[]): GeonamesLocation | null {
    const normalizedName = normalizeText(location.name);
    let bestMatch: GeonamesLocation | null = null;
    let bestScore = 0;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
        // İsim kontrolü
        let score = 0;
        const candidateName = normalizeText(candidate.name);
        if (candidateName === normalizedName) {
            score += 100;
        }

        // Alternatif isimler kontrolü
        if (candidate.alternatenames) {
            const alternateNames = candidate.alternatenames.split(',').map(normalizeText);
            if (alternateNames.includes(normalizedName)) {
                score += 50;
            }
        }

        // Koordinat kontrolü
        if (location.coordinates && score > 0) {
            const distance = calculateDistance(
                location.coordinates.latitude,
                location.coordinates.longitude,
                candidate.latitude,
                candidate.longitude
            );
            
            // 50km'den uzak lokasyonları eleme
            if (distance > 50) {
                continue;
            }
            
            // Mesafeye göre skor hesapla (en yakın en yüksek)
            const distanceScore = Math.max(0, 50 - distance);
            score += distanceScore;
            
            // Aynı skorda daha yakın olanı seç
            if (score === bestScore && distance < bestDistance) {
                bestMatch = candidate;
                bestDistance = distance;
            }
        }

        if (score > bestScore) {
            bestMatch = candidate;
            bestScore = score;
            if (location.coordinates) {
                bestDistance = calculateDistance(
                    location.coordinates.latitude,
                    location.coordinates.longitude,
                    candidate.latitude,
                    candidate.longitude
                );
            }
        }
    }

    return bestMatch;
}

function addUnmatchedLocations(locations: GeonamesLocation[], locationType: string, mappings: string[]) {
    for (const loc of locations) {
        if (!usedGeonamesIds.has(loc.geonameid)) {
            totalUnmatched++;
            mappings.push(`INSERT INTO location_mappings (
                geonames_id, location_type, geonames_code, geonames_name,
                population, elevation, dem, feature_code, latitude, longitude, is_matched
            ) VALUES (
                ${loc.geonameid}, '${locationType}_${loc.geonameid}',
                '${loc.feature_code === 'ADM1' ? loc.admin1_code : 
                   loc.feature_code === 'ADM2' ? loc.admin2_code : loc.feature_code}',
                '${loc.name.replace(/'/g, "''")}',
                ${loc.population || 'NULL'}, ${loc.elevation || 'NULL'}, ${loc.dem || 'NULL'},
                '${loc.feature_code}', ${loc.latitude}, ${loc.longitude}, false
            );`);
        }
    }
}

async function main() {
    try {
        // Lokasyon verilerini oku
        console.log('Lokasyon verileri okunuyor...');
        const locationsPath = path.join(__dirname, '../data/locations.json');
        const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
        
        // Geonames verilerini oku
        console.log('Geonames verileri okunuyor...');
        const geonamesPath = path.join(__dirname, '../data/geonames_locations.json');
        const geonamesData: GeonamesData = JSON.parse(fs.readFileSync(geonamesPath, 'utf8'));
        
        let mappings: string[] = [];
        
        // İlleri eşleştir
        console.log('\nİller eşleştiriliyor...');
        for (const province of locationsData.provinces) {
            const match = findBestMatch(province, geonamesData.provinces);
            if (match) {
                totalMatches++;
                usedGeonamesIds.add(match.geonameid);
                mappings.push(`INSERT INTO location_mappings (
                    geonames_id, our_id, location_type, geonames_code, our_code, 
                    geonames_name, our_name, population, elevation, dem, feature_code,
                    latitude, longitude, is_matched
                ) VALUES (
                    ${match.geonameid}, gen_random_uuid(), 'province_${match.geonameid}', 
                    '${match.admin1_code}', '${province.code}', 
                    '${match.name.replace(/'/g, "''")}', '${province.name.replace(/'/g, "''")}',
                    ${match.population || 'NULL'}, ${match.elevation || 'NULL'}, ${match.dem || 'NULL'},
                    '${match.feature_code}', ${match.latitude}, ${match.longitude}, true
                );`);
            }
        }
        
        // İlçeleri eşleştir
        console.log('\nİlçeler eşleştiriliyor...');
        for (const district of locationsData.districts) {
            const match = findBestMatch(district, geonamesData.districts);
            if (match) {
                totalMatches++;
                usedGeonamesIds.add(match.geonameid);
                mappings.push(`INSERT INTO location_mappings (
                    geonames_id, our_id, location_type, geonames_code, our_code, 
                    geonames_name, our_name, population, elevation, dem, feature_code,
                    latitude, longitude, is_matched
                ) VALUES (
                    ${match.geonameid}, gen_random_uuid(), 'district_${match.geonameid}', 
                    '${match.admin2_code}', '${district.code}', 
                    '${match.name.replace(/'/g, "''")}', '${district.name.replace(/'/g, "''")}',
                    ${match.population || 'NULL'}, ${match.elevation || 'NULL'}, ${match.dem || 'NULL'},
                    '${match.feature_code}', ${match.latitude}, ${match.longitude}, true
                );`);
            }
        }
        
        // Kasabaları eşleştir
        console.log('\nKasabalar eşleştiriliyor...');
        for (const town of locationsData.towns) {
            const match = findBestMatch(town, geonamesData.towns);
            if (match) {
                totalMatches++;
                usedGeonamesIds.add(match.geonameid);
                mappings.push(`INSERT INTO location_mappings (
                    geonames_id, our_id, location_type, geonames_code, our_code, 
                    geonames_name, our_name, population, elevation, dem, feature_code,
                    latitude, longitude, is_matched
                ) VALUES (
                    ${match.geonameid}, gen_random_uuid(), 'town_${match.geonameid}', 
                    '${match.feature_code}', '${town.code}', 
                    '${match.name.replace(/'/g, "''")}', '${town.name.replace(/'/g, "''")}',
                    ${match.population || 'NULL'}, ${match.elevation || 'NULL'}, ${match.dem || 'NULL'},
                    '${match.feature_code}', ${match.latitude}, ${match.longitude}, true
                );`);
            }
        }

        // Eşleşmeyen kayıtları ekle
        console.log('\nEşleşmeyen kayıtlar ekleniyor...');
        addUnmatchedLocations(geonamesData.provinces, 'province', mappings);
        addUnmatchedLocations(geonamesData.districts, 'district', mappings);
        addUnmatchedLocations(geonamesData.towns, 'town', mappings);
        
        // SQL dosyasını oluştur
        const sqlPath = path.join(__dirname, '../prisma/migrations/20250530_insert_mappings/migration.sql');
        fs.writeFileSync(sqlPath, mappings.join('\n'));
        
        console.log(`\nToplam ${totalMatches} eşleştirme yapıldı`);
        console.log(`Toplam ${totalUnmatched} eşleşmeyen kayıt eklendi`);
        console.log(`Veriler ${sqlPath} dosyasına kaydedildi.`);
        
    } catch (error) {
        console.error('Hata:', error);
    }
}

main(); 