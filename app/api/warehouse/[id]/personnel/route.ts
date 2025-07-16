import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/warehouse/[id]/personnel
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const personnel = await prisma.warehousePersonnel.findMany({
      where: {
        warehouseId: params.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Personel listesi getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Personel listesi getirilemedi' },
      { status: 500 }
    );
  }
}

// POST /api/warehouse/[id]/personnel
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
    const { userId, position, department, notes } = body;

    const personnel = await prisma.warehousePersonnel.create({
      data: {
        warehouseId: params.id,
        userId,
        position,
        department,
        notes,
        status: 'ACTIVE',
        startDate: new Date(),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Personel eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Personel eklenemedi' },
      { status: 500 }
    );
  }
}

// PATCH /api/warehouse/[id]/personnel
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
    const { personnelId, position, department, status } = body;

    const personnel = await prisma.warehousePersonnel.update({
      where: {
        id: personnelId,
        warehouseId: params.id,
      },
      data: {
        position,
        department,
        status,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Personel güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Personel güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouse/[id]/personnel
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
    const personnelId = searchParams.get('personnelId');

    if (!personnelId) {
      return NextResponse.json(
        { error: 'Personel ID gerekli' },
        { status: 400 }
      );
    }

    await prisma.warehousePersonnel.delete({
      where: {
        id: personnelId,
        warehouseId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Personel silinirken hata:', error);
    return NextResponse.json(
      { error: 'Personel silinemedi' },
      { status: 500 }
    );
  }
} 