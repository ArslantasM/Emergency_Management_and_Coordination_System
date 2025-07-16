import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/equipment/category/[id] - Belirli bir kategoriyi getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await prisma.equipmentCategory.findUnique({
      where: { id: params.id },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            serialNumber: true,
            brand: true,
            model: true,
            status: true,
            condition: true,
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Kategori bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment/category/[id] - Belirli bir kategoriyi güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Kategorinin var olup olmadığını kontrol et
    const existingCategory = await prisma.equipmentCategory.findUnique({
      where: { id: params.id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Kategori adının benzersiz olup olmadığını kontrol et
    if (data.name && data.name !== existingCategory.name) {
      const categoryWithName = await prisma.equipmentCategory.findUnique({
        where: { name: data.name },
      });
      if (categoryWithName) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 400 }
        );
      }
    }

    // Kategoriyi güncelle
    const category = await prisma.equipmentCategory.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        maintenanceInterval: data.maintenanceInterval,
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            serialNumber: true,
            brand: true,
            model: true,
            status: true,
            condition: true,
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/category/[id] - Belirli bir kategoriyi sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kategorinin var olup olmadığını kontrol et
    const category = await prisma.equipmentCategory.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Kategoriye bağlı ekipman varsa silmeyi engelle
    if (category.equipment.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing equipment' },
        { status: 400 }
      );
    }

    // Kategoriyi sil
    await prisma.equipmentCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Kategori silinirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 