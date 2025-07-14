import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class TransferService {
  // Tüm transferleri getir
  async findAll(params?: {
    include?: Prisma.TransferInclude;
    where?: Prisma.TransferWhereInput;
    orderBy?: Prisma.TransferOrderByWithRelationInput;
  }) {
    try {
      return await prisma.transfer.findMany({
        include: params?.include,
        where: params?.where,
        orderBy: params?.orderBy,
      });
    } catch (error) {
      console.error('Transferler getirilirken hata:', error);
      throw new Error('Transferler getirilemedi');
    }
  }

  // Tekil transfer getir
  async findById(id: string, include?: Prisma.TransferInclude) {
    try {
      const transfer = await prisma.transfer.findUnique({
        where: { id },
        include,
      });

      if (!transfer) {
        throw new Error('Transfer bulunamadı');
      }

      return transfer;
    } catch (error) {
      console.error('Transfer getirilirken hata:', error);
      throw error;
    }
  }

  // Yeni transfer oluştur
  async create(data: Prisma.TransferCreateInput) {
    try {
      return await prisma.transfer.create({
        data,
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
    } catch (error) {
      console.error('Transfer oluşturulurken hata:', error);
      throw new Error('Transfer oluşturulamadı');
    }
  }

  // Transfer güncelle
  async update(id: string, data: Prisma.TransferUpdateInput) {
    try {
      return await prisma.transfer.update({
        where: { id },
        data,
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
    } catch (error) {
      console.error('Transfer güncellenirken hata:', error);
      throw new Error('Transfer güncellenemedi');
    }
  }

  // Transfer sil
  async delete(id: string) {
    try {
      await prisma.transfer.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Transfer silinirken hata:', error);
      throw new Error('Transfer silinemedi');
    }
  }

  // Transfer durumunu güncelle
  async updateStatus(id: string, status: string) {
    try {
      const transfer = await this.update(id, { status });

      // Eğer transfer tamamlandıysa, stok ve ekipman durumlarını güncelle
      if (status === 'COMPLETED') {
        await this.processCompletedTransfer(transfer);
      }

      return transfer;
    } catch (error) {
      console.error('Transfer durumu güncellenirken hata:', error);
      throw error;
    }
  }

  // Tamamlanan transferi işle
  private async processCompletedTransfer(transfer: any) {
    try {
      // Envanter transferlerini işle
      for (const item of transfer.inventory) {
        await prisma.inventory.update({
          where: { id: item.inventory.id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        // Hedef depodaki aynı ürünü bul veya oluştur
        const targetInventory = await prisma.inventory.upsert({
          where: {
            warehouseId_code: {
              warehouseId: transfer.targetId,
              code: item.inventory.code,
            },
          },
          create: {
            ...item.inventory,
            id: undefined,
            warehouseId: transfer.targetId,
            quantity: item.quantity,
          },
          update: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // Ekipman transferlerini işle
      for (const item of transfer.equipment) {
        await prisma.equipment.update({
          where: { id: item.equipment.id },
          data: {
            warehouseId: transfer.targetId,
          },
        });
      }

      // Depo doluluk oranlarını güncelle
      if (transfer.sourceId) {
        await this.updateWarehouseUsage(transfer.sourceId);
      }
      if (transfer.targetId) {
        await this.updateWarehouseUsage(transfer.targetId);
      }
    } catch (error) {
      console.error('Transfer işlenirken hata:', error);
      throw error;
    }
  }

  // Depo doluluk oranını güncelle
  private async updateWarehouseUsage(warehouseId: string) {
    try {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
        include: {
          inventory: true,
          equipment: true,
        },
      });

      if (warehouse) {
        const totalItems = warehouse.inventory.length + warehouse.equipment.length;
        const currentUsage = (totalItems / warehouse.capacity) * 100;

        await prisma.warehouse.update({
          where: { id: warehouseId },
          data: { currentUsage },
        });
      }
    } catch (error) {
      console.error('Depo doluluk oranı güncellenirken hata:', error);
      throw error;
    }
  }

  // Depo bazlı transferleri getir
  async findByWarehouse(warehouseId: string) {
    try {
      return await prisma.transfer.findMany({
        where: {
          OR: [
            { sourceId: warehouseId },
            { targetId: warehouseId },
          ],
        },
        include: {
          source: true,
          target: true,
          createdBy: true,
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
    } catch (error) {
      console.error('Depo bazlı transferler getirilirken hata:', error);
      throw new Error('Depo bazlı transferler getirilemedi');
    }
  }

  // Tarih aralığına göre transferleri getir
  async findByDateRange(startDate: Date, endDate: Date) {
    try {
      return await prisma.transfer.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          source: true,
          target: true,
          createdBy: true,
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
    } catch (error) {
      console.error('Tarih aralığına göre transferler getirilirken hata:', error);
      throw new Error('Tarih aralığına göre transferler getirilemedi');
    }
  }
} 