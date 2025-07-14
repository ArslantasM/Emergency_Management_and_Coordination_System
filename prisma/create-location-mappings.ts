import { PrismaClient } from '@prisma/client';
import { Database } from 'sqlite3';
import { promisify } from 'util';

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
    elevation: number;
    dem: number;
}

interface Location {
    id: string;
    name: string;
    code: string;
}

async function main() {
    const prisma = new PrismaClient();
    const db = new Database('data/locations.db');
    const dbAll = promisify(db.all.bind(db));

    try {
        // İlleri eşleştir
        console.log('\nİller eşleştiriliyor...');
        const provinces = await dbAll(`
            SELECT * FROM locations 
            WHERE country_code = 'TR' 
            AND feature_class = 'A' 
            AND feature_code = 'ADM1'
        `) as GeonamesLocation[];

        for (const location of provinces) {
            try {
                // İsim bazlı eşleştirme
                const province = await prisma.$queryRaw<Location[]>`
                    SELECT id::text, name, code FROM "Province"
                    WHERE normalize_location_name(name) = normalize_location_name(${location.name})
                    OR normalize_location_name(name) = normalize_location_name(${location.asciiname})
                    OR ${location.alternatenames} LIKE '%' || normalize_location_name(name) || '%'
                    LIMIT 1
                `;

                if (province[0]) {
                    await prisma.$executeRaw`
                        INSERT INTO location_mappings (
                            geonames_id, our_id, location_type,
                            geonames_code, our_code,
                            geonames_name, our_name
                        ) VALUES (
                            ${location.geonameid}, ${province[0].id}::uuid, 'province',
                            ${location.admin1_code}, ${province[0].code},
                            ${location.name}, ${province[0].name}
                        )
                        ON CONFLICT (geonames_id, location_type) DO UPDATE
                        SET our_id = EXCLUDED.our_id,
                            geonames_code = EXCLUDED.geonames_code,
                            our_code = EXCLUDED.our_code
                    `;
                    console.log(`✓ ${location.name} ili eşleştirildi.`);
                } else {
                    console.log(`! ${location.name} ili için eşleşme bulunamadı.`);
                }
            } catch (error) {
                console.error(`! ${location.name} ili eşleştirilirken hata:`, error);
            }
        }

        // İlçeleri eşleştir
        console.log('\nİlçeler eşleştiriliyor...');
        const districts = await dbAll(`
            SELECT * FROM locations 
            WHERE country_code = 'TR' 
            AND feature_class = 'A' 
            AND feature_code = 'ADM2'
        `) as GeonamesLocation[];

        for (const location of districts) {
            try {
                // İsim ve il bazlı eşleştirme
                const district = await prisma.$queryRaw<Location[]>`
                    SELECT d.id::text, d.name, d.code FROM "District" d
                    JOIN "Province" p ON d.province_id = p.id
                    JOIN location_mappings lm ON lm.our_id = p.id
                    WHERE (
                        normalize_location_name(d.name) = normalize_location_name(${location.name})
                        OR normalize_location_name(d.name) = normalize_location_name(${location.asciiname})
                        OR ${location.alternatenames} LIKE '%' || normalize_location_name(d.name) || '%'
                    )
                    AND lm.geonames_code = ${location.admin1_code}
                    AND lm.location_type = 'province'
                    LIMIT 1
                `;

                if (district[0]) {
                    await prisma.$executeRaw`
                        INSERT INTO location_mappings (
                            geonames_id, our_id, location_type,
                            geonames_code, our_code,
                            geonames_name, our_name
                        ) VALUES (
                            ${location.geonameid}, ${district[0].id}::uuid, 'district',
                            ${location.admin2_code}, ${district[0].code},
                            ${location.name}, ${district[0].name}
                        )
                        ON CONFLICT (geonames_id, location_type) DO UPDATE
                        SET our_id = EXCLUDED.our_id,
                            geonames_code = EXCLUDED.geonames_code,
                            our_code = EXCLUDED.our_code
                    `;
                    console.log(`✓ ${location.name} ilçesi eşleştirildi.`);
                } else {
                    // Koordinat bazlı eşleştirmeyi dene
                    const nearbyDistrict = await prisma.$queryRaw<Location[]>`
                        SELECT d.id::text, d.name, d.code FROM "District" d
                        JOIN "Province" p ON d.province_id = p.id
                        JOIN location_mappings lm ON lm.our_id = p.id
                        WHERE lm.geonames_code = ${location.admin1_code}
                        AND lm.location_type = 'province'
                        AND d.coordinates IS NOT NULL
                        AND calculate_distance(
                            ST_Y(d.coordinates::geometry),
                            ST_X(d.coordinates::geometry),
                            ${location.latitude},
                            ${location.longitude}
                        ) < 10 -- 10km içindeki ilçeleri bul
                        ORDER BY calculate_distance(
                            ST_Y(d.coordinates::geometry),
                            ST_X(d.coordinates::geometry),
                            ${location.latitude},
                            ${location.longitude}
                        )
                        LIMIT 1
                    `;

                    if (nearbyDistrict[0]) {
                        await prisma.$executeRaw`
                            INSERT INTO location_mappings (
                                geonames_id, our_id, location_type,
                                geonames_code, our_code,
                                geonames_name, our_name
                            ) VALUES (
                                ${location.geonameid}, ${nearbyDistrict[0].id}::uuid, 'district',
                                ${location.admin2_code}, ${nearbyDistrict[0].code},
                                ${location.name}, ${nearbyDistrict[0].name}
                            )
                            ON CONFLICT (geonames_id, location_type) DO UPDATE
                            SET our_id = EXCLUDED.our_id,
                                geonames_code = EXCLUDED.geonames_code,
                                our_code = EXCLUDED.our_code
                        `;
                        console.log(`✓ ${location.name} ilçesi koordinat bazlı eşleştirildi.`);
                    } else {
                        console.log(`! ${location.name} ilçesi için eşleşme bulunamadı.`);
                    }
                }
            } catch (error) {
                console.error(`! ${location.name} ilçesi eşleştirilirken hata:`, error);
            }
        }

        // Kasabaları eşleştir
        console.log('\nKasabalar eşleştiriliyor...');
        const towns = await dbAll(`
            SELECT * FROM locations 
            WHERE country_code = 'TR' 
            AND feature_class = 'P' 
            AND feature_code IN ('PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4')
            AND admin2_code IS NOT NULL
        `) as GeonamesLocation[];

        for (const location of towns) {
            try {
                // İsim ve ilçe bazlı eşleştirme
                const town = await prisma.$queryRaw<Location[]>`
                    SELECT t.id::text, t.name, t.code FROM "Town" t
                    JOIN "District" d ON t.district_id = d.id
                    JOIN location_mappings lm ON lm.our_id = d.id
                    WHERE (
                        normalize_location_name(t.name) = normalize_location_name(${location.name})
                        OR normalize_location_name(t.name) = normalize_location_name(${location.asciiname})
                        OR ${location.alternatenames} LIKE '%' || normalize_location_name(t.name) || '%'
                    )
                    AND lm.geonames_code = ${location.admin2_code}
                    AND lm.location_type = 'district'
                    LIMIT 1
                `;

                if (town[0]) {
                    await prisma.$executeRaw`
                        INSERT INTO location_mappings (
                            geonames_id, our_id, location_type,
                            geonames_code, our_code,
                            geonames_name, our_name
                        ) VALUES (
                            ${location.geonameid}, ${town[0].id}::uuid, 'town',
                            NULL, ${town[0].code},
                            ${location.name}, ${town[0].name}
                        )
                        ON CONFLICT (geonames_id, location_type) DO UPDATE
                        SET our_id = EXCLUDED.our_id,
                            geonames_code = EXCLUDED.geonames_code,
                            our_code = EXCLUDED.our_code
                    `;
                    console.log(`✓ ${location.name} kasabası eşleştirildi.`);
                } else {
                    // Koordinat bazlı eşleştirmeyi dene
                    const nearbyTown = await prisma.$queryRaw<Location[]>`
                        SELECT t.id::text, t.name, t.code FROM "Town" t
                        JOIN "District" d ON t.district_id = d.id
                        JOIN location_mappings lm ON lm.our_id = d.id
                        WHERE lm.geonames_code = ${location.admin2_code}
                        AND lm.location_type = 'district'
                        AND t.coordinates IS NOT NULL
                        AND calculate_distance(
                            ST_Y(t.coordinates::geometry),
                            ST_X(t.coordinates::geometry),
                            ${location.latitude},
                            ${location.longitude}
                        ) < 5 -- 5km içindeki kasabaları bul
                        ORDER BY calculate_distance(
                            ST_Y(t.coordinates::geometry),
                            ST_X(t.coordinates::geometry),
                            ${location.latitude},
                            ${location.longitude}
                        )
                        LIMIT 1
                    `;

                    if (nearbyTown[0]) {
                        await prisma.$executeRaw`
                            INSERT INTO location_mappings (
                                geonames_id, our_id, location_type,
                                geonames_code, our_code,
                                geonames_name, our_name
                            ) VALUES (
                                ${location.geonameid}, ${nearbyTown[0].id}::uuid, 'town',
                                NULL, ${nearbyTown[0].code},
                                ${location.name}, ${nearbyTown[0].name}
                            )
                            ON CONFLICT (geonames_id, location_type) DO UPDATE
                            SET our_id = EXCLUDED.our_id,
                                geonames_code = EXCLUDED.geonames_code,
                                our_code = EXCLUDED.our_code
                        `;
                        console.log(`✓ ${location.name} kasabası koordinat bazlı eşleştirildi.`);
                    } else {
                        console.log(`! ${location.name} kasabası için eşleşme bulunamadı.`);
                    }
                }
            } catch (error) {
                console.error(`! ${location.name} kasabası eşleştirilirken hata:`, error);
            }
        }

        // Eşleştirme istatistiklerini göster
        const stats = await prisma.$queryRaw<{ location_type: string; count: number }[]>`
            SELECT location_type, COUNT(*) as count
            FROM location_mappings
            GROUP BY location_type
            ORDER BY location_type
        `;

        console.log('\nEşleştirme İstatistikleri:');
        console.log(stats);

    } catch (error) {
        console.error('Eşleştirme işlemi sırasında hata:', error);
    } finally {
        await prisma.$disconnect();
        db.close();
    }
}

main(); 