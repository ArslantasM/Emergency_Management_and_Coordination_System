import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// Bildirim türleri
enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

// Bildirim kaynakları
enum NotificationSource {
  EQUIPMENT = 'EQUIPMENT',
  INVENTORY = 'INVENTORY',
  TASK = 'TASK',
  VOLUNTEER = 'VOLUNTEER',
  PERSONNEL = 'PERSONNEL',
  SYSTEM = 'SYSTEM',
}

// Bildirim durumu
enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
  ARCHIVED = 'archived',
}

// Demo bildirim verileri
const mockNotifications = [
  {
    id: '1',
    title: 'Düşük Stok Uyarısı: N95 Maske',
    message: 'N95 Maske stok seviyesi 50 adete düştü (minimum: 100)',
    type: NotificationType.WARNING,
    source: NotificationSource.INVENTORY,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/inventory',
    action: 'Stok Ekle'
  },
  {
    id: '2',
    title: 'Ekipman Bakım Zamanı',
    message: 'Jeneratör X5000 için planlanan bakım tarihi geldi',
    type: NotificationType.INFO,
    source: NotificationSource.EQUIPMENT,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/equipment',
    action: 'Bakım Planla'
  },
  {
    id: '3',
    title: 'Son Kullanma Tarihi Yaklaşıyor',
    message: 'Hazır Gıda Paketi ürünü için son kullanma tarihi 30 gün içinde',
    type: NotificationType.WARNING,
    source: NotificationSource.INVENTORY,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/inventory',
  },
  {
    id: '4',
    title: 'Gecikmiş Görev',
    message: 'Afet bölgesi değerlendirme raporu teslim tarihi geçti',
    type: NotificationType.ERROR,
    source: NotificationSource.TASK,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/tasks',
    action: 'Göreve Git'
  },
  {
    id: '5',
    title: 'Yeni Eğitim İçeriği',
    message: 'Gönüllüler için yeni bir eğitim videosu eklendi: İlk Yardım Temel Eğitimi',
    type: NotificationType.SUCCESS,
    source: NotificationSource.VOLUNTEER,
    status: NotificationStatus.READ,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/volunteers/training',
    action: 'İçeriği Gör'
  },
  {
    id: '6',
    title: 'Ekipman Arızası Bildirimi',
    message: 'Taktik Telsiz Seti arıza bildirimi yapıldı',
    type: NotificationType.ERROR,
    source: NotificationSource.EQUIPMENT,
    status: NotificationStatus.READ,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/equipment',
    action: 'Arıza Kaydını Gör'
  },
  {
    id: '7',
    title: 'Yeni Görev Atandı',
    message: 'Size yeni bir görev atandı: Saha ekibi koordinasyonu',
    type: NotificationType.INFO,
    source: NotificationSource.TASK,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/tasks',
    action: 'Göreve Git'
  },
  {
    id: '8',
    title: 'İzin Talebi Onaylandı',
    message: 'Mehmet Demir için izin talebi onaylandı: 15-20 Kasım 2023',
    type: NotificationType.SUCCESS,
    source: NotificationSource.PERSONNEL,
    status: NotificationStatus.READ,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/personnel',
  },
  {
    id: '9',
    title: 'Sistem Bakımı Planlandı',
    message: 'Sistem bakımı nedeniyle platform 24 Kasım 02:00-05:00 saatleri arasında hizmet vermeyecektir',
    type: NotificationType.INFO,
    source: NotificationSource.SYSTEM,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    title: 'Yeni Gönüllü Başvurusu',
    message: '5 yeni gönüllü başvurusu değerlendirme bekliyor',
    type: NotificationType.INFO,
    source: NotificationSource.VOLUNTEER,
    status: NotificationStatus.UNREAD,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    link: '/dashboard/volunteers',
    action: 'Başvuruları İncele'
  }
];

