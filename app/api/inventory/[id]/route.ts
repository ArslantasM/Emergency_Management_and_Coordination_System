import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/inventory/[id] - Belirli bir envanteri getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        category: true,
        transfers: {
          include: {
            transfer: {
              include: {
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            transfer: {
              createdAt: 'desc',
            },
          },
          take: 10, // Son 10 transfer
        },
      },
    });

    if (!inventory) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Envanter bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/inventory/[id] - Belirli bir envanteri güncelle
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

    // Envanterin var olup olmadığını kontrol et
    const existingInventory = await prisma.inventory.findUnique({
      where: { id: params.id },
    });

    if (!existingInventory) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
    }

    // Envanter kodunun benzersiz olup olmadığını kontrol et
    if (data.code && data.code !== existingInventory.code) {
      const inventoryWithCode = await prisma.inventory.findUnique({
        where: { code: data.code },
      });
      if (inventoryWithCode) {
        return NextResponse.json(
          { error: 'Inventory code already exists' },
          { status: 400 }
        );
      }
    }

    // Deponun var olup olmadığını kontrol et
    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: data.warehouseId },
      });
      if (!warehouse) {
        return NextResponse.json(
          { error: 'Warehouse not found' },
          { status: 404 }
        );
      }
    }

    // Kategorinin var olup olmadığını kontrol et
    if (data.categoryId) {
      const category = await prisma.inventoryCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Envanteri güncelle
    const inventory = await prisma.inventory.update({
      where: { id: params.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
        warehouseId: data.warehouseId,
        categoryId: data.categoryId,
        status: data.status,
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

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Envanter güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Belirli bir envanteri sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Envanterin var olup olmadığını kontrol et
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
      include: {
        transfers: true,
      },
    });

    if (!inventory) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
    }

    // Envantere bağlı transfer varsa silmeyi engelle
    if (inventory.transfers.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete inventory with existing transfers' },
        { status: 400 }
      );
    }

    // Envanteri sil
    await prisma.inventory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    console.error('Envanter silinirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 