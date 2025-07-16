import { NextResponse } from 'next/server';
import { PrismaClient, TransferStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Transfer detayı
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const transfer = await prisma.transferLog.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            inventory: true,
            equipment: true
          }
        },
        issuedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receivedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Transfer detayı hatası:', error);
    return NextResponse.json({ error: 'Transfer detayı alınamadı' }, { status: 500 });
  }
}

// Transfer durumu güncelleme
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const data = await request.json();
    const { status } = data;

    const transfer = await prisma.transferLog.update({
      where: { id: params.id },
      data: {
        status: status as TransferStatus,
        updatedAt: new Date()
      },
      include: {
        items: true,
        issuedBy: true,
        receivedBy: true,
        warehouse: true
      }
    });

    return NextResponse.json(transfer);
  } catch (error) {
    console.error('Transfer güncelleme hatası:', error);
    return NextResponse.json({ error: 'Transfer güncellenemedi' }, { status: 500 });
  }
}

// Transfer silme
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    // Önce transfer öğelerini sil
    await prisma.transferItem.deleteMany({
      where: { transferId: params.id }
    });

    // Sonra transfer kaydını sil
    await prisma.transferLog.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Transfer başarıyla silindi' });
  } catch (error) {
    console.error('Transfer silme hatası:', error);
    return NextResponse.json({ error: 'Transfer silinemedi' }, { status: 500 });
  }
} 