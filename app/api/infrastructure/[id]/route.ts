import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/infrastructure/[id] - Belirli bir altyapıyı getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const infrastructure = await prisma.infrastructure.findUnique({
      where: { id: params.id },
      include: {
        warehouses: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
      },
    });

    if (!infrastructure) {
      return NextResponse.json({ error: 'Infrastructure not found' }, { status: 404 });
    }

    return NextResponse.json(infrastructure);
  } catch (error) {
    console.error('Altyapı bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/infrastructure/[id] - Belirli bir altyapıyı güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Altyapının var olup olmadığını kontrol et
    const existingInfrastructure = await prisma.infrastructure.findUnique({
      where: { id: params.id },
    });

    if (!existingInfrastructure) {
      return NextResponse.json({ error: 'Infrastructure not found' }, { status: 404 });
    }

    // Altyapı adının benzersiz olup olmadığını kontrol et
    if (data.name && data.type && (data.name !== existingInfrastructure.name || data.type !== existingInfrastructure.type)) {
      const duplicateInfrastructure = await prisma.infrastructure.findFirst({
        where: {
          name: data.name,
          type: data.type,
          NOT: {
            id: params.id,
          },
        },
      });
      if (duplicateInfrastructure) {
        return NextResponse.json(
          { error: 'Infrastructure with this name and type already exists' },
          { status: 400 }
        );
      }
    }

    // Altyapıyı güncelle
    const infrastructure = await prisma.infrastructure.update({
      where: { id: params.id },
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        status: data.status,
        capacity: data.capacity,
        unit: data.unit,
      },
      include: {
        warehouses: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(infrastructure);
  } catch (error) {
    console.error('Altyapı güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/infrastructure/[id] - Belirli bir altyapıyı sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Altyapının var olup olmadığını kontrol et
    const infrastructure = await prisma.infrastructure.findUnique({
      where: { id: params.id },
      include: {
        warehouses: true,
      },
    });

    if (!infrastructure) {
      return NextResponse.json({ error: 'Infrastructure not found' }, { status: 404 });
    }

    // Altyapıya bağlı depo varsa silmeyi engelle
    if (infrastructure.warehouses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete infrastructure with existing warehouses' },
        { status: 400 }
      );
    }

    // Altyapıyı sil
    await prisma.infrastructure.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Infrastructure deleted successfully' });
  } catch (error) {
    console.error('Altyapı silinirken hata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 