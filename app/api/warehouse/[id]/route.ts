import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/warehouse/[id] - Belirli bir depoyu getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        infrastructure: true,
        conditions: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        inventory: {
          include: {
            category: true,
          },
        },
        equipment: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Depo bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/warehouse/[id] - Belirli bir depoyu güncelle
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

    // Deponun var olup olmadığını kontrol et
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
    });

    if (!existingWarehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Depo kodunun benzersiz olup olmadığını kontrol et
    if (data.code && data.code !== existingWarehouse.code) {
      const warehouseWithCode = await prisma.warehouse.findUnique({
        where: { code: data.code },
      });
      if (warehouseWithCode) {
        return NextResponse.json(
          { error: 'Warehouse code already exists' },
          { status: 400 }
        );
      }
    }

    // Depoyu güncelle
    const warehouse = await prisma.warehouse.update({
      where: { id: params.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        address: data.address,
        size: data.size,
        location: data.location,
        status: data.status,
        categoryId: data.categoryId,
        infrastructure: data.infrastructureIds ? {
          set: data.infrastructureIds.map((id: string) => ({ id })),
        } : undefined,
        conditions: data.conditionIds ? {
          set: data.conditionIds.map((id: string) => ({ id })),
        } : undefined,
        capacity: data.capacity,
        currentUsage: data.currentUsage,
        responsibleId: data.responsibleId,
      },
      include: {
        category: true,
        infrastructure: true,
        conditions: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Depo güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouse/[id] - Belirli bir depoyu sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Deponun var olup olmadığını kontrol et
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
      include: {
        inventory: true,
        equipment: true,
      },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Depoda envanter veya ekipman varsa silmeyi engelle
    if (warehouse.inventory.length > 0 || warehouse.equipment.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with existing inventory or equipment' },
        { status: 400 }
      );
    }

    // Depoyu sil
    await prisma.warehouse.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Depo silinirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 