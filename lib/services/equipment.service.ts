import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class EquipmentService {
  // Tüm ekipmanları getir
  async findAll(params?: {
    include?: Prisma.EquipmentInclude;
    where?: Prisma.EquipmentWhereInput;
    orderBy?: Prisma.EquipmentOrderByWithRelationInput;
  }) {
    try {
      return await prisma.equipment.findMany({
        include: params?.include,
        where: params?.where,
        orderBy: params?.orderBy,
      });
    } catch (error) {
      console.error('Ekipmanlar getirilirken hata:', error);
      throw new Error('Ekipmanlar getirilemedi');
    }
  }

  // Tekil ekipman getir
  async findById(id: string, include?: Prisma.EquipmentInclude) {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include,
      });

      if (!equipment) {
        throw new Error('Ekipman bulunamadı');
      }

      return equipment;
    } catch (error) {
      console.error('Ekipman getirilirken hata:', error);
      throw error;
    }
  }

  // Yeni ekipman oluştur
  async create(data: Prisma.EquipmentCreateInput) {
    try {
      return await prisma.equipment.create({
        data,
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Ekipman oluşturulurken hata:', error);
      throw new Error('Ekipman oluşturulamadı');
    }
  }

  // Ekipman güncelle
  async update(id: string, data: Prisma.EquipmentUpdateInput) {
    try {
      return await prisma.equipment.update({
        where: { id },
        data,
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Ekipman güncellenirken hata:', error);
      throw new Error('Ekipman güncellenemedi');
    }
  }

  // Ekipman sil
  async delete(id: string) {
    try {
      await prisma.equipment.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Ekipman silinirken hata:', error);
      throw new Error('Ekipman silinemedi');
    }
  }

  // Ekipman durumunu güncelle
  async updateStatus(id: string, status: string) {
    try {
      return await this.update(id, { status });
    } catch (error) {
      console.error('Ekipman durumu güncellenirken hata:', error);
      throw error;
    }
  }

  // Bakım zamanı gelen ekipmanları getir
  async findMaintenanceDue(daysThreshold: number = 7) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      return await prisma.equipment.findMany({
        where: {
          nextMaintenance: {
            lte: thresholdDate,
            gt: new Date(),
          },
        },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Bakım zamanı gelen ekipmanlar getirilirken hata:', error);
      throw new Error('Bakım zamanı gelen ekipmanlar getirilemedi');
    }
  }

  // Bakım kaydı oluştur
  async recordMaintenance(id: string, nextMaintenanceDate?: Date) {
    try {
      return await this.update(id, {
        lastMaintenance: new Date(),
        nextMaintenance: nextMaintenanceDate,
        status: 'AVAILABLE',
      });
    } catch (error) {
      console.error('Bakım kaydı oluşturulurken hata:', error);
      throw error;
    }
  }

  // Kategori bazlı ekipmanları getir
  async findByCategory(categoryId: string) {
    try {
      return await prisma.equipment.findMany({
        where: { categoryId },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Kategori bazlı ekipmanlar getirilirken hata:', error);
      throw new Error('Kategori bazlı ekipmanlar getirilemedi');
    }
  }

  // Depo bazlı ekipmanları getir
  async findByWarehouse(warehouseId: string) {
    try {
      return await prisma.equipment.findMany({
        where: { warehouseId },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Depo bazlı ekipmanlar getirilirken hata:', error);
      throw new Error('Depo bazlı ekipmanlar getirilemedi');
    }
  }
} 