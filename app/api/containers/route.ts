import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing
const mockCamps = [
  {
    id: '1',
    name: 'Atatürk Konteyner Kenti',
    type: 'CONTAINER',
    location: 'Ankara, Çankaya',
    capacity: 500,
    currentOccupancy: 320,
    status: 'ACTIVE',
    description: '616 Konteynerdan oluşan konteyner kent',
    establishmentDate: '2024-01-15',
    region: { id: '1', name: 'Ankara', type: 'PROVINCE' },
    _count: {
      residents: 320,
      sectors: 4,
      resources: 25,
      healthServices: 12,
      securityLogs: 3
    }
  },
  {
    id: '2',
    name: 'Zafer Çadır Kenti',
    type: 'TENT',
    location: 'İstanbul, Beylikdüzü',
    capacity: 800,
    currentOccupancy: 650,
    status: 'ACTIVE',
    description: 'Geçici barınma çadır kenti',
    establishmentDate: '2024-02-10',
    region: { id: '2', name: 'İstanbul', type: 'PROVINCE' },
    _count: {
      residents: 650,
      sectors: 6,
      resources: 40,
      healthServices: 18,
      securityLogs: 2
    }
  },
  {
    id: '3',
    name: 'Cumhuriyet Karma Kenti',
    type: 'MIXED',
    location: 'İzmir, Bornova',
    capacity: 350,
    currentOccupancy: 280,
    status: 'ACTIVE',
    description: 'Konteyner ve çadır karma yerleşim',
    establishmentDate: '2024-03-05',
    region: { id: '3', name: 'İzmir', type: 'PROVINCE' },
    _count: {
      residents: 280,
      sectors: 3,
      resources: 30,
      healthServices: 8,
      securityLogs: 1
    }
  }
];

// GET - Tüm kampları listele
export async function GET(request: NextRequest) {
  try {
    console.log(' CampSite listesi isteniyor...');
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredCamps = mockCamps;
    
    if (type) {
      filteredCamps = filteredCamps.filter(camp => camp.type === type);
    }
    if (status) {
      filteredCamps = filteredCamps.filter(camp => camp.status === status);
    }

    const total = filteredCamps.length;
    const paginatedCamps = filteredCamps.slice(offset, offset + limit);

    console.log(` ${paginatedCamps.length} kamp döndürüldü`);

    return NextResponse.json({
      success: true,
      data: paginatedCamps,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error(' CampSite listesi hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Kamp listesi alınamadı' },
      { status: 500 }
    );
  }
}

// POST - Yeni kamp oluştur
export async function POST(request: NextRequest) {
  try {
    console.log(' Yeni CampSite oluşturuluyor...');
    
    const body = await request.json();
    console.log(' Alınan veri:', body);

    const {
      name,
      type,
      location,
      capacity,
      startDate,
      description
    } = body;

    if (!name || !type || !location || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    const typeMapping = {
      'container': 'CONTAINER',
      'tent': 'TENT', 
      'mixed': 'MIXED',
      'other': 'OTHER'
    };
    
    const mappedType = typeMapping[type.toLowerCase()];
    if (!mappedType) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kamp tipi' },
        { status: 400 }
      );
    }

    const newCamp = {
      id: (mockCamps.length + 1).toString(),
      name,
      type: mappedType,
      location: location,
      capacity: parseInt(capacity),
      currentOccupancy: 0,
      status: 'ACTIVE',
      description: description || null,
      establishmentDate: startDate || new Date().toISOString().split('T')[0],
      region: { id: '1', name: 'Varsayılan Bölge', type: 'PROVINCE' },
      _count: {
        residents: 0,
        sectors: 0,
        resources: 0,
        healthServices: 0,
        securityLogs: 0
      }
    };

    mockCamps.push(newCamp);

    console.log(' CampSite oluşturuldu:', newCamp.id);

    return NextResponse.json({
      success: true,
      data: newCamp,
      message: `${mappedType === 'CONTAINER' ? ' Konteyner' : mappedType === 'TENT' ? ' Çadır' : mappedType === 'MIXED' ? ' Karma' : ' Diğer'} Kent başarıyla oluşturuldu`
    });

  } catch (error) {
    console.error(' CampSite oluşturma hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Kamp oluşturulamadı: ' + error.message },
      { status: 500 }
    );
  }
}
