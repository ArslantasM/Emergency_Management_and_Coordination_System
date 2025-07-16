import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Kullanıcı detayı
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Kullanıcı kendi bilgilerini veya admin/bölge yöneticisi diğer kullanıcıların bilgilerini görebilir
    if (
      session.user.id !== params.id &&
      !['admin', 'regional_manager'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Kullanıcı güncelleme
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Kullanıcı kendi bilgilerini veya admin/bölge yöneticisi diğer kullanıcıların bilgilerini güncelleyebilir
    if (
      session.user.id !== params.id &&
      !['admin', 'regional_manager'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      role, 
      organization, 
      department, 
      position, 
      region,
      regions 
    } = body;

    // Email değiştirilmişse kontrol et
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: parseInt(params.id) }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {
      name,
      email,
      organization,
      department,
      position,
      region,
      updated_at: new Date()
    };

    // Sadece admin rol değiştirebilir
    if (session.user.role === 'admin' && role) {
      updateData.role = role;
    }

    // Şifre değiştirilmişse hash'le
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    // Kullanıcıyı güncelle
    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: updateData
    });

    // Bölge ilişkilerini güncelle
    if (regions) {
      // Mevcut ilişkileri sil
      await prisma.userRegion.deleteMany({
        where: { user_id: user.id }
      });

      // Yeni ilişkileri oluştur
      if (regions.length > 0) {
        await prisma.userRegion.createMany({
          data: regions.map((regionId: number) => ({
            user_id: user.id,
            region_id: regionId
          }))
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Kullanıcı silme
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Önce kullanıcının bölge ilişkilerini sil
    await prisma.userRegion.deleteMany({
      where: { user_id: parseInt(params.id) }
    });

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 