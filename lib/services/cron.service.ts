import cron from 'node-cron';
import { cacheService } from './cache.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CronService {
  private isRunning = false;

  constructor() {
    this.initializeCronJobs();
  }

  private initializeCronJobs() {
    // Her 5 dakikada bir cache güncelle
    cron.schedule('*/5 * * * *', async () => {
      if (!this.isRunning) {
        this.isRunning = true;
        console.log('🕐 5 dakikalık cache güncelleme başlatıldı...');
        
        try {
          await cacheService.updateAllCache();
          await this.syncCacheToDatabase();
        } catch (error) {
          console.error('❌ Cron job hatası:', error);
        } finally {
          this.isRunning = false;
        }
      }
    });

    // Sistem başladığında bir kez çalıştır
    setTimeout(async () => {
      console.log('🚀 Sistem başlangıç cache güncellemesi...');
      await cacheService.updateAllCache();
      await this.syncCacheToDatabase();
    }, 5000);

    console.log('✅ Cron jobs başlatıldı - Her 5 dakikada cache güncellenecek');
  }

  private async syncCacheToDatabase(): Promise<void> {
    try {
      console.log('🔄 Cache verilerini PostgreSQL\'e aktarılıyor...');

      // Cache'den deprem verilerini oku
      const cachedEarthquakes = await cacheService.readFromCache('earthquakes');
      
      if (cachedEarthquakes.length > 0) {
        // PostgreSQL'e ekle/güncelle
        for (const eq of cachedEarthquakes) {
          try {
            await prisma.earthquake.upsert({
              where: { eventId: eq.eventId },
              update: {
                source: eq.source,
                dateTime: new Date(eq.date),
                latitude: eq.latitude,
                longitude: eq.longitude,
                depth: eq.depth,
                magnitude: eq.magnitude,
                location: eq.location,
                region: eq.region || null,
                updatedAt: new Date()
              },
              create: {
                eventId: eq.eventId,
                source: eq.source,
                dateTime: new Date(eq.date),
                latitude: eq.latitude,
                longitude: eq.longitude,
                depth: eq.depth,
                magnitude: eq.magnitude,
                location: eq.location,
                region: eq.region || null
              }
            });
          } catch (dbError: any) {
            console.error(`❌ Deprem kaydı güncellenemedi (${eq.eventId}):`, dbError.message);
          }
        }
        
        console.log(`✅ ${cachedEarthquakes.length} deprem kaydı PostgreSQL'e aktarıldı`);
      }

    } catch (error: any) {
      console.error('❌ Database sync hatası:', error.message);
    }
  }

  async getStatus() {
    try {
      const cacheStatus = cacheService.getCacheStatus();
      const dbCount = await prisma.earthquake.count();
      
      return {
        isRunning: this.isRunning,
        cache: cacheStatus,
        database: {
          earthquakeCount: dbCount
        },
        lastSync: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        isRunning: this.isRunning,
        cache: null,
        database: { earthquakeCount: 0 },
        error: error.message,
        lastSync: new Date().toISOString()
      };
    }
  }
}

export const cronService = new CronService();
export default CronService;
