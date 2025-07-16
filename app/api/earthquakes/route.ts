import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minMagnitude = parseFloat(searchParams.get('minMagnitude') || '2.0');
    const source = searchParams.get('source');

    console.log('Earthquake API cagrisi:', { startDate, endDate, minMagnitude, source });

    // Mock deprem verisi - guncel tarihlerle
    const mockEarthquakes = [
      {
        id: "eq_001",
        eventId: "EQ20241201001",
        source: "AFAD",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 38.7437,
        longitude: 35.4781,
        depth: 8.5,
        magnitude: 4.2,
        type: "ML",
        location: "Kayseri",
        tsunamiAlert: false
      },
      {
        id: "eq_002", 
        eventId: "EQ20241201002",
        source: "AFAD",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 39.9334,
        longitude: 32.8597,
        depth: 12.3,
        magnitude: 3.8,
        type: "ML", 
        location: "Ankara",
        tsunamiAlert: false
      },
      {
        id: "eq_003",
        eventId: "EQ20241201003", 
        source: "AFAD",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 41.0082,
        longitude: 28.9784,
        depth: 6.1,
        magnitude: 3.5,
        type: "ML",
        location: "Istanbul",
        tsunamiAlert: false
      },
      {
        id: "eq_004",
        eventId: "EQ20241201004",
        source: "AFAD", 
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 36.8969,
        longitude: 30.7133,
        depth: 15.2,
        magnitude: 2.8,
        type: "ML",
        location: "Antalya",
        tsunamiAlert: false
      },
      {
        id: "eq_005",
        eventId: "EQ20241201005",
        source: "USGS",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 38.4192,
        longitude: 27.1287,
        depth: 9.8,
        magnitude: 4.1,
        type: "ML",
        location: "Izmir",
        tsunamiAlert: false
      },
      {
        id: "eq_006",
        eventId: "EQ20241201006",
        source: "AFAD",
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        latitude: 40.9833,
        longitude: 29.0167,
        depth: 11.5,
        magnitude: 5.2,
        type: "ML",
        location: "Marmara Denizi",
        tsunamiAlert: true
      }
    ];

    // Filtreleme
    let filteredEarthquakes = mockEarthquakes;

    if (minMagnitude > 0) {
      filteredEarthquakes = filteredEarthquakes.filter(eq => eq.magnitude >= minMagnitude);
    }

    if (source) {
      filteredEarthquakes = filteredEarthquakes.filter(eq => eq.source === source);
    }

    console.log(`${filteredEarthquakes.length} deprem verisi donduruluyor`);

    // GeoJSON formatinda dondur
    const geoJsonResponse = {
      type: "FeatureCollection",
      features: filteredEarthquakes.map(earthquake => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [earthquake.longitude, earthquake.latitude]
        },
        properties: {
          id: earthquake.id,
          eventId: earthquake.eventId,
          source: earthquake.source,
          date: earthquake.date,
          depth: earthquake.depth,
          magnitude: earthquake.magnitude,
          type: earthquake.type,
          location: earthquake.location,
          tsunamiAlert: earthquake.tsunamiAlert
        }
      }))
    };

    return NextResponse.json(geoJsonResponse);
  } catch (error) {
    console.error('Earthquake API error:', error);
    return NextResponse.json(
      { error: 'Deprem verileri alinirken hata olustu' },
      { status: 500 }
    );
  }
}
