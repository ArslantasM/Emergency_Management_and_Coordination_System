import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/warehouse/category - Tüm depo kategorilerini listele
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.warehouseCategory.findMany({
      include: {
        _count: {
          select: {
            warehouses: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Depo kategorileri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/warehouse/category - Yeni depo kategorisi ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Gerekli alanların kontrolü
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Kategori adının benzersiz olup olmadığını kontrol et
    const existingCategory = await prisma.warehouseCategory.findUnique({
      where: { name: data.name },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    // Yeni kategori oluştur
    const category = await prisma.warehouseCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Depo kategorisi oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/warehouse/category - Toplu güncelleme
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

        // Kategori adının benzersiz olup olmadığını kontrol et
        if (item.name) {
          const existingCategory = await prisma.warehouseCategory.findFirst({
            where: {
              name: item.name,
              NOT: {
                id: item.id,
              },
            },
          });
          if (existingCategory) {
            throw new Error(`Category name '${item.name}' already exists`);
          }
        }

        return prisma.warehouseCategory.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
          },
        });
      })
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Depo kategorileri güncellenirken hata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 