import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WarehouseService } from '@/lib/services';

// GET /api/warehouse/[id]/reports
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const service = new WarehouseService();
    const reports = await service.getReports({
      warehouseId: params.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Raporlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Raporlar getirilemedi' },
      { status: 500 }
    );
  }
}

// GET /api/warehouse/[id]/reports/export
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Depo bilgilerini getir
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: params.id },
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

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Depo bulunamadı' },
        { status: 404 }
      );
    }

    // Transfer bilgilerini getir
    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          { sourceId: params.id },
          { targetId: params.id },
        ],
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        source: true,
        target: true,
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

    // Excel için veri hazırla
    const reportData = {
      warehouseInfo: {
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        capacity: warehouse.capacity,
        currentUsage: warehouse.currentUsage,
      },
      inventory: warehouse.inventory.map(item => ({
        name: item.name,
        code: item.code,
        category: item.category.name,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
      })),
      equipment: warehouse.equipment.map(item => ({
        name: item.name,
        code: item.code,
        category: item.category.name,
        status: item.status,
        lastMaintenance: item.lastMaintenance,
        nextMaintenance: item.nextMaintenance,
      })),
      transfers: transfers.map(transfer => ({
        date: transfer.date,
        type: transfer.sourceId === params.id ? 'OUT' : 'IN',
        source: transfer.source?.name || '-',
        target: transfer.target?.name || '-',
        inventory: transfer.inventory.map(item => ({
          name: item.inventory.name,
          quantity: item.quantity,
          unit: item.inventory.unit,
        })),
        equipment: transfer.equipment.map(item => ({
          name: item.equipment.name,
          code: item.equipment.code,
        })),
      })),
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Rapor verisi hazırlanırken hata:', error);
    return NextResponse.json(
      { error: 'Rapor verisi hazırlanamadı' },
      { status: 500 }
    );
  }
} 