// GET - Bildirimleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const limit = searchParams.get('limit');
    const isStats = searchParams.get('stats') === 'true';

    // Stats endpoint
    if (isStats) {
      const stats = {
        all: mockNotifications.length,
        unread: mockNotifications.filter(n => n.status === NotificationStatus.UNREAD).length,
        read: mockNotifications.filter(n => n.status === NotificationStatus.READ).length,
        warning: mockNotifications.filter(n => n.type === NotificationType.WARNING).length,
        error: mockNotifications.filter(n => n.type === NotificationType.ERROR).length,
        info: mockNotifications.filter(n => n.type === NotificationType.INFO).length,
        success: mockNotifications.filter(n => n.type === NotificationType.SUCCESS).length,
        inventory: mockNotifications.filter(n => n.source === NotificationSource.INVENTORY).length,
        equipment: mockNotifications.filter(n => n.source === NotificationSource.EQUIPMENT).length,
        tasks: mockNotifications.filter(n => n.source === NotificationSource.TASK).length,
        volunteers: mockNotifications.filter(n => n.source === NotificationSource.VOLUNTEER).length,
        personnel: mockNotifications.filter(n => n.source === NotificationSource.PERSONNEL).length,
        system: mockNotifications.filter(n => n.source === NotificationSource.SYSTEM).length
      };
      
      return NextResponse.json({ stats });
    }

    // Filter notifications
    let filteredNotifications = [...mockNotifications];

    if (status) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (source) {
      filteredNotifications = filteredNotifications.filter(n => 
        n.source === source.toUpperCase()
      );
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      filteredNotifications = filteredNotifications.slice(0, limitNum);
    }

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: filteredNotifications,
      total: filteredNotifications.length
    });

  } catch (error) {
    console.error('Bildirimler alınırken hata:', error);
    return NextResponse.json(
      { error: 'Bildirimler alınamadı' },
      { status: 500 }
    );
  }
}

// POST - Yeni bildirim oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Gerekli alanları kontrol et
    if (!data.title || !data.description || !data.type || !data.emergencyType) {
      return NextResponse.json(
        { error: 'Başlık, açıklama, tür ve acil durum türü gerekli' },
        { status: 400 }
      );
    }

    // Yeni bildirim oluştur
    const newNotification = {
      id: (mockNotifications.length + 1).toString(),
      title: data.title,
      message: data.description,
      type: data.type,
      source: data.source || NotificationSource.SYSTEM,
      status: NotificationStatus.UNREAD,
      createdAt: new Date().toISOString(),
      emergencyType: data.emergencyType,
      location: data.location,
      coordinates: data.coordinates,
      targetGroup: data.targetGroup,
      urgent: data.urgent || false,
      scheduledAt: data.scheduledAt,
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
      link: getNotificationLink(data.emergencyType),
      action: getNotificationAction(data.emergencyType)
    };

    // Mock verilere ekle (gerçek uygulamada veritabanına kaydedilecek)
    mockNotifications.unshift(newNotification);

    // Bildirim gönderme simülasyonu
    console.log(`📢 Yeni bildirim oluşturuldu: ${newNotification.title}`);
    console.log(`🎯 Hedef grup: ${data.targetGroup}`);
    console.log(`📍 Konum: ${data.location}`);
    
    return NextResponse.json({
      success: true,
      notification: newNotification,
      message: 'Bildirim başarıyla oluşturuldu ve gönderildi'
    });

  } catch (error) {
    console.error('Bildirim oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Bildirim oluşturulamadı' },
      { status: 500 }
    );
  }
}

// PUT - Bildirim durumunu güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID ve status gerekli' },
        { status: 400 }
      );
    }

    // Mock veri güncelleme (gerçek uygulamada veritabanı güncellenecek)
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Bildirim bulunamadı' },
        { status: 404 }
      );
    }

    mockNotifications[notificationIndex].status = status.toLowerCase();

    return NextResponse.json({
      success: true,
      notification: mockNotifications[notificationIndex]
    });

  } catch (error) {
    console.error('Bildirim güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Bildirim güncellenemedi' },
      { status: 500 }
    );
  }
}

// Yardımcı fonksiyonlar
function getNotificationLink(emergencyType: string): string {
  switch (emergencyType) {
    case 'earthquake':
      return '/dashboard/map';
    case 'fire':
      return '/dashboard/equipment';
    case 'flood':
      return '/dashboard/tasks';
    case 'storm':
      return '/dashboard/notifications';
    case 'exercise':
      return '/dashboard/volunteers';
    default:
      return '/dashboard/notifications';
  }
}

function getNotificationAction(emergencyType: string): string {
  switch (emergencyType) {
    case 'earthquake':
      return 'Haritayı Gör';
    case 'fire':
      return 'Ekipleri Gör';
    case 'flood':
      return 'Görevleri Gör';
    case 'storm':
      return 'Detayları Gör';
    case 'exercise':
      return 'Katıl';
    default:
      return 'Detayları Gör';
  }
} 
