import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
//import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/equipment/[id] - Belirli bir ekipmanı getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    //const session = await getServerSession(authOptions);
    //if (!session) {
    //  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //}

    const equipment = await prisma.equipment.findUnique({
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
        maintenanceLogs: {
          orderBy: {
            date: 'desc',
          },
          take: 10, // Son 10 bakım kaydı
        },
        transfers: {
          include: {
            transfer: {
              include: {
                created_by: {
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
              created_at: 'desc',
            },
          },
          take: 10, // Son 10 transfer
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Ekipman bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/equipment/[id] - Belirli bir ekipmanı güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    //const session = await getServerSession(authOptions);
    //if (!session) {
    //  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //}

    const data = await req.json();

    // Ekipmanın var olup olmadığını kontrol et
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id: params.id },
    });

    if (!existingEquipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Ekipman kodunun benzersiz olup olmadığını kontrol et
    if (data.code && data.code !== existingEquipment.code) {
      const equipmentWithCode = await prisma.equipment.findUnique({
        where: { code: data.code },
      });
      if (equipmentWithCode) {
        return NextResponse.json(
          { error: 'Equipment code already exists' },
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
      const category = await prisma.equipmentCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Ekipmanı güncelle
    const equipment = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        serialNumber: data.serialNumber,
        brand: data.brand,
        model: data.model,
        warehouseId: data.warehouseId,
        categoryId: data.categoryId,
        status: data.status,
        condition: data.condition,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : null,
        nextMaintenance: data.nextMaintenance ? new Date(data.nextMaintenance) : null,
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
        maintenanceLogs: {
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Ekipman güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id] - Belirli bir ekipmanı sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    //const session = await getServerSession(authOptions);
    //if (!session) {
    //  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //}

    // Ekipmanın var olup olmadığını kontrol et
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        transfers: true,
        maintenanceLogs: true,
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Ekipmana bağlı transfer varsa silmeyi engelle
    if (equipment.transfers.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete equipment with existing transfers' },
        { status: 400 }
      );
    }

    // Ekipmanı sil (bakım kayıtları da otomatik olarak silinecek)
    await prisma.equipment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Ekipman silinirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 