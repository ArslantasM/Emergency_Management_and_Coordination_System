import axios from 'axios';

export interface EarthquakeData {
  id: string;
  eventId: string;
  source: string;
  date: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  type: string;
  location: string;
  tsunamiAlert: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : 'http://localhost:3000'
);

export const emergencyApi = {
  getEarthquakesFromCache: async (): Promise<EarthquakeData[]> => {
    try {
      console.log('Cache den deprem verileri alınıyor...');
      
      const response = await axios.get(`${API_BASE_URL}/api/cache/earthquakes`, { 
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.data.type === 'FeatureCollection') {
        const earthquakes = response.data.features.map((feature: any) => ({
          id: feature.properties.id,
          eventId: feature.properties.eventId,
          source: feature.properties.source,
          date: feature.properties.date,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          depth: feature.properties.depth,
          magnitude: feature.properties.magnitude,
          type: feature.properties.type,
          location: feature.properties.location,
          tsunamiAlert: feature.properties.tsunamiAlert
        }));
        
        console.log(`Cache den ${earthquakes.length} deprem verisi alındı`);
        return earthquakes;
      }
      return [];
    } catch (error) {
      console.error('Cache den deprem verisi alınırken hata:', error);
      return [];
    }
  },

  getCacheStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cache/status`, { 
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Cache status alınırken hata:', error);
      return null;
    }
  }
};
