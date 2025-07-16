import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

// GET - Yeni coğrafi yapıya göre bölgeleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'countries', 'cities', 'districts', 'towns', 'regions'
    const parentId = searchParams.get('parentId');
    const search = searchParams.get('search');

    let result;

    switch (type) {
      case 'countries':
        result = await getCountries(search);
        break;
      case 'cities':
        result = await getCities(parentId, search);
        break;
      case 'districts':
        result = await getDistricts(parentId, search);
        break;
      case 'towns':
        result = await getTowns(parentId, search);
        break;
      case 'regions':
        result = await getEmergencyRegions(search);
        break;
      default:
        // Hiyerarşik tüm verileri getir
        result = await getAllGeographyData();
    }

    const serializedResult = serializeBigInt(result);

    return NextResponse.json({
      success: true,
      data: serializedResult
    });

  } catch (error) {
    console.error('Geography API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Coğrafi veriler alınamadı'
    }, { status: 500 });
  }
}

// Ülkeleri getir
async function getCountries(search?: string | null) {
  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { iso2: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {};

  return await prisma.country.findMany({
    where,
    select: {
      id: true,
      name: true,
      iso2: true,
      continent: true,
      _count: {
        select: { cities: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// Şehirleri getir
async function getCities(countryId?: string | null, search?: string | null) {
  const where: any = {};
  
  if (countryId) {
    where.country_id = countryId;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } }
    ];
  }

  return await prisma.city.findMany({
    where,
    select: {
      id: true,
      name: true,
      population: true,
      country: {
        select: {
          id: true,
          name: true,
          iso2: true
        }
      },
      _count: {
        select: { districts: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// İlçeleri getir
async function getDistricts(cityId?: string | null, search?: string | null) {
  const where: any = {};
  
  if (cityId) {
    where.city_id = cityId;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } }
    ];
  }

  return await prisma.district.findMany({
    where,
    select: {
      id: true,
      name: true,
      population: true,
      city: {
        select: {
          id: true,
          name: true,
          country: {
            select: {
              id: true,
              name: true,
              iso2: true
            }
          }
        }
      },
      _count: {
        select: { towns: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// Kasaba/mahalleleri getir
async function getTowns(districtId?: string | null, search?: string | null) {
  const where: any = {};
  
  if (districtId) {
    where.district_id = districtId;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } }
    ];
  }

  return await prisma.town.findMany({
    where,
    select: {
      id: true,
      name: true,
      type: true,
      population: true,
      district: {
        select: {
          id: true,
          name: true,
          city: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  id: true,
                  name: true,
                  iso2: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// Acil durum bölgelerini getir
async function getEmergencyRegions(search?: string | null) {
  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {};

  return await prisma.region.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      region_type: true,
      emergency_level: true,
      status: true,
      total_population: true,
      total_area_sqkm: true,
      countries: {
        select: {
          country: {
            select: {
              id: true,
              name: true,
              iso2: true
            }
          }
        }
      },
      cities: {
        select: {
          city: {
            select: {
              id: true,
              name: true,
              country: {
                select: {
                  id: true,
                  name: true,
                  iso2: true
                }
              }
            }
          }
        }
      },
      districts: {
        select: {
          district: {
            select: {
              id: true,
              name: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  iso2: true
                }
              }
            }
          }
        }
      },
      towns: {
        select: {
          town: {
            select: {
              id: true,
              name: true,
              type: true,
              district: {
                select: {
                  id: true,
                  name: true,
                  iso2: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// Tüm coğrafi verileri hiyerarşik olarak getir
async function getAllGeographyData() {
  const countries = await prisma.country.findMany({
    select: {
      id: true,
      name: true,
      iso2: true,
      continent: true,
      cities: {
        select: {
          id: true,
          name: true,
          population: true,
          districts: {
            select: {
              id: true,
              name: true,
              population: true,
              towns: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  population: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // TreeSelect için formatla
  const treeData = countries.map(country => ({
    title: `${country.name} (${country.iso2})`,
    value: `country-${country.id}`,
    key: `country-${country.id}`,
    type: 'country',
    children: country.cities.map(city => ({
      title: `${city.name} (${city.population ? Number(city.population).toLocaleString() : 'N/A'})`,
      value: `city-${city.id}`,
      key: `city-${city.id}`,
      type: 'city',
      children: city.districts.map(district => ({
        title: `${district.name} (${district.population ? Number(district.population).toLocaleString() : 'N/A'})`,
        value: `district-${district.id}`,
        key: `district-${district.id}`,
        type: 'district',
        children: district.towns.map(town => ({
          title: `${town.name} (${town.type})`,
          value: `town-${town.id}`,
          key: `town-${town.id}`,
          type: 'town'
        }))
      }))
    }))
  }));

  return {
    countries,
    treeData
  };
}

// POST - Yeni acil durum bölgesi oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, region_type, emergency_level, locations } = body;

    // Acil durum bölgesi oluştur
    const region = await prisma.region.create({
      data: {
        name,
        description,
        region_type: region_type || 'emergency',
        emergency_level: emergency_level || 'MEDIUM',
        status: 'ACTIVE'
      }
    });

    // Seçilen lokasyonları bölgeye bağla
    if (locations && locations.length > 0) {
      for (const location of locations) {
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
              break;
              
            case 'city':
              await prisma.regionCity.create({
                data: {
                  region_id: region.id,
                  city_id: id
                }
              });
              break;
              
            case 'district':
              await prisma.regionDistrict.create({
                data: {
                  region_id: region.id,
                  district_id: id
                }
              });
              break;
              
            case 'town':
              await prisma.regionTown.create({
                data: {
                  region_id: region.id,
                  town_id: id
                }
              });
              break;
          }
        } catch (error) {
          console.warn(`⚠️ ${type} bağlanırken hata:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: region
    });

  } catch (error) {
    console.error('Region Create Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Bölge oluşturulamadı'
    }, { status: 500 });
  }
} 