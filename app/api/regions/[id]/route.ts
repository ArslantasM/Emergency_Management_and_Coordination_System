import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Bölge detayı
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;

    const region = await prisma.region.findUnique({
      where: { id: id },
      include: {
        countries: {
          include: {
            country: true
          }
        },
        cities: {
          include: {
            city: true
          }
        },
        districts: {
          include: {
            district: true
          }
        },
        towns: {
          include: {
            town: true
          }
        }
      }
    });

    if (!region) {
      return NextResponse.json({ error: 'Bölge bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({
      ...region,
      countries: region.countries.map(rc => rc.country),
      cities: region.cities.map(rc => rc.city),
      districts: region.districts.map(rd => rd.district),
      towns: region.towns.map(rt => rt.town)
    });
  } catch (error) {
    console.error('Bölge detayı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Bölge detayı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Bölge güncelleme
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    // Mevcut ilişkileri sil
    await prisma.regionCountry.deleteMany({ where: { region_id: id } });
    await prisma.regionCity.deleteMany({ where: { region_id: id } });
    await prisma.regionDistrict.deleteMany({ where: { region_id: id } });
    await prisma.regionTown.deleteMany({ where: { region_id: id } });

    // Bölgeyi güncelle
    const region = await prisma.region.update({
      where: { id: id },
      data: {
        name: data.name,
        description: data.description,
        region_type: data.region_type,
        emergency_level: data.emergency_level
      }
    });

    // Yeni lokasyonları ekle
    if (data.locations && data.locations.length > 0) {
      for (const location of data.locations) {
        const [type, locationId] = location.split('-');
        
        switch (type) {
          case 'country':
            await prisma.regionCountry.create({
              data: { region_id: id, country_id: locationId }
            });
            break;
          case 'city':
            await prisma.regionCity.create({
              data: { region_id: id, city_id: locationId }
            });
            break;
          case 'district':
            await prisma.regionDistrict.create({
              data: { region_id: id, district_id: locationId }
            });
            break;
          case 'town':
            await prisma.regionTown.create({
              data: { region_id: id, town_id: locationId }
            });
            break;
        }
      }
    }

    return NextResponse.json(region);
  } catch (error) {
    console.error('Bölge güncellenirken hata:', error);
    return NextResponse.json({ error: 'Bölge güncellenemedi' }, { status: 500 });
  }
}

// Bölge silme
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await params;

    // Önce ilişkileri sil
    await prisma.regionCountry.deleteMany({ where: { region_id: id } });
    await prisma.regionCity.deleteMany({ where: { region_id: id } });
    await prisma.regionDistrict.deleteMany({ where: { region_id: id } });
    await prisma.regionTown.deleteMany({ where: { region_id: id } });

    // Sonra bölgeyi sil
    await prisma.region.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Bölge başarıyla silindi' });
  } catch (error) {
    console.error('Bölge silinirken hata:', error);
    return NextResponse.json({ error: 'Bölge silinemedi' }, { status: 500 });
  }
} 