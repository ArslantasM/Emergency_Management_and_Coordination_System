import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/transfer - Tüm transfer listesini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // URL'den query parametrelerini al
    const { searchParams } = new URL(req.url);
    const sourceWarehouseId = searchParams.get('sourceWarehouseId');
    const targetWarehouseId = searchParams.get('targetWarehouseId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Filtreleme koşullarını oluştur
    const where: any = {};
    if (sourceWarehouseId) where.sourceWarehouseId = sourceWarehouseId;
    if (targetWarehouseId) where.targetWarehouseId = targetWarehouseId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        sourceWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        targetWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            inventory: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
              },
            },
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                serialNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error('Transfer listesi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/transfer - Yeni transfer ekle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Gerekli alanların kontrolü
    if (!data.sourceWarehouseId || !data.targetWarehouseId || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Kaynak ve hedef depoların aynı olup olmadığını kontrol et
    if (data.sourceWarehouseId === data.targetWarehouseId) {
      return NextResponse.json(
        { error: 'Source and target warehouses cannot be the same' },
        { status: 400 }
      );
    }

    // Kaynak deponun var olup olmadığını kontrol et
    const sourceWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.sourceWarehouseId },
    });
    if (!sourceWarehouse) {
      return NextResponse.json(
        { error: 'Source warehouse not found' },
        { status: 404 }
      );
    }

    // Hedef deponun var olup olmadığını kontrol et
    const targetWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.targetWarehouseId },
    });
    if (!targetWarehouse) {
      return NextResponse.json(
        { error: 'Target warehouse not found' },
        { status: 404 }
      );
    }

    // Transfer öğelerinin geçerliliğini kontrol et
    for (const item of data.items) {
      if (item.type === 'INVENTORY') {
        const inventory = await prisma.inventory.findUnique({
          where: { id: item.inventoryId },
        });
        if (!inventory) {
          return NextResponse.json(
            { error: `Inventory item not found: ${item.inventoryId}` },
            { status: 404 }
          );
        }
        if (inventory.quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient inventory quantity for item: ${inventory.name}` },
            { status: 400 }
          );
        }
      } else if (item.type === 'EQUIPMENT') {
        const equipment = await prisma.equipment.findUnique({
          where: { id: item.equipmentId },
        });
        if (!equipment) {
          return NextResponse.json(
            { error: `Equipment item not found: ${item.equipmentId}` },
            { status: 404 }
          );
        }
        if (equipment.status !== 'AVAILABLE') {
          return NextResponse.json(
            { error: `Equipment is not available: ${equipment.name}` },
            { status: 400 }
          );
        }
      }
    }

    // Yeni transfer oluştur
    const transfer = await prisma.transfer.create({
      data: {
        code: data.code || `TRF-${Date.now()}`,
        type: data.type || 'STANDARD',
        status: 'PENDING',
        description: data.description,
        sourceWarehouseId: data.sourceWarehouseId,
        targetWarehouseId: data.targetWarehouseId,
        createdById: session.user.id,
        items: {
          create: data.items.map((item: any) => ({
            type: item.type,
            quantity: item.quantity,
            inventoryId: item.inventoryId,
            equipmentId: item.equipmentId,
          })),
        },
      },
      include: {
        sourceWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        targetWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            inventory: {
              select: {
                id: true,
                name: true,
                code: true,
                unit: true,
              },
            },
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                serialNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error('Transfer oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/transfer - Toplu güncelleme
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

        // Transferin var olup olmadığını kontrol et
        const existingTransfer = await prisma.transfer.findUnique({
          where: { id: item.id },
        });
        if (!existingTransfer) {
          throw new Error(`Transfer not found: ${item.id}`);
        }

        // Tamamlanmış transferlerin güncellenmesini engelle
        if (existingTransfer.status === 'COMPLETED') {
          throw new Error(`Cannot update completed transfer: ${item.id}`);
        }

        return prisma.transfer.update({
          where: { id: item.id },
          data: {
            code: item.code,
            type: item.type,
            status: item.status,
            description: item.description,
            sourceWarehouseId: item.sourceWarehouseId,
            targetWarehouseId: item.targetWarehouseId,
            approvedById: item.status === 'APPROVED' ? session.user.id : null,
            approvedAt: item.status === 'APPROVED' ? new Date() : null,
          },
          include: {
            sourceWarehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            targetWarehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            approvedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                inventory: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    unit: true,
                  },
                },
                equipment: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    serialNumber: true,
                  },
                },
              },
            },
          },
        });
      })
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('Transfer güncellenirken hata:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 