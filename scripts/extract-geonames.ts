import { Database } from 'sqlite3';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

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

async function main() {
    const db = new Database(path.join(__dirname, '../emergency-management-Backup 22052025/Yeni klasör/data/geonames.db'));
    const dbAll = promisify(db.all.bind(db));

    const data: GeonamesData = {
        provinces: [],
        districts: [],
        towns: []
    };

    try {
        // İlleri çek (ADM1)
        console.log('İller çekiliyor...');
        const provinces = await dbAll(`
            SELECT *
            FROM locations
            WHERE country_code = 'TR'
            AND (feature_code = 'ADM1' OR feature_code LIKE 'PPL%')
            AND admin1_code IS NOT NULL
        `) as GeonamesLocation[];
        data.provinces = provinces;

        // İlçeleri çek (ADM2)
        console.log('İlçeler çekiliyor...');
        const districts = await dbAll(`
            SELECT *
            FROM locations
            WHERE country_code = 'TR'
            AND (feature_code = 'ADM2' OR feature_code LIKE 'PPL%')
            AND admin2_code IS NOT NULL
        `) as GeonamesLocation[];
        data.districts = districts;

        // Kasabaları çek (ADM3 ve PPL*)
        console.log('Kasabalar çekiliyor...');
        const towns = await dbAll(`
            SELECT *
            FROM locations
            WHERE country_code = 'TR'
            AND (
                feature_code = 'ADM3'
                OR feature_code LIKE 'PPL%'
                OR feature_code = 'PPLA'
                OR feature_code = 'PPLA2'
                OR feature_code = 'PPLA3'
                OR feature_code = 'PPLA4'
            )
        `) as GeonamesLocation[];
        data.towns = towns;

        // Sonuçları JSON olarak kaydet
        const outputPath = path.join(__dirname, '../data/geonames_locations.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Veriler ${outputPath} dosyasına kaydedildi.`);

        console.log(`Toplam kayıt sayıları:
- İl: ${data.provinces.length}
- İlçe: ${data.districts.length}
- Kasaba: ${data.towns.length}`);

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        db.close();
    }
}

main(); 