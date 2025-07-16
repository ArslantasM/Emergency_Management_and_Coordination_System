import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Depo raporlarını getir
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Depo bazlı filtreleme
    const whereClause: any = {};
    if (warehouseId) {
      whereClause.id = warehouseId;
    }

    // Tüm depoları getir
    const warehouses = await prisma.warehouse.findMany({
      where: whereClause,
      include: {
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

    // Her depo için rapor oluştur
    const reports = await Promise.all(
      warehouses.map(async (warehouse) => {
        // Stok hareketlerini getir
        const transferWhereClause: any = {
          OR: [
            { sourceId: warehouse.id },
            { targetId: warehouse.id },
          ],
        };

        if (startDate && endDate) {
          transferWhereClause.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
          };
        }

        const transfers = await prisma.transfer.findMany({
          where: transferWhereClause,
          include: {
            inventory: {
              include: {
                inventory: true,
              },
            },
            equipment: {
              include: {
                equipment: true,
              },
            },
          },
        });

        // Stok değerlerini hesapla
        const totalStock = warehouse.inventory.length;
        const lowStockItems = warehouse.inventory.filter(
          (item) => item.quantity <= item.minQuantity
        ).length;
        const expiredItems = warehouse.inventory.filter(
          (item) => item.expiryDate && new Date(item.expiryDate) < new Date()
        ).length;
        const utilizationRate = warehouse.capacity > 0 
          ? warehouse.currentUsage / warehouse.capacity 
          : 0;

        // Transfer istatistiklerini hesapla
        const incomingTransfers = transfers.filter(
          (t) => t.targetId === warehouse.id
        ).length;
        const outgoingTransfers = transfers.filter(
          (t) => t.sourceId === warehouse.id
        ).length;

        return {
          id: warehouse.id,
          name: warehouse.name,
          totalStock,
          totalValue: warehouse.inventory.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          ),
          lowStockItems,
          expiredItems,
          utilizationRate,
          incomingTransfers,
          outgoingTransfers,
          equipmentCount: warehouse.equipment.length,
        };
      })
    );

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Raporlar alınırken hata:', error);
    return NextResponse.json(
      { error: 'Raporlar alınamadı' },
      { status: 500 }
    );
  }
}

// Stok hareketlerini getir
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {
      OR: [
        { sourceId: warehouseId },
        { targetId: warehouseId },
      ],
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transfers = await prisma.transfer.findMany({
      where: whereClause,
      include: {
        source: {
          select: {
            name: true,
          },
        },
        target: {
          select: {
            name: true,
          },
        },
        inventory: {
          include: {
            inventory: true,
          },
        },
        equipment: {
          include: {
            equipment: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transfer verilerini düzenle
    const movements = transfers.flatMap((transfer) => {
      const inventoryMovements = transfer.inventory.map((item) => ({
        id: `${transfer.id}-${item.inventory.id}`,
        date: transfer.date,
        type: transfer.type,
        itemName: item.inventory.name,
        quantity: item.quantity,
        unit: item.inventory.unit,
        source: transfer.source?.name || '-',
        destination: transfer.target?.name || '-',
        createdBy: transfer.createdBy.name,
        status: transfer.status,
      }));

      const equipmentMovements = transfer.equipment.map((item) => ({
        id: `${transfer.id}-${item.equipment.id}`,
        date: transfer.date,
        type: transfer.type,
        itemName: item.equipment.name,
        quantity: 1,
        unit: 'adet',
        source: transfer.source?.name || '-',
        destination: transfer.target?.name || '-',
        createdBy: transfer.createdBy.name,
        status: transfer.status,
      }));

      return [...inventoryMovements, ...equipmentMovements];
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Stok hareketleri alınırken hata:', error);
    return NextResponse.json(
      { error: 'Stok hareketleri alınamadı' },
      { status: 500 }
    );
  }
} 