export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
  CRITICAL = 'critical',
}

export enum LogCategory {
  AUTHENTICATION = 'authentication',
  USER_ACTIVITY = 'user_activity',
  SYSTEM = 'system',
  API = 'api',
  MAP = 'map',
  TASK = 'task',
  PERSONNEL = 'personnel',
  CHAT = 'chat',
  SECURITY = 'security',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  data?: Record<string, any>; // İlave veriler
  ipAddress?: string;
  userAgent?: string;
  relatedEntityId?: string; // İlişkili kayıt ID'si (görev, personel vb.)
  relatedEntityType?: string; // İlişkili kayıt tipi
}

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  levels?: LogLevel[];
  categories?: LogCategory[];
  userId?: string;
  userRole?: string;
  searchTerm?: string;
  limit?: number;
  page?: number;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  criticalCount: number;
  infoCount: number;
  debugCount: number;
  categoryCounts: Record<LogCategory, number>;
  recentActivity: {
    timestamp: Date;
    count: number;
  }[];
} 