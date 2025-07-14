import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class WarehouseService {
  // Tüm depoları getir
  async findAll(params?: {
    include?: Prisma.WarehouseInclude;
    where?: Prisma.WarehouseWhereInput;
    orderBy?: Prisma.WarehouseOrderByWithRelationInput;
  }) {
    try {
      return await prisma.warehouse.findMany({
        include: params?.include,
        where: params?.where,
        orderBy: params?.orderBy,
      });
    } catch (error) {
      console.error('Depolar getirilirken hata:', error);
      throw new Error('Depolar getirilemedi');
    }
  }

  // Tekil depo getir
  async findById(id: string, include?: Prisma.WarehouseInclude) {
    try {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id },
        include,
      });

      if (!warehouse) {
        throw new Error('Depo bulunamadı');
      }

      return warehouse;
    } catch (error) {
      console.error('Depo getirilirken hata:', error);
      throw error;
    }
  }

  // Yeni depo oluştur
  async create(data: Prisma.WarehouseCreateInput) {
    try {
      return await prisma.warehouse.create({
        data,
        include: {
          category: true,
          responsible: true,
          personnel: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Depo oluşturulurken hata:', error);
      throw new Error('Depo oluşturulamadı');
    }
  }

  // Depo güncelle
  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    try {
      return await prisma.warehouse.update({
        where: { id },
        data,
        include: {
          category: true,
          responsible: true,
          personnel: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Depo güncellenirken hata:', error);
      throw new Error('Depo güncellenemedi');
    }
  }

  // Depo sil
  async delete(id: string) {
    try {
      await prisma.warehouse.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Depo silinirken hata:', error);
      throw new Error('Depo silinemedi');
    }
  }

  // Depo doluluk oranını güncelle
  async updateUsage(id: string) {
    try {
      const warehouse = await this.findById(id, {
        inventory: true,
        equipment: true,
      });

      // Envanter ve ekipman sayılarına göre doluluk oranını hesapla
      const totalItems = warehouse.inventory.length + warehouse.equipment.length;
      const currentUsage = (totalItems / warehouse.capacity) * 100;

      return await this.update(id, {
        currentUsage,
      });
    } catch (error) {
      console.error('Depo doluluk oranı güncellenirken hata:', error);
      throw error;
    }
  }

  // Depo raporlarını getir
  async getReports(params: {
    warehouseId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: Prisma.WarehouseWhereInput = {};

      if (params.warehouseId) {
        where.id = params.warehouseId;
      }

      const warehouses = await prisma.warehouse.findMany({
        where,
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
          source_transfers: {
            where: {
              date: {
                gte: params.startDate,
                lte: params.endDate,
              },
            },
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
          },
          target_transfers: {
            where: {
              date: {
                gte: params.startDate,
                lte: params.endDate,
              },
            },
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
          },
        },
      });

      return warehouses.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        totalStock: warehouse.inventory.length,
        totalValue: warehouse.inventory.reduce((sum, item) => sum + item.quantity, 0),
        lowStockItems: warehouse.inventory.filter(item => item.quantity <= item.minQuantity).length,
        expiredItems: warehouse.inventory.filter(item => item.expiryDate && item.expiryDate < new Date()).length,
        utilizationRate: warehouse.currentUsage / warehouse.capacity,
      }));
    } catch (error) {
      console.error('Depo raporları getirilirken hata:', error);
      throw new Error('Depo raporları getirilemedi');
    }
  }
} 