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

interface LocationData {
    provinces: Location[];
    districts: Location[];
    towns: Location[];
}

async function main() {
    try {
        const baseDir = path.join(__dirname, '../emergency-management-Backup 22052025/Türkiye_mulki_idare');
        
        // İlleri oku
        console.log('İller okunuyor...');
        const provincesJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'provinces.json'), 'utf8'));
        const provinces: Location[] = provincesJson.map((p: any) => ({
            id: p.id || String(p.plate),
            name: p.name,
            code: String(p.plate),
            type: 'province',
            coordinates: p.coordinates ? {
                latitude: p.coordinates.lat,
                longitude: p.coordinates.lon
            } : undefined
        }));
        
        // İlçeleri oku
        console.log('İlçeler okunuyor...');
        const districtsJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'districts.json'), 'utf8'));
        const districts: Location[] = districtsJson.map((d: any) => ({
            id: d.id || `${d.province_id}_${d.name}`,
            name: d.name,
            code: d.code || `${d.province_id}_${d.name}`,
            type: 'district',
            parent_id: d.province_id,
            coordinates: d.coordinates ? {
                latitude: d.coordinates.lat,
                longitude: d.coordinates.lon
            } : undefined
        }));
        
        // Kasabaları oku
        console.log('Kasabalar okunuyor...');
        const townsJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'towns.json'), 'utf8'));
        const towns: Location[] = townsJson.map((t: any) => ({
            id: t.id || `${t.district_id}_${t.name}`,
            name: t.name,
            code: t.code || `${t.district_id}_${t.name}`,
            type: 'town',
            parent_id: t.district_id,
            coordinates: t.coordinates ? {
                latitude: t.coordinates.lat,
                longitude: t.coordinates.lon
            } : undefined
        }));
        
        // İstatistikleri göster
        console.log('\nToplam kayıt sayıları:');
        console.log('- İl:', provinces.length);
        console.log('- İlçe:', districts.length);
        console.log('- Kasaba:', towns.length);
        
        // JSON dosyasını oluştur
        const outputPath = path.join(__dirname, '../data/locations.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            provinces,
            districts,
            towns
        }, null, 2));
        
        console.log(`\nVeriler ${outputPath} dosyasına kaydedildi.`);
        
    } catch (error) {
        console.error('Hata:', error);
    }
}

main(); 