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
    const countryId = searchParams.get('countryId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' as const };
    }
    
    if (countryId) {
      where.country_id = countryId;
    }

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          population: true,
          timezone: true,
          country: {
            select: {
              id: true,
              name: true,
              iso2: true
            }
          },
          _count: {
            select: {
              districts: true,
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
      prisma.city.count({ where })
    ]);

    const serializedCities = serializeBigInt(cities);

    return NextResponse.json({
      success: true,
      data: serializedCities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json(
      { success: false, error: 'Şehirler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, countryId, latitude, longitude, population, timezone } = body;

    if (!name || !countryId) {
      return NextResponse.json(
        { success: false, error: 'Şehir adı ve ülke ID gerekli' },
        { status: 400 }
      );
    }

    const city = await prisma.city.create({
      data: {
        geonameid: 0, // Varsayılan değer
        name,
        country_id: countryId,
        latitude: latitude || 0,
        longitude: longitude || 0,
        population: population ? BigInt(population) : null,
        timezone: timezone || null
      },
      include: {
        country: {
          select: {
            id: true,
            name: true,
            iso2: true
          }
        }
      }
    });

    const serializedCity = serializeBigInt(city);

    return NextResponse.json({
      success: true,
      data: serializedCity
    });

  } catch (error) {
    console.error('City creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Şehir oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 