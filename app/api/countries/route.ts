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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { iso2: { contains: search, mode: 'insensitive' as const } },
        { iso3: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [countries, total] = await Promise.all([
      prisma.country.findMany({
        where,
        select: {
          id: true,
          name: true,
          iso2: true,
          iso3: true,
          continent: true,
          population: true,
          area_sqkm: true,
          _count: {
            select: {
              cities: true,
              districts: true,
              towns: true
            }
          }
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.country.count({ where })
    ]);

    // BigInt'leri serialize et
    const serializedCountries = serializeBigInt(countries);

    return NextResponse.json({
      success: true,
      data: serializedCountries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Countries API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ülkeler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, iso2, iso3, continent, population, area_sqkm } = body;

    if (!name || !iso2) {
      return NextResponse.json(
        { success: false, error: 'Ülke adı ve ISO2 kodu gerekli' },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: {
        geonameid: 0, // Varsayılan değer
        name,
        iso2,
        iso3,
        continent,
        population: population ? BigInt(population) : null,
        area_sqkm: area_sqkm || null
      }
    });

    const serializedCountry = serializeBigInt(country);

    return NextResponse.json({
      success: true,
      data: serializedCountry
    });

  } catch (error) {
    console.error('Country creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Ülke oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 