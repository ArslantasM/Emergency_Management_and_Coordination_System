import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/transfer/[id] - Belirli bir transferi getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
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
                quantity: true,
              },
            },
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                serialNumber: true,
                status: true,
                condition: true,
              },
            },
          },
        },
      },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Transfer bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/transfer/[id] - Belirli bir transferi güncelle
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

    // Transferin var olup olmadığını kontrol et
    const existingTransfer = await prisma.transfer.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            inventory: true,
            equipment: true,
          },
        },
      },
    });

    if (!existingTransfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Tamamlanmış transferlerin güncellenmesini engelle
    if (existingTransfer.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot update completed transfer' },
        { status: 400 }
      );
    }

    // Transfer durumu onaylandıysa veya tamamlandıysa, envanter ve ekipman durumlarını güncelle
    if (data.status === 'COMPLETED' && existingTransfer.status !== 'COMPLETED') {
      // Prisma transaction kullanarak tüm güncellemeleri atomik olarak yap
      await prisma.$transaction(async (prisma) => {
        // Transfer öğelerini güncelle
        for (const item of existingTransfer.items) {
          if (item.type === 'INVENTORY' && item.inventory) {
            // Kaynak depodaki envanteri azalt
            await prisma.inventory.update({
              where: { id: item.inventory.id },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });

            // Hedef depoda aynı envanter var mı kontrol et
            const targetInventory = await prisma.inventory.findFirst({
              where: {
                code: item.inventory.code,
                warehouseId: existingTransfer.targetWarehouseId,
              },
            });

            if (targetInventory) {
              // Varsa miktarı artır
              await prisma.inventory.update({
                where: { id: targetInventory.id },
                data: {
                  quantity: {
                    increment: item.quantity,
                  },
                },
              });
            } else {
              // Yoksa yeni envanter oluştur
              await prisma.inventory.create({
                data: {
                  name: item.inventory.name,
                  code: item.inventory.code,
                  description: item.inventory.description,
                  quantity: item.quantity,
                  unit: item.inventory.unit,
                  minQuantity: item.inventory.minQuantity,
                  maxQuantity: item.inventory.maxQuantity,
                  warehouseId: existingTransfer.targetWarehouseId,
                  categoryId: item.inventory.categoryId,
                  status: item.inventory.status,
                  expiryDate: item.inventory.expiryDate,
                },
              });
            }
          } else if (item.type === 'EQUIPMENT' && item.equipment) {
            // Ekipmanın depo ve durumunu güncelle
            await prisma.equipment.update({
              where: { id: item.equipment.id },
              data: {
                warehouseId: existingTransfer.targetWarehouseId,
                status: 'AVAILABLE',
              },
            });
          }
        }

        // Transfer durumunu güncelle
        await prisma.transfer.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      });
    }

    // Transferi güncelle
    const transfer = await prisma.transfer.update({
      where: { id: params.id },
      data: {
        code: data.code,
        type: data.type,
        status: data.status,
        description: data.description,
        sourceWarehouseId: data.sourceWarehouseId,
        targetWarehouseId: data.targetWarehouseId,
        approvedById: data.status === 'APPROVED' ? session.user.id : null,
        approvedAt: data.status === 'APPROVED' ? new Date() : null,
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
                quantity: true,
              },
            },
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                serialNumber: true,
                status: true,
                condition: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Transfer güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/transfer/[id] - Belirli bir transferi sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Transferin var olup olmadığını kontrol et
    const transfer = await prisma.transfer.findUnique({
      where: { id: params.id },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Tamamlanmış transferlerin silinmesini engelle
    if (transfer.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed transfer' },
        { status: 400 }
      );
    }

    // Transferi ve ilişkili öğeleri sil
    await prisma.$transaction([
      prisma.transferItem.deleteMany({
        where: { transferId: params.id },
      }),
      prisma.transfer.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    console.error('Transfer silinirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 