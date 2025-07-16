import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/equipment/category - Tüm ekipman kategorilerini listele
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.equipmentCategory.findMany({
      include: {
        _count: {
          select: {
            equipment: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Ekipman kategorileri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/category - Yeni ekipman kategorisi ekle
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
    const existingCategory = await prisma.equipmentCategory.findUnique({
      where: { name: data.name },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    // Yeni kategori oluştur
    const category = await prisma.equipmentCategory.create({
      data: {
        name: data.name,
        description: data.description,
        maintenanceInterval: data.maintenanceInterval,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Ekipman kategorisi oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/equipment/category - Toplu güncelleme
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
          const existingCategory = await prisma.equipmentCategory.findFirst({
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

        return prisma.equipmentCategory.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
            maintenanceInterval: item.maintenanceInterval,
          },
        });
      })
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Ekipman kategorileri güncellenirken hata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 