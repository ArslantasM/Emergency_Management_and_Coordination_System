import { LogCategory, LogEntry, LogLevel, FilterOptions } from '../types/log';
import { v4 as uuidv4 } from 'uuid';

// Sahte log veritabanı (gerçek uygulamada veritabanına kaydedilir)
let logs: LogEntry[] = [];

// Log limiti (performans için)
const MAX_LOGS = 10000;

// Loglama fonksiyonu
export const log = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  options?: {
    userId?: string;
    userName?: string;
    userRole?: string;
    data?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }
): LogEntry => {
  const logEntry: LogEntry = {
    id: uuidv4(),
    timestamp: new Date(),
    level,
    category,
    message,
    ...options
  };

  // Log veritabanına kaydet
  logs.unshift(logEntry);
  
  // Log limitini aşarsa en eski olanları sil
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(0, MAX_LOGS);
  }
  
  // Konsolda göster
  const logColor = getLogLevelColor(level);
  const formattedMessage = `[${logEntry.timestamp.toISOString()}] [${level.toUpperCase()}] [${category}]: ${message}`;
  
  if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
    console.error(`%c${formattedMessage}`, `color: ${logColor}; font-weight: bold`);
  } else if (level === LogLevel.WARNING) {
    console.warn(`%c${formattedMessage}`, `color: ${logColor}; font-weight: bold`);
  } else {
    console.log(`%c${formattedMessage}`, `color: ${logColor}`);
  }
  
  return logEntry;
};

// Yardımcı loglama fonksiyonları
export const logInfo = (category: LogCategory, message: string, options?: any) => 
  log(LogLevel.INFO, category, message, options);

export const logWarning = (category: LogCategory, message: string, options?: any) => 
  log(LogLevel.WARNING, category, message, options);

export const logError = (category: LogCategory, message: string, options?: any) => 
  log(LogLevel.ERROR, category, message, options);

export const logDebug = (category: LogCategory, message: string, options?: any) => 
  log(LogLevel.DEBUG, category, message, options);

export const logCritical = (category: LogCategory, message: string, options?: any) => 
  log(LogLevel.CRITICAL, category, message, options);

// Log seviyesine göre renk döndürür
const getLogLevelColor = (level: LogLevel): string => {
  switch (level) {
    case LogLevel.INFO:
      return '#4caf50';
    case LogLevel.WARNING:
      return '#ff9800';
    case LogLevel.ERROR:
      return '#f44336';
    case LogLevel.DEBUG:
      return '#2196f3';
    case LogLevel.CRITICAL:
      return '#9c27b0';
    default:
      return '#000000';
  }
};

// Log filtreleme
export const filterLogs = (options: FilterOptions): LogEntry[] => {
  let filteredLogs = [...logs];
  
  // Tarih aralığı filtresi
  if (options.startDate) {
    filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startDate!);
  }
  
  if (options.endDate) {
    filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endDate!);
  }
  
  // Log seviyesi filtresi
  if (options.levels && options.levels.length > 0) {
    filteredLogs = filteredLogs.filter(log => options.levels!.includes(log.level));
  }
  
  // Kategori filtresi
  if (options.categories && options.categories.length > 0) {
    filteredLogs = filteredLogs.filter(log => options.categories!.includes(log.category));
  }
  
  // Kullanıcı filtresi
  if (options.userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === options.userId);
  }
  
  // Kullanıcı rolü filtresi
  if (options.userRole) {
    filteredLogs = filteredLogs.filter(log => log.userRole === options.userRole);
  }
  
  // Arama filtresi
  if (options.searchTerm) {
    const searchTerm = options.searchTerm.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.message.toLowerCase().includes(searchTerm) || 
      (log.userName && log.userName.toLowerCase().includes(searchTerm)) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
    );
  }
  
  // Sayfalama
  const limit = options.limit || filteredLogs.length;
  const page = options.page || 0;
  const start = page * limit;
  const end = start + limit;
  
  return filteredLogs.slice(start, end);
};

// Log istatistikleri hesaplama
export const getLogStats = (): { 
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  criticalCount: number;
  infoCount: number;
  debugCount: number;
  categoryCounts: Record<LogCategory, number>;
  recentActivity: {timestamp: Date, count: number}[];
} => {
  const stats = {
    totalLogs: logs.length,
    errorCount: logs.filter(log => log.level === LogLevel.ERROR).length,
    warningCount: logs.filter(log => log.level === LogLevel.WARNING).length,
    criticalCount: logs.filter(log => log.level === LogLevel.CRITICAL).length,
    infoCount: logs.filter(log => log.level === LogLevel.INFO).length,
    debugCount: logs.filter(log => log.level === LogLevel.DEBUG).length,
    categoryCounts: {} as Record<LogCategory, number>,
    recentActivity: [] as {timestamp: Date, count: number}[],
  };
  
  // Kategori sayılarını hesapla
  Object.values(LogCategory).forEach(category => {
    stats.categoryCounts[category] = logs.filter(log => log.category === category).length;
  });
  
  // Son 24 saatlik aktivite
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentLogs = logs.filter(log => log.timestamp >= last24Hours);
  
  // Saatlik gruplandırma
  const hourlyActivity: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourlyActivity[i] = 0;
  }
  
  recentLogs.forEach(log => {
    const hour = log.timestamp.getHours();
    hourlyActivity[hour]++;
  });
  
  // Aktivite dizisini oluştur
  for (let i = 0; i < 24; i++) {
    const hourDate = new Date(now);
    hourDate.setHours(i, 0, 0, 0);
    stats.recentActivity.push({
      timestamp: hourDate,
      count: hourlyActivity[i],
    });
  }
  
  return stats;
};

// Demo log verileri oluştur
export const generateDemoLogs = (count: number): void => {
  const users = [
    { id: '1', name: 'Admin Kullanıcı', role: 'admin' },
    { id: '2', name: 'Yönetici Kullanıcı', role: 'manager' },
    { id: '3', name: 'Personel Kullanıcı', role: 'personnel' },
    { id: '4', name: 'Vatandaş Kullanıcı', role: 'user' },
  ];
  
  const messages = [
    'Sisteme giriş yapıldı',
    'Yeni görev oluşturuldu',
    'Görev güncellendi',
    'Acil durum bildirimi oluşturuldu',
    'Harita üzerinde konum işaretlendi',
    'Yeni personel eklendi',
    'API isteği başarısız oldu',
    'Oturum süresi doldu',
    'Dosya yüklendi',
    'Rapor oluşturuldu',
    'Şifre değiştirildi',
    'Profil bilgileri güncellendi',
    'Yeni mesaj gönderildi',
    'Bölge sınırları güncellendi',
    'Sistem yeniden başlatıldı',
  ];
  
  const generateRandomLog = (): LogEntry => {
    const user = users[Math.floor(Math.random() * users.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const levelValues = Object.values(LogLevel);
    const level = levelValues[Math.floor(Math.random() * levelValues.length)];
    const categoryValues = Object.values(LogCategory);
    const category = categoryValues[Math.floor(Math.random() * categoryValues.length)];
    
    // Rastgele tarih (son 30 gün içinde)
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    return {
      id: uuidv4(),
      timestamp: pastDate,
      level,
      category,
      message,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
  };
  
  // Demo log oluştur
  for (let i = 0; i < count; i++) {
    logs.push(generateRandomLog());
  }
  
  // Log ID'lerine göre sırala
  logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  console.log(`${count} adet demo log oluşturuldu.`);
}; 