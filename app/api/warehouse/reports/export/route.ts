import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as XLSX from 'xlsx';

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

    // Depo bilgilerini getir
    const warehouse = warehouseId ? await prisma.warehouse.findUnique({
      where: { id: warehouseId },
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
    }) : null;

    // Transfer bilgilerini getir
    const transferWhereClause: any = {};
    if (warehouseId) {
      transferWhereClause.OR = [
        { sourceId: warehouseId },
        { targetId: warehouseId },
      ];
    }
    if (startDate && endDate) {
      transferWhereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transfers = await prisma.transfer.findMany({
      where: transferWhereClause,
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

    // Excel dosyası oluştur
    const workbook = XLSX.utils.book_new();

    // Envanter sayfası
    if (warehouse) {
      const inventoryData = warehouse.inventory.map(item => ({
        'Ürün Kodu': item.code,
        'Ürün Adı': item.name,
        'Kategori': item.category.name,
        'Miktar': item.quantity,
        'Birim': item.unit,
        'Minimum Stok': item.minQuantity,
        'Maksimum Stok': item.maxQuantity || '-',
        'Son Kullanma': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('tr-TR') : '-',
        'Durum': item.status,
      }));

      const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Envanter');

      // Ekipman sayfası
      const equipmentData = warehouse.equipment.map(item => ({
        'Ekipman Kodu': item.code,
        'Ekipman Adı': item.name,
        'Kategori': item.category.name,
        'Seri No': item.serialNumber || '-',
        'Marka': item.brand || '-',
        'Model': item.model || '-',
        'Durum': item.status,
        'Son Bakım': item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString('tr-TR') : '-',
        'Sonraki Bakım': item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString('tr-TR') : '-',
      }));

      const equipmentSheet = XLSX.utils.json_to_sheet(equipmentData);
      XLSX.utils.book_append_sheet(workbook, equipmentSheet, 'Ekipman');
    }

    // Transfer sayfası
    const transferData = transfers.flatMap(transfer => {
      const inventoryMovements = transfer.inventory.map(item => ({
        'Tarih': new Date(transfer.date).toLocaleString('tr-TR'),
        'İşlem Tipi': transfer.type === 'IN' ? 'Giriş' : transfer.type === 'OUT' ? 'Çıkış' : 'Transfer',
        'Ürün': item.inventory.name,
        'Miktar': item.quantity,
        'Birim': item.inventory.unit,
        'Kaynak': transfer.source?.name || '-',
        'Hedef': transfer.target?.name || '-',
        'Durum': transfer.status,
        'Oluşturan': transfer.createdBy.name,
      }));

      const equipmentMovements = transfer.equipment.map(item => ({
        'Tarih': new Date(transfer.date).toLocaleString('tr-TR'),
        'İşlem Tipi': transfer.type === 'IN' ? 'Giriş' : transfer.type === 'OUT' ? 'Çıkış' : 'Transfer',
        'Ekipman': item.equipment.name,
        'Miktar': 1,
        'Birim': 'adet',
        'Kaynak': transfer.source?.name || '-',
        'Hedef': transfer.target?.name || '-',
        'Durum': transfer.status,
        'Oluşturan': transfer.createdBy.name,
      }));

      return [...inventoryMovements, ...equipmentMovements];
    });

    const transferSheet = XLSX.utils.json_to_sheet(transferData);
    XLSX.utils.book_append_sheet(workbook, transferSheet, 'Transferler');

    // Excel dosyasını oluştur
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Response header'larını ayarla
    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename="depo-raporu.xlsx"');
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Excel raporu oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Excel raporu oluşturulamadı' },
      { status: 500 }
    );
  }
} 