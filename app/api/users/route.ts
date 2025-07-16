import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// UserStatus enum - Prisma schema ile uyumlu
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// Kullanıcı listesi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const isStats = searchParams.get('stats') === 'true';

    // Stats endpoint
    if (isStats) {
      try {
        const totalUsers = await prisma.user.count();
        const activeUsers = await prisma.user.count({
          where: {
            status: UserStatus.ACTIVE
          }
        });
        const usersByRole = await prisma.user.groupBy({
          by: ['role'],
          _count: {
            role: true
          }
        });

        const roleStats = usersByRole.reduce((acc: any, item: any) => {
          acc[item.role.toLowerCase()] = item._count.role;
          return acc;
        }, {});

        const stats = {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          ...roleStats
        };

        return NextResponse.json({ stats });
      } catch (error) {
        // Fallback to demo data if database query fails
        const demoStats = {
          total: 6,
          active: 4,
          inactive: 2,
          admin: 1,
          regional_manager: 1,
          manager: 1,
          staff: 1,
          volunteer: 1,
          citizen: 1
        };
        return NextResponse.json({ stats: demoStats });
      }
    }

    // Regular user list
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organization: true,
          department: true,
          position: true,
          status: true,
          createdAt: true,
          regions: {
            select: {
              region: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        where: status ? {
          status: status.toUpperCase() as UserStatus
        } : undefined,
        take: limit ? parseInt(limit) : undefined,
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ users });
    } catch (error) {
      console.error('Database query failed:', error);
      
      // Fallback to demo data
      const demoUsers = [
        {
          id: '1',
          name: 'Ahmet Yılmaz',
          email: 'admin@ornek.com',
          role: 'ADMIN',
          organization: 'AFAD',
          department: 'Bilgi İşlem',
          position: 'Sistem Yöneticisi',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          regions: [{ name: 'Türkiye' }]
        },
        {
          id: '2',
          name: 'Fatma Kaya',
          email: 'byonetici@ornek.com',
          role: 'REGIONAL_MANAGER',
          organization: 'AFAD',
          department: 'Operasyon',
          position: 'Bölge Müdürü',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          regions: [{ name: 'İç Anadolu' }]
        },
        {
          id: '3',
          name: 'Mehmet Demir',
          email: 'kyonetici@ornek.com',
          role: 'MANAGER',
          organization: 'AFAD',
          department: 'Planlama',
          position: 'Kurum Müdürü',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          regions: [{ name: 'Kayseri' }]
        },
        {
          id: '4',
          name: 'Ayşe Şahin',
          email: 'personel@ornek.com',
          role: 'STAFF',
          organization: 'AFAD',
          department: 'Saha',
          position: 'Uzman',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          regions: [{ name: 'Kayseri' }]
        }
      ];

      const filteredUsers = status ? 
        demoUsers.filter(user => user.status === status.toUpperCase()) : 
        demoUsers;

      const limitedUsers = limit ? 
        filteredUsers.slice(0, parseInt(limit)) : 
        filteredUsers;

      return NextResponse.json({ users: limitedUsers });
    }

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Yeni kullanıcı oluşturma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'regional_manager'].includes(session.user.role)) {
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

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      );
    }

    // Şifre hash'leme
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Kullanıcı oluşturma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role,
        organization,
        department,
        position,
        region
      }
    });

    // Bölge ilişkilerini oluşturma
    if (regions && regions.length > 0) {
      await prisma.userRegion.createMany({
        data: regions.map((regionId: number) => ({
          user_id: user.id,
          region_id: regionId
        }))
      });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      department: user.department,
      position: user.position,
      region: user.region
    });
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 