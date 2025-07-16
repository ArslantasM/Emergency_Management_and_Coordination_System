import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TreeSelect için hierarchical veri formatı
interface TreeSelectNode {
  value: string;
  title: string;
  key: string;
  children?: TreeSelectNode[];
  isLeaf?: boolean;
  type: 'country' | 'city' | 'district' | 'town';
  population?: number;
  area?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'tree'; // tree, flat, region
    const regionId = searchParams.get('regionId');
    const search = searchParams.get('search');

    switch (format) {
      case 'tree':
        return await getTreeStructure(search);
      case 'flat':
        return await getFlatStructure(search);
      case 'region':
        return await getRegionGeography(regionId);
      default:
        return await getTreeStructure(search);
    }
  } catch (error) {
    console.error('Global geography API error:', error);
    return NextResponse.json(
      { error: 'Coğrafi veriler alınamadı' },
      { status: 500 }
    );
  }
}

// TreeSelect için hierarchical yapı
async function getTreeStructure(search?: string | null): Promise<NextResponse> {
  const whereClause = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { asciiname: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {};

  // Ülkeleri al
  const countries = await prisma.country.findMany({
    where: whereClause,
    include: {
      cities: {
        where: search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { asciiname: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        include: {
          districts: {
            where: search ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { asciiname: { contains: search, mode: 'insensitive' as const } }
              ]
            } : {},
            include: {
              towns: {
                where: search ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { asciiname: { contains: search, mode: 'insensitive' as const } }
                  ]
                } : {},
                take: 50 // Performans için sınırla
              }
            },
            take: 100 // Performans için sınırla
          }
        },
        take: 50 // Performans için sınırla
      }
    },
    orderBy: { name: 'asc' }
  });

  // TreeSelect formatına dönüştür
  const treeData: TreeSelectNode[] = countries.map(country => ({
    value: `country-${country.id}`,
    title: `🌍 ${country.name}${country.population ? ` (${formatNumber(Number(country.population))})` : ''}`,
    key: `country-${country.id}`,
    type: 'country',
    population: country.population ? Number(country.population) : undefined,
    area: country.area_sqkm || undefined,
    coordinates: country.latitude && country.longitude ? {
      lat: country.latitude,
      lng: country.longitude
    } : undefined,
    children: country.cities.map(city => ({
      value: `city-${city.id}`,
      title: `🏙️ ${city.name}${city.population ? ` (${formatNumber(Number(city.population))})` : ''}`,
      key: `city-${city.id}`,
      type: 'city',
      population: city.population ? Number(city.population) : undefined,
      area: city.area_sqkm || undefined,
      coordinates: city.latitude && city.longitude ? {
        lat: city.latitude,
        lng: city.longitude
      } : undefined,
      children: city.districts.map(district => ({
        value: `district-${district.id}`,
        title: `🏘️ ${district.name}${district.population ? ` (${formatNumber(Number(district.population))})` : ''}`,
        key: `district-${district.id}`,
        type: 'district',
        population: district.population ? Number(district.population) : undefined,
        area: district.area_sqkm || undefined,
        coordinates: district.latitude && district.longitude ? {
          lat: district.latitude,
          lng: district.longitude
        } : undefined,
        children: district.towns.map(town => ({
          value: `town-${town.id}`,
          title: `🏠 ${town.name}${town.population ? ` (${formatNumber(Number(town.population))})` : ''}`,
          key: `town-${town.id}`,
          type: 'town',
          population: town.population ? Number(town.population) : undefined,
          area: town.area_sqkm || undefined,
          coordinates: town.latitude && town.longitude ? {
            lat: town.latitude,
            lng: town.longitude
          } : undefined,
          isLeaf: true
        })),
        isLeaf: district.towns.length === 0
      })),
      isLeaf: city.districts.length === 0
    })),
    isLeaf: country.cities.length === 0
  }));

  return NextResponse.json({
    success: true,
    data: treeData,
    format: 'tree',
    total: countries.length
  });
}

