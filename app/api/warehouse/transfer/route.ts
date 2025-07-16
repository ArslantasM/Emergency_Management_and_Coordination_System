import { NextResponse } from 'next/server';
import { PrismaClient, TransferType, TransferStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Transfer oluşturma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const data = await request.json();
    const {
      type,
      date,
      description,
      warehouseId,
      issuedById,
      receivedById,
      items
    } = data;

    // Transfer kaydı oluştur
    const transfer = await prisma.transferLog.create({
      data: {
        type: type as TransferType,
        date: new Date(date),
        description,
        warehouseId,
        issuedById,
        receivedById,
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            notes: item.notes,
            ...(item.type === 'inventory' ? { inventoryId: item.id } : { equipmentId: item.id })
          }))
        }
      },
      include: {
        items: true,
        issuedBy: true,
        receivedBy: true,
        warehouse: true
      }
    });

    // Stok güncelleme işlemi
    for (const item of items) {
      if (item.type === 'inventory') {
        await prisma.warehouseStock.update({
          where: { id: parseInt(item.id) },
          data: {
            quantity: {
              [type === 'ENTRY' ? 'increment' : 'decrement']: item.quantity
            }
          }
        });
      }
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Transfer oluşturma hatası:', error);
    return NextResponse.json({ error: 'Transfer oluşturulamadı' }, { status: 500 });
  }
}

// Transfer listesi
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const type = searchParams.get('type') as TransferType | null;
    const status = searchParams.get('status') as TransferStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const transfers = await prisma.transferLog.findMany({
      where: {
        ...(warehouseId && { warehouseId }),
        ...(type && { type }),
        ...(status && { status }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      include: {
        items: {
          include: {
            inventory: true,
            equipment: true
          }
        },
        issuedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receivedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Transfer listesi hatası:', error);
    return NextResponse.json({ error: 'Transfer listesi alınamadı' }, { status: 500 });
  }
} 