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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const cityId = searchParams.get('cityId');
    const countryId = searchParams.get('countryId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const };
    }
    
    if (cityId) {
      where.city_id = cityId;
    }
    
    if (countryId) {
      where.country_id = countryId;
    }

    const [districts, total] = await Promise.all([
      prisma.district.findMany({
        where,
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          population: true,
          area_sqkm: true,
          admin2_code: true,
          country: {
            select: {
              id: true,
              name: true,
              iso2: true
            }
          },
          city: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              towns: true
            }
          }
        },
        orderBy: [
          { population: 'desc' },
          { name: 'asc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.district.count({ where })
    ]);

    const serializedDistricts = serializeBigInt(districts);

    return NextResponse.json({
      success: true,
      data: serializedDistricts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Districts API error:', error);
    return NextResponse.json(
      { success: false, error: 'İlçeler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, countryId, cityId, latitude, longitude, population, area_sqkm, admin2_code } = body;

    if (!name || !countryId) {
      return NextResponse.json(
        { success: false, error: 'İlçe adı ve ülke ID gerekli' },
        { status: 400 }
      );
    }

    const district = await prisma.district.create({
      data: {
        geonameid: 0, // Varsayılan değer
        name,
        country_id: countryId,
        city_id: cityId || null,
        latitude: latitude || 0,
        longitude: longitude || 0,
        population: population ? BigInt(population) : null,
        area_sqkm: area_sqkm || null,
        admin2_code: admin2_code || null,
        timezone: 'Europe/Istanbul' // Türkiye için varsayılan
      },
      include: {
        country: {
          select: {
            id: true,
            name: true,
            iso2: true
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const serializedDistrict = serializeBigInt(district);

    return NextResponse.json({
      success: true,
      data: serializedDistrict
    });

  } catch (error) {
    console.error('District creation error:', error);
    return NextResponse.json(
      { success: false, error: 'İlçe oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 