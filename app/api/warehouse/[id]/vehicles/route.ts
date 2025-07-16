import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Araç listesini getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const vehicles = await prisma.warehouseVehicle.findMany({
      where: {
        warehouseId: params.id,
      },
      include: {
        assignedDrivers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Araç listesi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Araç listesi alınamadı' },
      { status: 500 }
    );
  }
}

// Yeni araç ekle
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();

    // Plaka numarasının benzersiz olduğunu kontrol et
    const existingVehicle = await prisma.warehouseVehicle.findUnique({
      where: {
        plateNumber: data.plateNumber,
      },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Bu plaka numarası zaten kullanımda' },
        { status: 400 }
      );
    }

    const vehicle = await prisma.warehouseVehicle.create({
      data: {
        plateNumber: data.plateNumber,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year,
        warehouseId: params.id,
        lastMaintenance: data.lastMaintenance,
        nextMaintenance: data.nextMaintenance,
        notes: data.notes,
        assignedDrivers: {
          connect: data.driverIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        assignedDrivers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Araç eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Araç eklenemedi' },
      { status: 500 }
    );
  }
}

// Araç güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();
    const { vehicleId, driverIds, ...updateData } = data;

    const vehicle = await prisma.warehouseVehicle.update({
      where: {
        id: vehicleId,
        warehouseId: params.id,
      },
      data: {
        ...updateData,
        assignedDrivers: {
          set: driverIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        assignedDrivers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Araç güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Araç güncellenemedi' },
      { status: 500 }
    );
  }
}

// Araç sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Araç ID gerekli' },
        { status: 400 }
      );
    }

    await prisma.warehouseVehicle.delete({
      where: {
        id: vehicleId,
        warehouseId: params.id,
      },
    });

    return NextResponse.json({ message: 'Araç başarıyla silindi' });
  } catch (error) {
    console.error('Araç silinirken hata:', error);
    return NextResponse.json(
      { error: 'Araç silinemedi' },
      { status: 500 }
    );
  }
} 