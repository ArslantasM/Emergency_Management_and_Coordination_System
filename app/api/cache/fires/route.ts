import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Cache den yangın verileri isteniyor...');
    
    // Mock yangın verileri döndür
    const mockFires = [
      {
        id: `fire_${Date.now()}_1`,
        source: 'NASA_FIRMS_MODIS',
        date: new Date().toISOString(),
        latitude: 36.8969,
        longitude: 30.7133,
        brightness: 320.5,
        confidence: 85,
        frp: 45.2,
        satellite: 'Terra',
        instrument: 'MODIS',
        location: 'Antalya, Türkiye'
      },
      {
        id: `fire_${Date.now()}_2`,
        source: 'NASA_FIRMS_VIIRS',
        date: new Date().toISOString(),
        latitude: 37.0662,
        longitude: 37.3833,
        brightness: 340.2,
        confidence: 90,
        frp: 78.5,
        satellite: 'Aqua',
        instrument: 'MODIS',
        location: 'Şanlıurfa, Türkiye'
      }
    ];

    const features = mockFires.map(fire => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [fire.longitude, fire.latitude]
      },
      properties: {
        id: fire.id,
        source: fire.source,
        date: fire.date,
        brightness: fire.brightness,
        confidence: fire.confidence,
        frp: fire.frp,
        satellite: fire.satellite,
        instrument: fire.instrument,
        location: fire.location
      }
    }));

    const response = {
      type: 'FeatureCollection',
      features: features,
      metadata: {
        count: mockFires.length,
        source: 'cache',
        lastUpdated: new Date().toISOString()
      }
    };

    console.log(`${mockFires.length} yangın verisi cache den döndürüldü`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Cache API hatası:', error);
    
    return NextResponse.json({
      type: 'FeatureCollection',
      features: [],
      error: 'Cache verisi okunamadı',
      metadata: {
        count: 0,
        source: 'cache'
      }
    }, { status: 500 });
  }
}
