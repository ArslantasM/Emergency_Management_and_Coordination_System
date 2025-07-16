import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/infrastructure - Tüm altyapı listesini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // URL'den query parametrelerini al
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Filtreleme koşullarını oluştur
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const infrastructure = await prisma.infrastructure.findMany({
      where,
      include: {
        warehouses: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(infrastructure);
  } catch (error) {
    console.error('Altyapı listesi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/infrastructure - Yeni altyapı ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Gerekli alanların kontrolü
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Altyapı adının benzersiz olup olmadığını kontrol et
    const existingInfrastructure = await prisma.infrastructure.findFirst({
      where: {
        name: data.name,
        type: data.type,
      },
    });
    if (existingInfrastructure) {
      return NextResponse.json(
        { error: 'Infrastructure with this name and type already exists' },
        { status: 400 }
      );
    }

    // Yeni altyapı oluştur
    const infrastructure = await prisma.infrastructure.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        status: data.status || 'ACTIVE',
        capacity: data.capacity,
        unit: data.unit,
      },
      include: {
        warehouses: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(infrastructure, { status: 201 });
  } catch (error) {
    console.error('Altyapı oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/infrastructure - Toplu güncelleme
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Request body must be an array' },
        { status: 400 }
      );
    }

    const updates = await Promise.all(
      data.map(async (item) => {
        if (!item.id) {
          throw new Error('Each item must have an id');
        }

        // Altyapının var olup olmadığını kontrol et
        const existingInfrastructure = await prisma.infrastructure.findUnique({
          where: { id: item.id },
        });
        if (!existingInfrastructure) {
          throw new Error(`Infrastructure not found: ${item.id}`);
        }

        // Altyapı adının benzersiz olup olmadığını kontrol et
        if (item.name && item.type) {
          const duplicateInfrastructure = await prisma.infrastructure.findFirst({
            where: {
              name: item.name,
              type: item.type,
              NOT: {
                id: item.id,
              },
            },
          });
          if (duplicateInfrastructure) {
            throw new Error(`Infrastructure with name '${item.name}' and type '${item.type}' already exists`);
          }
        }

        return prisma.infrastructure.update({
          where: { id: item.id },
          data: {
            name: item.name,
            type: item.type,
            description: item.description,
            status: item.status,
            capacity: item.capacity,
            unit: item.unit,
          },
          include: {
            warehouses: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Altyapı güncellenirken hata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 