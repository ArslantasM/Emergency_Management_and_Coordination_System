import fs from 'fs';
import path from 'path';
import axios from 'axios';

interface EarthquakeData {
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

class CacheService {
  private cacheDir: string;
  private earthquakeCacheFile: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'cache');
    this.earthquakeCacheFile = path.join(this.cacheDir, 'earthquakes.json');
    
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async fetchEarthquakesFromKandilli(): Promise<EarthquakeData[]> {
    try {
      console.log('Kandilli API den deprem verileri çekiliyor...');
      
      const response = await axios.get('http://localhost:3001/api/earthquakes/kandilli', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Emergency-Management-System/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        console.log(`${response.data.length} deprem verisi alındı`);
        return response.data.map((eq: any) => ({
          id: eq.id || `eq_${Date.now()}_${Math.random()}`,
          eventId: eq.eventId || eq.id,
          source: 'KANDILLI',
          date: eq.date || new Date().toISOString(),
          latitude: parseFloat(eq.latitude) || 0,
          longitude: parseFloat(eq.longitude) || 0,
          depth: parseFloat(eq.depth) || 0,
          magnitude: parseFloat(eq.magnitude) || 0,
          type: eq.type || 'ML',
          location: eq.location || 'Bilinmeyen',
          tsunamiAlert: eq.tsunamiAlert || false
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Kandilli API hatası:', error.message);
      return [];
    }
  }

  async writeToCache(type: 'earthquakes', data: any[]): Promise<void> {
    try {
      const cacheData = {
        lastUpdated: new Date().toISOString(),
        count: data.length,
        data: data
      };

      fs.writeFileSync(this.earthquakeCacheFile, JSON.stringify(cacheData, null, 2), 'utf8');
      console.log(`${type} cache güncellendi: ${data.length} kayıt`);
    } catch (error: any) {
      console.error(`Cache yazma hatası:`, error.message);
    }
  }

  async readFromCache(type: 'earthquakes'): Promise<any[]> {
    try {
      if (!fs.existsSync(this.earthquakeCacheFile)) {
        console.log(`${type} cache dosyası bulunamadı`);
        return [];
      }

      const fileContent = fs.readFileSync(this.earthquakeCacheFile, 'utf8');
      const cacheData = JSON.parse(fileContent);
      
      console.log(`${type} cache okundu: ${cacheData.count} kayıt`);
      return cacheData.data || [];
    } catch (error: any) {
      console.error(`Cache okuma hatası:`, error.message);
      return [];
    }
  }

  async updateAllCache(): Promise<void> {
    console.log('Cache güncelleme başlatıldı...');
    
    try {
      const earthquakes = await this.fetchEarthquakesFromKandilli();
      
      if (earthquakes.length > 0) {
        await this.writeToCache('earthquakes', earthquakes);
      } else {
        console.log('Deprem verileri alınamadı, cache güncellenmedi');
      }

      console.log('Cache güncelleme tamamlandı');
    } catch (error: any) {
      console.error('Cache güncelleme hatası:', error.message);
    }
  }

  getCacheStatus() {
    try {
      if (!fs.existsSync(this.earthquakeCacheFile)) {
        return { earthquakes: { exists: false, count: 0 } };
      }

      const stats = fs.statSync(this.earthquakeCacheFile);
      const fileContent = fs.readFileSync(this.earthquakeCacheFile, 'utf8');
      const cacheData = JSON.parse(fileContent);

      return {
        earthquakes: {
          exists: true,
          lastUpdated: cacheData.lastUpdated,
          count: cacheData.count,
          fileSize: stats.size
        }
      };
    } catch (error: any) {
      return { earthquakes: { exists: false, error: error.message } };
    }
  }
}

export const cacheService = new CacheService();
export default CacheService;
