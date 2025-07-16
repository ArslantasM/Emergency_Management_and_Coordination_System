import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type'); // 'stock', 'transfer', 'summary'

    // Excel dosyası oluştur
    const workbook = new ExcelJS.Workbook();
    workbook.creator = session.user?.name || 'Sistem';
    workbook.created = new Date();

    // Stok durumu sayfası
    if (reportType === 'stock' || reportType === 'summary') {
      const stockSheet = workbook.addWorksheet('Stok Durumu');
      stockSheet.columns = [
        { header: 'Ürün Kodu', key: 'item_code', width: 15 },
        { header: 'Ürün Adı', key: 'item_name', width: 30 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Miktar', key: 'quantity', width: 15 },
        { header: 'Birim', key: 'unit', width: 10 },
        { header: 'Minimum Stok', key: 'min_stock', width: 15 },
        { header: 'Son Güncelleme', key: 'updated_at', width: 20 }
      ];

      const stockData = await prisma.inventory.findMany({
        where: { warehouseId },
        include: { category: true }
      });

      stockSheet.addRows(stockData.map(item => ({
        item_code: item.item_code,
        item_name: item.item_name,
        category: item.category.name,
        quantity: item.quantity,
        unit: item.unit,
        min_stock: item.min_stock,
        updated_at: item.updatedAt.toLocaleString('tr-TR')
      })));
    }

    // Transfer işlemleri sayfası
    if (reportType === 'transfer' || reportType === 'summary') {
      const transferSheet = workbook.addWorksheet('Transfer İşlemleri');
      transferSheet.columns = [
        { header: 'İşlem No', key: 'id', width: 15 },
        { header: 'İşlem Tipi', key: 'type', width: 15 },
        { header: 'Tarih', key: 'date', width: 20 },
        { header: 'Teslim Eden', key: 'issuedBy', width: 25 },
        { header: 'Teslim Alan', key: 'receivedBy', width: 25 },
        { header: 'Durum', key: 'status', width: 15 },
        { header: 'Açıklama', key: 'description', width: 30 }
      ];

      const transferData = await prisma.transferLog.findMany({
        where: {
          warehouseId,
          date: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined
          }
        },
        include: {
          issuedBy: true,
          receivedBy: true
        }
      });

      transferSheet.addRows(transferData.map(transfer => ({
        id: transfer.id,
        type: transfer.type === 'ENTRY' ? 'Giriş' : 'Çıkış',
        date: transfer.date.toLocaleString('tr-TR'),
        issuedBy: transfer.issuedBy.name,
        receivedBy: transfer.receivedBy.name,
        status: transfer.status === 'PENDING' ? 'Bekliyor' :
                transfer.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi',
        description: transfer.description || '-'
      })));
    }

    // Özet sayfası
    if (reportType === 'summary') {
      const summarySheet = workbook.addWorksheet('Özet');
      
      // Kategori bazlı stok dağılımı
      const categoryData = await prisma.inventory.groupBy({
        by: ['categoryId'],
        where: { warehouseId },
        _sum: { quantity: true },
        _count: true
      });

      summarySheet.addRow(['Kategori Bazlı Stok Dağılımı']);
      summarySheet.addRow(['Kategori', 'Toplam Ürün', 'Toplam Miktar']);
      for (const category of categoryData) {
        const categoryName = await prisma.category.findUnique({
          where: { id: category.categoryId }
        });
        summarySheet.addRow([
          categoryName?.name || 'Bilinmeyen',
          category._count,
          category._sum.quantity || 0
        ]);
      }

      // Transfer istatistikleri
      const transferStats = await prisma.transferLog.groupBy({
        by: ['type'],
        where: {
          warehouseId,
          date: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined
          }
        },
        _count: true
      });

      summarySheet.addRow([]);
      summarySheet.addRow(['Transfer İstatistikleri']);
      summarySheet.addRow(['İşlem Tipi', 'İşlem Sayısı']);
      for (const stat of transferStats) {
        summarySheet.addRow([
          stat.type === 'ENTRY' ? 'Giriş' : 'Çıkış',
          stat._count
        ]);
      }
    }

    // Excel dosyasını buffer'a dönüştür
    const buffer = await workbook.xlsx.writeBuffer();

    // Response header'larını ayarla
    const headers = new Headers();
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.append('Content-Disposition', `attachment; filename=depo_raporu_${new Date().toISOString().split('T')[0]}.xlsx`);

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Excel raporu oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Excel raporu oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 