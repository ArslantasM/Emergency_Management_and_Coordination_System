import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing - detaylı bilgiler ile
const mockCampsDetails: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Atatürk Konteyner Kenti',
    type: 'CONTAINER',
    location: 'Ankara, Çankaya',
    capacity: 500,
    currentOccupancy: 320,
    status: 'ACTIVE',
    description: '616 Konteynerdan oluşan konteyner kent',
    establishedDate: '2024-01-15',
    
    // Detay alanları
    isGrantFunded: true,
    hasWaterTreatment: true,
    wasteCapacity: 2.5,
    livingAreaCount: 250,
    serviceAreaCount: 15,
    recreationAreaCount: 8,
    
    // Altyapı
    hasElectricity: true,
    hasSewerage: true,
    hasInternet: true,
    
    // Bakanlık Hizmetleri
    hasHealthMinistryServices: true,
    hasFamilyMinistryServices: true,
    hasHealthCenter: true,
    hasTraumaCenter: true,
    hasPharmacy: true,
    hasSocialServiceCenter: true,
    hasEducationServices: true,
    
    // Notlar
    notes: 'Ana konteyner kent. Tam donanımlı altyapı mevcut. Düzenli bakım yapılmaktadır.'
  },
  '2': {
    id: '2',
    name: 'Zafer Çadır Kenti',
    type: 'TENT',
    location: 'İstanbul, Beylikdüzü',
    capacity: 800,
    currentOccupancy: 650,
    status: 'ACTIVE',
    description: 'Geçici barınma çadır kenti',
    establishedDate: '2024-02-10',
    
    // Detay alanları
    isGrantFunded: false,
    hasWaterTreatment: false,
    wasteCapacity: 1.8,
    livingAreaCount: 400,
    serviceAreaCount: 12,
    recreationAreaCount: 5,
    
    // Altyapı
    hasElectricity: true,
    hasSewerage: false,
    hasInternet: false,
    
    // Bakanlık Hizmetleri
    hasHealthMinistryServices: true,
    hasFamilyMinistryServices: false,
    hasHealthCenter: true,
    hasTraumaCenter: false,
    hasPharmacy: false,
    hasSocialServiceCenter: false,
    hasEducationServices: true,
    
    // Notlar
    notes: 'Geçici çadır kent. Temel altyapı mevcut. Su arıtma sistemi kurulumu planlanıyor.'
  },
  '3': {
    id: '3',
    name: 'Cumhuriyet Karma Kenti',
    type: 'MIXED',
    location: 'İzmir, Bornova',
    capacity: 350,
    currentOccupancy: 280,
    status: 'ACTIVE',
    description: 'Konteyner ve çadır karma yerleşim',
    establishedDate: '2024-03-05',
    
    // Detay alanları
    isGrantFunded: true,
    hasWaterTreatment: true,
    wasteCapacity: 1.2,
    livingAreaCount: 175,
    serviceAreaCount: 10,
    recreationAreaCount: 6,
    
    // Altyapı
    hasElectricity: true,
    hasSewerage: true,
    hasInternet: true,
    
    // Bakanlık Hizmetleri
    hasHealthMinistryServices: true,
    hasFamilyMinistryServices: true,
    hasHealthCenter: true,
    hasTraumaCenter: true,
    hasPharmacy: true,
    hasSocialServiceCenter: true,
    hasEducationServices: false,
    
    // Notlar
    notes: 'Karma kent modeli. Hem konteyner hem çadır barınakları mevcut. İyi planlı yerleşim.'
  },
  '4': {
    id: '4',
    name: 'Katar Konteyner Kenti',
    type: 'CONTAINER',
    location: 'Lat: 36.3033, Lng: 36.1984',
    capacity: 616,
    currentOccupancy: 0,
    status: 'ACTIVE',
    description: '616 yaşam konteyneri, 23 hizmet konteyneri, sağlık ocağı, psikolojik destek merkezi, güvenlik kapı, tel bariyer, kamera sistemi, Su Arıtma (3 Ton)',
    establishedDate: '2023-02-15',
    
    // Detay alanları
    isGrantFunded: true,
    hasWaterTreatment: true,
    wasteCapacity: 3.0,
    livingAreaCount: 616,
    serviceAreaCount: 23,
    recreationAreaCount: 4,
    
    // Altyapı
    hasElectricity: true,
    hasSewerage: true,
    hasInternet: true,
    
    // Bakanlık Hizmetleri
    hasHealthMinistryServices: true,
    hasFamilyMinistryServices: true,
    hasHealthCenter: true,
    hasTraumaCenter: true,
    hasPharmacy: true,
    hasSocialServiceCenter: true,
    hasEducationServices: true,
    
    // Notlar
    notes: 'Katar destekli konteyner kent. Tam donanımlı altyapı ve güvenlik sistemi mevcut.'
  }
};

// GET - Tek kamp detayı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campId = params.id;
    console.log(`🏠 CampSite detayı isteniyor: ${campId}`);
    
    const campDetail = mockCampsDetails[campId];
    
    if (!campDetail) {
      return NextResponse.json(
        { success: false, error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    console.log(`✅ CampSite detayı döndürüldü: ${campDetail.name}`);

    return NextResponse.json({
      success: true,
      data: campDetail
    });

  } catch (error) {
    console.error('❌ CampSite detayı hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Kamp detayı alınamadı' },
      { status: 500 }
    );
  }
}

// PUT - Kamp detaylarını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campId = params.id;
    console.log(`🔄 CampSite güncelleniyor: ${campId}`);
    
    const body = await request.json();
    console.log('📝 Alınan güncelleme verisi:', body);

    const existingCamp = mockCampsDetails[campId];
    
    if (!existingCamp) {
      return NextResponse.json(
        { success: false, error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    // Güncelleme verilerini mevcut verilerle birleştir
    const updatedCamp = {
      ...existingCamp,
      ...body,
      id: campId, // ID'yi koruma
      updatedAt: new Date().toISOString()
    };

    // Mock data'yı güncelle
    mockCampsDetails[campId] = updatedCamp;

    console.log(`✅ CampSite güncellendi: ${updatedCamp.name}`);

    return NextResponse.json({
      success: true,
      data: updatedCamp,
      message: 'Kent bilgileri başarıyla güncellendi'
    });

  } catch (error) {
    console.error('❌ CampSite güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Kamp güncellenemedi: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Kamp sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campId = params.id;
    console.log(`🗑️ CampSite siliniyor: ${campId}`);
    
    const existingCamp = mockCampsDetails[campId];
    
    if (!existingCamp) {
      return NextResponse.json(
        { success: false, error: 'Kamp bulunamadı' },
        { status: 404 }
      );
    }

    // Mock data'dan sil
    delete mockCampsDetails[campId];

    console.log(`✅ CampSite silindi: ${existingCamp.name}`);

    return NextResponse.json({
      success: true,
      message: 'Kent başarıyla silindi'
    });

  } catch (error) {
    console.error('❌ CampSite silme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Kamp silinemedi: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