// Düz liste formatı
async function getFlatStructure(search?: string | null): Promise<NextResponse> {
  const whereClause = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { asciiname: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {};

  const [countries, cities, districts, towns] = await Promise.all([
    prisma.country.findMany({ where: whereClause, take: 20 }),
    prisma.city.findMany({ where: whereClause, include: { country: true }, take: 50 }),
    prisma.district.findMany({ where: whereClause, include: { country: true, city: true }, take: 100 }),
    prisma.town.findMany({ where: whereClause, include: { country: true, city: true, district: true }, take: 200 })
  ]);

  const flatData = [
    ...countries.map(item => ({
      id: item.id,
      value: `country-${item.id}`,
      label: `🌍 ${item.name}`,
      type: 'country',
      population: item.population ? Number(item.population) : null,
      area: item.area_sqkm,
      path: [item.name]
    })),
    ...cities.map(item => ({
      id: item.id,
      value: `city-${item.id}`,
      label: `🏙️ ${item.name}`,
      type: 'city',
      population: item.population ? Number(item.population) : null,
      area: item.area_sqkm,
      path: [item.country.name, item.name]
    })),
    ...districts.map(item => ({
      id: item.id,
      value: `district-${item.id}`,
      label: `🏘️ ${item.name}`,
      type: 'district',
      population: item.population ? Number(item.population) : null,
      area: item.area_sqkm,
      path: [item.country.name, item.city.name, item.name]
    })),
    ...towns.map(item => ({
      id: item.id,
      value: `town-${item.id}`,
      label: `🏠 ${item.name}`,
      type: 'town',
      population: item.population ? Number(item.population) : null,
      area: item.area_sqkm,
      path: [item.country.name, item.city.name, item.district.name, item.name]
    }))
  ];

  return NextResponse.json({
    success: true,
    data: flatData,
    format: 'flat',
    total: flatData.length
  });
}

// Belirli bir bölgenin coğrafi yapısı
async function getRegionGeography(regionId?: string | null): Promise<NextResponse> {
  if (!regionId) {
    return NextResponse.json({ error: 'Region ID gerekli' }, { status: 400 });
  }

  const region = await prisma.region.findUnique({
    where: { id: regionId },
    include: {
      countries: {
        include: {
          country: {
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
            }
          }
        }
      },
      cities: {
        include: {
          city: {
            include: {
              country: true,
              districts: {
                include: {
                  towns: true
                }
              }
            }
          }
        }
      },
      districts: {
        include: {
          district: {
            include: {
              country: true,
              city: true,
              towns: true
            }
          }
        }
      },
      towns: {
        include: {
          town: {
            include: {
              country: true,
              city: true,
              district: true
            }
          }
        }
      }
    }
  });

  if (!region) {
    return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      region: {
        id: region.id,
        name: region.name,
        description: region.description,
        total_population: region.total_population ? Number(region.total_population) : null,
        total_area_sqkm: region.total_area_sqkm,
        center_coordinates: region.center_latitude && region.center_longitude ? {
          lat: region.center_latitude,
          lng: region.center_longitude
        } : null
      },
      geography: {
        countries: region.countries.map(rc => rc.country),
        cities: region.cities.map(rc => rc.city),
        districts: region.districts.map(rd => rd.district),
        towns: region.towns.map(rt => rt.town)
      }
    },
    format: 'region'
  });
}

// POST - Yeni bölge oluştur veya güncelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { regionData, selectedGeography } = body;

    // Bölgeyi oluştur veya güncelle
    const region = await prisma.region.upsert({
      where: { id: regionData.id || 'new' },
      update: {
        name: regionData.name,
        description: regionData.description,
        region_type: regionData.region_type || 'emergency',
        emergency_level: regionData.emergency_level,
        status: regionData.status || 'ACTIVE'
      },
      create: {
        name: regionData.name,
        description: regionData.description,
        region_type: regionData.region_type || 'emergency',
        emergency_level: regionData.emergency_level,
        status: regionData.status || 'ACTIVE'
      }
    });

    // Mevcut coğrafi bağlantıları temizle
    await Promise.all([
      prisma.regionCountry.deleteMany({ where: { region_id: region.id } }),
      prisma.regionCity.deleteMany({ where: { region_id: region.id } }),
      prisma.regionDistrict.deleteMany({ where: { region_id: region.id } }),
      prisma.regionTown.deleteMany({ where: { region_id: region.id } })
    ]);

    // Yeni seçimleri ekle
    if (selectedGeography?.countries?.length > 0) {
      await prisma.regionCountry.createMany({
        data: selectedGeography.countries.map((countryId: string) => ({
          region_id: region.id,
          country_id: countryId
        }))
      });
    }

    if (selectedGeography?.cities?.length > 0) {
      await prisma.regionCity.createMany({
        data: selectedGeography.cities.map((cityId: string) => ({
          region_id: region.id,
          city_id: cityId
        }))
      });
    }

    if (selectedGeography?.districts?.length > 0) {
      await prisma.regionDistrict.createMany({
        data: selectedGeography.districts.map((districtId: string) => ({
          region_id: region.id,
          district_id: districtId
        }))
      });
    }

    if (selectedGeography?.towns?.length > 0) {
      await prisma.regionTown.createMany({
        data: selectedGeography.towns.map((townId: string) => ({
          region_id: region.id,
          town_id: townId
        }))
      });
    }

    // İstatistikleri güncelle
    await updateRegionStatistics(region.id);

    return NextResponse.json({
      success: true,
      data: region,
      message: 'Bölge başarıyla kaydedildi'
    });

  } catch (error) {
    console.error('Region save error:', error);
    return NextResponse.json(
      { error: 'Bölge kaydedilemedi' },
      { status: 500 }
    );
  }
}

// Yardımcı fonksiyonlar
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

async function updateRegionStatistics(regionId: string) {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
    include: {
      countries: { include: { country: true } },
      cities: { include: { city: true } },
      districts: { include: { district: true } },
      towns: { include: { town: true } }
    }
  });

  if (!region) return;

  let totalPopulation = 0;
  let totalArea = 0;
  let centerLat = 0;
  let centerLng = 0;
  let locationCount = 0;

  // Tüm seçili alanlardan istatistik topla
  [...region.cities, ...region.districts, ...region.towns].forEach(item => {
    const location = item.city || item.district || item.town;
    if (location.population) totalPopulation += Number(location.population);
    if (location.area_sqkm) totalArea += location.area_sqkm;
    if (location.latitude && location.longitude) {
      centerLat += location.latitude;
      centerLng += location.longitude;
      locationCount++;
    }
  });

  if (locationCount > 0) {
    centerLat = centerLat / locationCount;
    centerLng = centerLng / locationCount;
  }

  await prisma.region.update({
    where: { id: regionId },
    data: {
      total_population: totalPopulation,
      total_area_sqkm: totalArea,
      center_latitude: locationCount > 0 ? centerLat : null,
      center_longitude: locationCount > 0 ? centerLng : null
    }
  });
} 