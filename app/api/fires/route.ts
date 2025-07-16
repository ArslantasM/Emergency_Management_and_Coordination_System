import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minConfidence = parseInt(searchParams.get('minConfidence') || '50');
    const source = searchParams.get('source');

    console.log('Fire API çağrısı:', { startDate, endDate, minConfidence, source });

    // Mock yangın verisi - güncel tarihlerle
    const mockFires = [
      {
        id: "fire_001",
        source: "MODIS",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 36.8969,
        longitude: 30.7133,
        brightness: 315.2,
        confidence: 85,
        frp: 12.5,
        satellite: "Terra",
        instrument: "MODIS",
        location: "Antalya - Orman Alanı"
      },
      {
        id: "fire_002",
        source: "VIIRS",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 37.8667,
        longitude: 32.4833,
        brightness: 298.7,
        confidence: 78,
        frp: 8.3,
        satellite: "Suomi NPP",
        instrument: "VIIRS",
        location: "Konya - Tarım Alanı"
      },
      {
        id: "fire_003",
        source: "MODIS",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 38.4192,
        longitude: 27.1287,
        brightness: 342.1,
        confidence: 92,
        frp: 18.7,
        satellite: "Aqua",
        instrument: "MODIS",
        location: "İzmir - Çalılık Alan"
      },
      {
        id: "fire_004",
        source: "VIIRS",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 41.0082,
        longitude: 28.9784,
        brightness: 278.5,
        confidence: 65,
        frp: 5.2,
        satellite: "NOAA-20",
        instrument: "VIIRS",
        location: "İstanbul - Endüstriyel Alan"
      },
      {
        id: "fire_005",
        source: "MODIS",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 39.9334,
        longitude: 32.8597,
        brightness: 305.8,
        confidence: 88,
        frp: 14.1,
        satellite: "Terra",
        instrument: "MODIS",
        location: "Ankara - Çayır Alan"
      }
    ];

    // Filtreleme
    let filteredFires = mockFires;

    if (minConfidence > 0) {
      filteredFires = filteredFires.filter(fire => fire.confidence >= minConfidence);
    }

    if (source) {
      filteredFires = filteredFires.filter(fire => fire.source === source);
    }

    console.log(`${filteredFires.length} yangın verisi döndürülüyor`);

    // GeoJSON formatında döndür
    const geoJsonResponse = {
      type: "FeatureCollection",
      features: filteredFires.map(fire => ({
        type: "Feature",
        geometry: {
          type: "Point",
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
      }))
    };

    return NextResponse.json(geoJsonResponse);
  } catch (error) {
    console.error('Fire API error:', error);
    return NextResponse.json(
      { error: 'Yangın verileri alınırken hata oluştu' },
      { status: 500 }
    );
  }
} 