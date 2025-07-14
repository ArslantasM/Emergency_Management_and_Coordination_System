import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CreateInventoryDTO, InventoryItem, UpdateInventoryDTO } from '@/types/inventory';

export class InventoryService {
  private baseUrl = '/api/warehouse';

  // Tüm envanterleri getir
  async findAll(params?: {
    include?: Prisma.InventoryInclude;
    where?: Prisma.InventoryWhereInput;
    orderBy?: Prisma.InventoryOrderByWithRelationInput;
  }) {
    try {
      return await prisma.inventory.findMany({
        include: params?.include,
        where: params?.where,
        orderBy: params?.orderBy,
      });
    } catch (error) {
      console.error('Envanterler getirilirken hata:', error);
      throw new Error('Envanterler getirilemedi');
    }
  }

  // Tekil envanter getir
  async findById(id: string, include?: Prisma.InventoryInclude) {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { id },
        include,
      });

      if (!inventory) {
        throw new Error('Envanter bulunamadı');
      }

      return inventory;
    } catch (error) {
      console.error('Envanter getirilirken hata:', error);
      throw error;
    }
  }

  // Yeni envanter oluştur
  async create(data: CreateInventoryDTO & { warehouseId: string }) {
    try {
      return await prisma.inventory.create({
        data: {
          ...data,
          status: 'AVAILABLE',
        },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Envanter oluşturulurken hata:', error);
      throw new Error('Envanter oluşturulamadı');
    }
  }

  // Envanter güncelle
  async update(id: string, data: UpdateInventoryDTO) {
    try {
      return await prisma.inventory.update({
        where: { id },
        data,
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Envanter güncellenirken hata:', error);
      throw new Error('Envanter güncellenemedi');
    }
  }

  // Envanter sil
  async delete(id: string) {
    try {
      await prisma.inventory.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Envanter silinirken hata:', error);
      throw new Error('Envanter silinemedi');
    }
  }

  // Stok durumu güncelle
  async updateStock(id: string, quantity: number) {
    try {
      const inventory = await this.findById(id);
      const newQuantity = inventory.quantity + quantity;

      if (newQuantity < 0) {
        throw new Error('Stok miktarı sıfırın altına düşemez');
      }

      return await this.update(id, {
        quantity: newQuantity,
        status: this.calculateStatus(newQuantity, inventory.minQuantity),
      });
    } catch (error) {
      console.error('Stok durumu güncellenirken hata:', error);
      throw error;
    }
  }

  // Stok durumunu hesapla
  private calculateStatus(quantity: number, minQuantity: number): 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
    if (quantity <= 0) {
      return 'OUT_OF_STOCK';
    }
    if (quantity <= minQuantity) {
      return 'LOW_STOCK';
    }
    return 'AVAILABLE';
  }

  // Depo bazlı envanterleri getir
  async findAllByWarehouse(warehouseId: string) {
    try {
      return await prisma.inventory.findMany({
        where: { warehouseId },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Depo bazlı envanterler getirilirken hata:', error);
      throw new Error('Depo bazlı envanterler getirilemedi');
    }
  }

  // Kategori bazlı envanterleri getir
  async findByCategory(categoryId: string) {
    try {
      return await prisma.inventory.findMany({
        where: { categoryId },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Kategori bazlı envanterler getirilirken hata:', error);
      throw new Error('Kategori bazlı envanterler getirilemedi');
    }
  }

  // Düşük stok seviyesindeki envanterleri getir
  async findLowStock() {
    try {
      return await prisma.inventory.findMany({
        where: {
          quantity: {
            lte: prisma.inventory.fields.minQuantity,
          },
        },
        include: {
          category: true,
          warehouse: true,
        },
      });
    } catch (error) {
      console.error('Düşük stok envanterleri getirilirken hata:', error);
      throw new Error('Düşük stok envanterleri getirilemedi');
    }
  }

  // Son kullanma tarihi yaklaşan envanterleri getir
  async findNearExpiry(daysThreshold: number = 30) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      return await prisma.inventory.findMany({
        where: {
          expiryDate: {
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
      console.error('Son kullanma tarihi yaklaşan envanterler getirilirken hata:', error);
      throw new Error('Son kullanma tarihi yaklaşan envanterler getirilemedi');
    }
  }

  async findAllByWarehouse(warehouseId: string): Promise<InventoryItem[]> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/stock`);
    if (!response.ok) {
      throw new Error('Stok listesi alınamadı');
    }
    return response.json();
  }

  async findOneByWarehouse(warehouseId: string, stockId: string): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/stock/${stockId}`);
    if (!response.ok) {
      throw new Error('Stok detayı alınamadı');
    }
    return response.json();
  }

  async createByWarehouse(warehouseId: string, data: CreateInventoryDTO): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Stok eklenemedi');
    }
    return response.json();
  }

  async updateByWarehouse(warehouseId: string, stockId: string, data: UpdateInventoryDTO): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockId, ...data }),
    });
    if (!response.ok) {
      throw new Error('Stok güncellenemedi');
    }
    return response.json();
  }

  async deleteByWarehouse(warehouseId: string, stockId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/stock?stockId=${stockId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Stok silinemedi');
    }
  }

  async getCategories(): Promise<InventoryCategory[]> {
    const response = await fetch('/api/inventory/category');
    if (!response.ok) {
      throw new Error('Kategoriler alınamadı');
    }
    return response.json();
  }
} 