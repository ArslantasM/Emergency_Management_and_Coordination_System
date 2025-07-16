import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock chat messages data
const mockMessages = [
  {
    id: '1',
    content: 'Acil durum tatbikatı için hazırlıklar tamamlandı mı?',
    sender: 'Mehmet Demir',
    senderRole: 'MANAGER',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'text'
  },
  {
    id: '2',
    content: 'Evet, tüm ekipler bilgilendirildi. Yarın saat 10:00\'da başlıyoruz.',
    sender: 'Ayşe Şahin',
    senderRole: 'STAFF',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    type: 'text'
  },
  {
    id: '3',
    content: 'Jeneratör #3\'te arıza var. Bakım ekibini bilgilendirdim.',
    sender: 'Ali Veli',
    senderRole: 'STAFF',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    type: 'alert'
  },
  {
    id: '4',
    content: 'Yeni gönüllü kayıtları için eğitim programı hazırlandı.',
    sender: 'Fatma Kaya',
    senderRole: 'REGIONAL_MANAGER',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    type: 'info'
  },
  {
    id: '5',
    content: 'Envanter sayımı tamamlandı. Rapor hazırlanıyor.',
    sender: 'Zeynep Özkan',
    senderRole: 'STAFF',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    type: 'text'
  },
  {
    id: '6',
    content: 'Kayseri bölgesinde 4.2 büyüklüğünde deprem kaydedildi.',
    sender: 'Sistem',
    senderRole: 'SYSTEM',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    type: 'emergency'
  },
  {
    id: '7',
    content: 'Tüm birimler teyakkuz durumuna geçti.',
    sender: 'Ahmet Yılmaz',
    senderRole: 'ADMIN',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: 'alert'
  },
  {
    id: '8',
    content: 'Saha ekipleri bölgeye sevk edildi.',
    sender: 'Mehmet Demir',
    senderRole: 'MANAGER',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    type: 'info'
  },
  {
    id: '9',
    content: 'İlk değerlendirmeler olumlu. Hasar raporu hazırlanıyor.',
    sender: 'Ayşe Şahin',
    senderRole: 'STAFF',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: 'text'
  },
  {
    id: '10',
    content: 'Durum normal. Teyakkuz durumu kaldırıldı.',
    sender: 'Ahmet Yılmaz',
    senderRole: 'ADMIN',
    timestamp: new Date().toISOString(),
    type: 'success'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const type = searchParams.get('type');

    // Filter messages
    let filteredMessages = [...mockMessages];

    if (type) {
      filteredMessages = filteredMessages.filter(m => m.type === type);
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      filteredMessages = filteredMessages.slice(-limitNum); // Get last N messages
    }

    // Sort by timestamp (newest last for chat display)
    filteredMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return NextResponse.json({
      messages: filteredMessages,
      total: filteredMessages.length
    });

  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, type = 'text' } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: session.user.name || 'Kullanıcı',
      senderRole: session.user.role || 'USER',
      timestamp: new Date().toISOString(),
      type: type
    };

    // Add to mock messages (in real app, this would be saved to database)
    mockMessages.push(newMessage);

    return NextResponse.json({
      message: newMessage,
      success: true
    });

  } catch (error) {
    console.error('Send message API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 