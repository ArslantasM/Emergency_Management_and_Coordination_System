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

function parseSQLFile(filePath: string): Location[] {
    console.log('SQL dosyası okunuyor:', filePath);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('SQL dosyası okundu, uzunluk:', sql.length);
    
    const locations: Location[] = [];
    
    // SQL dosyasını satır satır oku
    const lines = sql.split('\n');
    console.log('Toplam satır sayısı:', lines.length);
    
    let insertCount = 0;
    let currentTable = '';
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Tablo adını bul
        if (trimmedLine.startsWith('CREATE TABLE')) {
            const tableMatch = trimmedLine.match(/CREATE TABLE `([^`]+)`/i);
            if (tableMatch) {
                currentTable = tableMatch[1].toLowerCase();
                console.log('Tablo bulundu:', currentTable);
            }
            continue;
        }
        
        // INSERT INTO satırlarını bul
        if (trimmedLine.startsWith('INSERT INTO')) {
            insertCount++;
            
            try {
                // Değerleri çıkar
                const valuesMatch = trimmedLine.match(/VALUES\s*(\(.*\))/i);
                if (!valuesMatch) continue;
                
                // Parantez içindeki değerleri ayır
                const valueGroups = valuesMatch[1].match(/\(([^)]+)\)/g);
                if (!valueGroups) continue;
                
                for (const group of valueGroups) {
                    const values = group
                        .slice(1, -1) // Parantezleri kaldır
                        .split(',')
                        .map(v => v.trim().replace(/^['"]|['"]$/g, '')); // Tırnak işaretlerini kaldır
                    
                    let type: 'province' | 'district' | 'town';
                    if (currentTable.includes('il')) {
                        type = 'province';
                    } else if (currentTable.includes('ilce')) {
                        type = 'district';
                    } else if (currentTable.includes('kasaba') || currentTable.includes('belde')) {
                        type = 'town';
                    } else {
                        continue;
                    }
                    
                    // Temel alanları çıkar
                    const id = values[0];
                    const name = values[1];
                    const code = values[2] || '';
                    
                    // Parent ID'yi çıkar
                    const parentId = values[3] && values[3] !== 'NULL' ? values[3] : undefined;
                    
                    // Koordinatları çıkar
                    let coordinates;
                    if (values[4] && values[5] && values[4] !== 'NULL' && values[5] !== 'NULL') {
                        const lat = parseFloat(values[4]);
                        const lon = parseFloat(values[5]);
                        if (!isNaN(lat) && !isNaN(lon)) {
                            coordinates = { latitude: lat, longitude: lon };
                        }
                    }
                    
                    locations.push({
                        id,
                        name,
                        code,
                        type,
                        ...(parentId && { parent_id: parentId }),
                        ...(coordinates && { coordinates })
                    });
                }
                
            } catch (error) {
                console.error('Satır işlenirken hata:', trimmedLine.substring(0, 100) + '...');
                console.error('Hata detayı:', error);
            }
        }
    }
    
    console.log('Bulunan INSERT satırı sayısı:', insertCount);
    console.log('İşlenen lokasyon sayısı:', locations.length);
    
    return locations;
}

async function main() {
    try {
        // SQL dosyasını oku
        const sqlFilePath = path.join(__dirname, '../emergency-management-Backup 22052025/Türkiye_mulki_idare/24_Eylul_2017_Tek_Dosya.sql');
        const locations = parseSQLFile(sqlFilePath);
        
        // Lokasyonları tipine göre grupla
        const provinces = locations.filter(l => l.type === 'province');
        const districts = locations.filter(l => l.type === 'district');
        const towns = locations.filter(l => l.type === 'town');
        
        console.log('\nToplam kayıt sayıları:');
        console.log('- İl:', provinces.length);
        console.log('- İlçe:', districts.length);
        console.log('- Kasaba:', towns.length);
        
        // JSON dosyasını oluştur
        const jsonFilePath = path.join(__dirname, '../data/locations.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify({
            provinces,
            districts,
            towns
        }, null, 2));
        
        console.log(`\nVeriler ${jsonFilePath} dosyasına kaydedildi.`);
        
    } catch (error) {
        console.error('Hata:', error);
    }
}

main(); 