import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { WarehouseReport, StockMovementReport, PersonnelPerformanceReport, ReportFilters, ExportOptions } from '@/types/report';

export class ReportService {
  // Depo raporlarını getir
  async getWarehouseReports(filters?: ReportFilters): Promise<WarehouseReport[]> {
    try {
      const warehouses = await prisma.warehouse.findMany({
        where: {
          id: filters?.warehouseId ? filters.warehouseId : undefined,
        },
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
          personnel: {
            include: {
              user: true,
            },
          },
          source_transfers: {
            where: {
              date: {
                gte: filters?.startDate,
                lte: filters?.endDate,
              },
            },
          },
          target_transfers: {
            where: {
              date: {
                gte: filters?.startDate,
                lte: filters?.endDate,
              },
            },
          },
        },
      });

      return warehouses.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        totalStock: warehouse.inventory.length,
        totalValue: warehouse.inventory.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0),
        lowStockItems: warehouse.inventory.filter(item => item.quantity <= item.minQuantity).length,
        expiredItems: warehouse.inventory.filter(item => item.expiryDate && item.expiryDate < new Date()).length,
        utilizationRate: warehouse.currentUsage,
        incomingTransfers: warehouse.target_transfers.length,
        outgoingTransfers: warehouse.source_transfers.length,
        equipmentCount: warehouse.equipment.length,
        activePersonnel: warehouse.personnel.filter(p => p.status === 'ACTIVE').length,
        totalPersonnel: warehouse.personnel.length,
      }));
    } catch (error) {
      console.error('Depo raporları getirilirken hata:', error);
      throw new Error('Depo raporları getirilemedi');
    }
  }

  // Stok hareket raporlarını getir
  async getStockMovementReports(filters?: ReportFilters): Promise<StockMovementReport[]> {
    try {
      const transfers = await prisma.transfer.findMany({
        where: {
          date: {
            gte: filters?.startDate,
            lte: filters?.endDate,
          },
          sourceId: filters?.warehouseId,
          targetId: filters?.warehouseId,
          type: filters?.type as any,
          status: filters?.status as any,
        },
        include: {
          source: true,
          target: true,
          inventory: {
            include: {
              inventory: true,
            },
          },
        },
      });

      const movements: StockMovementReport[] = [];

      for (const transfer of transfers) {
        for (const item of transfer.inventory) {
          movements.push({
            id: `${transfer.id}-${item.id}`,
            date: transfer.date,
            type: transfer.type as 'IN' | 'OUT' | 'TRANSFER',
            quantity: item.quantity,
            inventory: {
              id: item.inventory.id,
              name: item.inventory.name,
              code: item.inventory.code,
              unit: item.inventory.unit,
            },
            source: transfer.source ? {
              id: transfer.source.id,
              name: transfer.source.name,
              code: transfer.source.code,
            } : undefined,
            target: {
              id: transfer.target.id,
              name: transfer.target.name,
              code: transfer.target.code,
            },
          });
        }
      }

      return movements;
    } catch (error) {
      console.error('Stok hareket raporları getirilirken hata:', error);
      throw new Error('Stok hareket raporları getirilemedi');
    }
  }

  // Personel performans raporlarını getir
  async getPersonnelPerformanceReports(filters?: ReportFilters): Promise<PersonnelPerformanceReport[]> {
    try {
      const personnel = await prisma.warehousePersonnel.findMany({
        where: {
          warehouseId: filters?.warehouseId,
          department: filters?.department,
          position: filters?.position as any,
        },
        include: {
          user: true,
          created_transfers: {
            where: {
              date: {
                gte: filters?.startDate,
                lte: filters?.endDate,
              },
            },
          },
        },
      });

      return personnel.map(person => {
        const transfers = person.created_transfers;
        const completedTransfers = transfers.filter(t => t.status === 'COMPLETED');
        const pendingTransfers = transfers.filter(t => t.status === 'PENDING');
        const rejectedTransfers = transfers.filter(t => t.status === 'REJECTED');

        // Ortalama tamamlanma süresini hesapla (saat cinsinden)
        const completionTimes = completedTransfers.map(t => {
          const start = new Date(t.createdAt).getTime();
          const end = new Date(t.updatedAt).getTime();
          return (end - start) / (1000 * 60 * 60); // Milisaniyeden saate çevir
        });

        const averageCompletionTime = completionTimes.length > 0
          ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
          : 0;

        // Çalışma ve izin günlerini hesapla
        const startDate = filters?.startDate || new Date(person.startDate);
        const endDate = filters?.endDate || new Date();
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const leaveDays = person.status === 'ON_LEAVE' || person.status === 'SICK_LEAVE'
          ? Math.ceil((endDate.getTime() - new Date(person.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: person.id,
          userId: person.userId,
          name: person.user.name,
          position: person.position,
          department: person.department,
          totalTransfers: transfers.length,
          completedTransfers: completedTransfers.length,
          pendingTransfers: pendingTransfers.length,
          rejectedTransfers: rejectedTransfers.length,
          averageCompletionTime,
          workingDays: totalDays - leaveDays,
          leaveDays,
        };
      });
    } catch (error) {
      console.error('Personel performans raporları getirilirken hata:', error);
      throw new Error('Personel performans raporları getirilemedi');
    }
  }

  // Rapor verilerini dışa aktar
  async exportReports(type: 'warehouse' | 'stock' | 'personnel', options: ExportOptions): Promise<Buffer> {
    try {
      let data: any[] = [];

      switch (type) {
        case 'warehouse':
          data = await this.getWarehouseReports(options.filters);
          break;
        case 'stock':
          data = await this.getStockMovementReports(options.filters);
          break;
        case 'personnel':
          data = await this.getPersonnelPerformanceReports(options.filters);
          break;
      }

      // Excel, CSV veya PDF formatında dışa aktarma işlemleri burada yapılacak
      // Şimdilik sadece JSON olarak dönüyoruz
      return Buffer.from(JSON.stringify(data));
    } catch (error) {
      console.error('Rapor dışa aktarılırken hata:', error);
      throw new Error('Rapor dışa aktarılamadı');
    }
  }
} 