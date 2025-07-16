import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/warehouse/[id]/stock
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const stock = await prisma.inventory.findMany({
      where: {
        warehouseId: params.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Stok listesi getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Stok listesi getirilemedi' },
      { status: 500 }
    );
  }
}

// POST /api/warehouse/[id]/stock
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, name, code, description, quantity, unit, minQuantity, maxQuantity, expiryDate } = body;

    const stock = await prisma.inventory.create({
      data: {
        warehouseId: params.id,
        categoryId,
        name,
        code,
        description,
        quantity,
        unit,
        minQuantity,
        maxQuantity,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Stok eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Stok eklenemedi' },
      { status: 500 }
    );
  }
}

// PATCH /api/warehouse/[id]/stock
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const body = await request.json();
    const { stockId, quantity, ...updateData } = body;

    // Önce mevcut stok durumunu kontrol et
    const currentStock = await prisma.inventory.findUnique({
      where: {
        id: stockId,
        warehouseId: params.id,
      },
    });

    if (!currentStock) {
      return NextResponse.json(
        { error: 'Stok bulunamadı' },
        { status: 404 }
      );
    }

    // Yeni stok miktarını hesapla
    const newQuantity = quantity !== undefined
      ? currentStock.quantity + quantity
      : currentStock.quantity;

    // Stok durumunu güncelle
    const stock = await prisma.inventory.update({
      where: {
        id: stockId,
        warehouseId: params.id,
      },
      data: {
        ...updateData,
        quantity: newQuantity,
        status: newQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Stok güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Stok güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouse/[id]/stock
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get('stockId');

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stok ID gerekli' },
        { status: 400 }
      );
    }

    await prisma.inventory.delete({
      where: {
        id: stockId,
        warehouseId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stok silinirken hata:', error);
    return NextResponse.json(
      { error: 'Stok silinemedi' },
      { status: 500 }
    );
  }
} 