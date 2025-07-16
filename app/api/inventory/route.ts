import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/inventory - Tüm envanter listesini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // URL'den query parametrelerini al
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Filtreleme koşullarını oluştur
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Envanter listesi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Yeni envanter ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Gerekli alanların kontrolü
    if (!data.name || !data.code || !data.warehouseId || !data.categoryId) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Envanter kodunun benzersiz olup olmadığını kontrol et
    const existingInventory = await prisma.inventory.findUnique({
      where: { code: data.code },
    });
    if (existingInventory) {
      return NextResponse.json(
        { error: 'Inventory code already exists' },
        { status: 400 }
      );
    }

    // Deponun var olup olmadığını kontrol et
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    });
    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Kategorinin var olup olmadığını kontrol et
    const category = await prisma.inventoryCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Yeni envanter oluştur
    const inventory = await prisma.inventory.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        quantity: data.quantity || 0,
        unit: data.unit,
        minQuantity: data.minQuantity || 0,
        maxQuantity: data.maxQuantity,
        warehouseId: data.warehouseId,
        categoryId: data.categoryId,
        status: data.status || 'AVAILABLE',
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error('Envanter oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory - Toplu güncelleme
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

        // Envanter kodunun benzersiz olup olmadığını kontrol et
        if (item.code) {
          const existingInventory = await prisma.inventory.findFirst({
            where: {
              code: item.code,
              NOT: {
                id: item.id,
              },
            },
          });
          if (existingInventory) {
            throw new Error(`Inventory code '${item.code}' already exists`);
          }
        }

        return prisma.inventory.update({
          where: { id: item.id },
          data: {
            name: item.name,
            code: item.code,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            minQuantity: item.minQuantity,
            maxQuantity: item.maxQuantity,
            warehouseId: item.warehouseId,
            categoryId: item.categoryId,
            status: item.status,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          },
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            category: true,
          },
        });
      })
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Envanter güncellenirken hata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 