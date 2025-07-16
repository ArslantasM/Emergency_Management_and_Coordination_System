import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// BigInt'i JSON'a serialize etmek için helper
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInt(value);
    }
    return result;
  }
  
  return obj;
}

// Bölge listesi - Yeni Global Coğrafi Yapı
export async function GET() {
  try {
    console.log('🔍 Regions API çağrıldı');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('❌ Oturum bulunamadı');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    console.log('✅ Oturum doğrulandı:', session.user?.email);

    // Tüm ülkeleri al
    console.log('🌍 Ülkeler getiriliyor...');
    const countries = await prisma.country.findMany({
      include: {
        cities: {
          include: {
            districts: {
              include: {
                towns: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Bulunan ülke sayısı: ${countries.length}`);
    countries.forEach(country => {
      console.log(`  - ${country.name} (${country.cities.length} şehir)`);
    });

    // Acil durum bölgelerini al
    console.log('🗺️ Acil durum bölgeleri getiriliyor...');
    const emergencyRegions = await prisma.region.findMany({
      include: {
        countries: {
          include: {
            country: true
          }
        },
        cities: {
          include: {
            city: true
          }
        },
        districts: {
          include: {
            district: true
          }
        },
        towns: {
          include: {
            town: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Acil durum bölgesi sayısı: ${emergencyRegions.length}`);
    emergencyRegions.forEach(region => {
      console.log(`  - ${region.name}:`);
      console.log(`    * Countries: ${region.countries.length}`);
      console.log(`    * Cities: ${region.cities.length}`);
      console.log(`    * Districts: ${region.districts.length}`);
      console.log(`    * Towns: ${region.towns.length}`);
    });

    // Verileri ağaç yapısına dönüştür
    const treeData = countries.map(country => ({
      title: `${country.name} (${country.iso2})`,
      value: `country-${country.id}`,
      key: `country-${country.id}`,
      type: 'country',
      population: country.population ? country.population.toString() : null,
      children: country.cities.map(city => ({
        title: `${city.name} (${city.population ? Number(city.population).toLocaleString() : 'N/A'})`,
        value: `city-${city.id}`,
        key: `city-${city.id}`,
        type: 'city',
        population: city.population ? city.population.toString() : null,
        children: city.districts.map(district => ({
          title: `${district.name} (${district.population ? Number(district.population).toLocaleString() : 'N/A'})`,
          value: `district-${district.id}`,
          key: `district-${district.id}`,
          type: 'district',
          population: district.population ? district.population.toString() : null,
          children: district.towns.map(town => ({
            title: `${town.name} (${town.population ? Number(town.population).toLocaleString() : 'N/A'})`,
            value: `town-${town.id}`,
            key: `town-${town.id}`,
            type: 'town',
            population: town.population ? town.population.toString() : null,
          }))
        }))
      }))
    }));

    console.log('🌳 TreeData oluşturuldu, toplam ülke:', treeData.length);

    // Acil durum bölgelerini hazırla
    const regionsWithBoundaries = emergencyRegions.map(region => {
      // Seçilen lokasyonları TreeSelect formatında hazırla
      const locations = [];
      
      // Ülkeleri ekle
      region.countries.forEach(rc => {
        locations.push(`country-${rc.country.id}`);
      });
      
      // Şehirleri ekle
      region.cities.forEach(rc => {
        locations.push(`city-${rc.city.id}`);
      });
      
      // İlçeleri ekle
      region.districts.forEach(rd => {
        locations.push(`district-${rd.district.id}`);
      });
      
      // Kasabaları ekle
      region.towns.forEach(rt => {
        locations.push(`town-${rt.town.id}`);
      });
      
      console.log(`🗺️ Bölge: ${region.name}, Lokasyonlar: ${locations.length}`, locations);
      
      return {
        id: region.id,
        name: region.name,
        description: region.description,
        region_type: region.region_type,
        emergency_level: region.emergency_level,
        status: region.status,
        color: region.color, // Yeni eklenen color alanı
        total_population: region.total_population ? region.total_population.toString() : null,
        total_area_sqkm: region.total_area_sqkm,
        locations: locations, // TreeSelect için gerekli format
        countries: region.countries.map(rc => rc.country.name),
        cities: region.cities.map(rc => rc.city.name),
        districts: region.districts.map(rd => rd.district.name),
        towns: region.towns.map(rt => rt.town.name)
      };
    });

    console.log(`📊 Hazırlanan bölge sayısı: ${regionsWithBoundaries.length}`);
    regionsWithBoundaries.forEach(region => {
      console.log(`  - ${region.name}: ${region.locations.length} lokasyon`);
    });

    const response = {
      treeData,
      regions: regionsWithBoundaries,
      countries: countries.map(c => ({
        id: c.id,
        name: c.name,
        code: c.iso2,
        population: c.population ? c.population.toString() : null,
        area_sqkm: c.area_sqkm
      })),
      stats: {
        totalCountries: countries.length,
        totalCities: countries.reduce((sum, c) => sum + c.cities.length, 0),
        totalDistricts: countries.reduce((sum, c) => sum + c.cities.reduce((s, city) => s + city.districts.length, 0), 0),
        totalTowns: countries.reduce((sum, c) => sum + c.cities.reduce((s, city) => s + city.districts.reduce((s2, district) => s2 + district.towns.length, 0), 0), 0),
        totalRegions: emergencyRegions.length
      }
    };

    console.log('✅ API yanıtı hazırlandı');
    console.log('📊 İstatistikler:', response.stats);
    
    // BigInt'leri serialize et
    const serializedResponse = serializeBigInt(response);
    
    return NextResponse.json(serializedResponse);
  } catch (error) {
    console.error('❌ Regions API hatası:', error);
    return NextResponse.json({ error: 'Bölgeler alınamadı' }, { status: 500 });
  }
}

// Yeni bölge oluşturma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const data = await request.json();
    console.log('🔄 Yeni bölge oluşturuluyor:', data);

    // Seçilen lokasyonları işle
    const selectedLocations = data.locations || [];
    
    // Yeni acil durum bölgesini oluştur
    const region = await prisma.region.create({
      data: {
        name: data.name,
        description: data.description,
        region_type: data.region_type || 'emergency',
        emergency_level: data.emergency_level || 'MEDIUM',
        status: 'ACTIVE',
        // Color alanını ekle (eğer varsa)
        ...(data.color && { color: data.color })
      }
    });

    console.log('✅ Bölge oluşturuldu:', region.name);

    // Seçilen lokasyonları bölgeye bağla
    for (const location of selectedLocations) {
      const [type, id] = location.split('-');
      
      try {
        switch (type) {
          case 'country':
            await prisma.regionCountry.create({
              data: {
                region_id: region.id,
                country_id: id
              }
            });
            console.log(`  - Ülke bağlandı: ${id}`);
            break;
            
          case 'city':
            await prisma.regionCity.create({
              data: {
                region_id: region.id,
                city_id: id
              }
            });
            console.log(`  - Şehir bağlandı: ${id}`);
            break;
            
          case 'district':
            await prisma.regionDistrict.create({
              data: {
                region_id: region.id,
                district_id: id
              }
            });
            console.log(`  - İlçe bağlandı: ${id}`);
            break;
            
          case 'town':
            await prisma.regionTown.create({
              data: {
                region_id: region.id,
                town_id: id
              }
            });
            console.log(`  - Kasaba bağlandı: ${id}`);
            break;
        }
      } catch (error) {
        console.warn(`⚠️ ${type} bağlanırken hata:`, error.message);
      }
    }

    // Bölge istatistiklerini hesapla
    await updateRegionStats(region.id);

    console.log('✅ Bölge başarıyla oluşturuldu');
    return NextResponse.json(region);
  } catch (error) {
    console.error('❌ Bölge oluşturulurken hata:', error);
    return NextResponse.json({ error: 'Bölge oluşturulamadı' }, { status: 500 });
  }
}

// Bölge istatistiklerini güncelle
async function updateRegionStats(regionId: string) {
  try {
    const region = await prisma.region.findUnique({
      where: { id: regionId },
      include: {
        countries: {
          include: { country: true }
        },
        cities: {
          include: { city: true }
        },
        districts: {
          include: { district: true }
        },
        towns: {
          include: { town: true }
        }
      }
    });

    if (!region) return;

    // Toplam nüfus hesapla
    let totalPopulation = 0;
    let totalArea = 0;

    region.countries.forEach(rc => {
      totalPopulation += Number(rc.country.population || 0);
      totalArea += Number(rc.country.area_sqkm || 0);
    });

    region.cities.forEach(rc => {
      totalPopulation += Number(rc.city.population || 0);
      totalArea += Number(rc.city.area_sqkm || 0);
    });

    region.districts.forEach(rd => {
      totalPopulation += Number(rd.district.population || 0);
      totalArea += Number(rd.district.area_sqkm || 0);
    });

    region.towns.forEach(rt => {
      totalPopulation += Number(rt.town.population || 0);
      totalArea += Number(rt.town.area_sqkm || 0);
    });

    // Bölge istatistiklerini güncelle
    await prisma.region.update({
      where: { id: regionId },
      data: {
        total_population: BigInt(totalPopulation),
        total_area_sqkm: totalArea
      }
    });

    console.log(`📊 Bölge istatistikleri güncellendi: ${totalPopulation.toLocaleString()} nüfus, ${totalArea.toFixed(2)} km²`);
  } catch (error) {
    console.error('❌ Bölge istatistikleri güncellenirken hata:', error);
  }
} 