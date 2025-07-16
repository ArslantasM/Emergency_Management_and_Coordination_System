import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '../../../../lib/services/cache.service';

export async function GET(request: NextRequest) {
  try {
    console.log('🗄️ Cache den deprem verileri isteniyor...');
    
    // Cache'den veri oku
    const earthquakes = await cacheService.readFromCache('earthquakes');
    
    if (earthquakes.length === 0) {
      return NextResponse.json({
        type: 'FeatureCollection',
        features: [],
        metadata: {
          count: 0,
          source: 'cache',
          message: 'Cache de veri bulunamadı'
        }
      });
    }

    // GeoJSON formatında döndür
    const features = earthquakes.map(eq => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [eq.longitude, eq.latitude]
      },
      properties: {
        id: eq.id,
        eventId: eq.eventId,
        source: eq.source,
        date: eq.date,
        depth: eq.depth,
        magnitude: eq.magnitude,
        type: eq.type,
        location: eq.location,
        tsunamiAlert: eq.tsunamiAlert
      }
    }));

    const response = {
      type: 'FeatureCollection',
      features: features,
      metadata: {
        count: earthquakes.length,
        source: 'cache',
        lastUpdated: new Date().toISOString()
      }
    };

    console.log(`✅ ${earthquakes.length} deprem verisi cache den döndürüldü`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Cache API hatası:', error);
    
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
