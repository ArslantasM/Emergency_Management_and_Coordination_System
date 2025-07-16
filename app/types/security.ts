// Güvenlik ve Dayanıklılık için tip tanımlamaları

// Oturum güvenlik ayarları
export interface SessionSecurity {
  maxInactiveTime: number; // dakika cinsinden
  multipleSessionsAllowed: boolean;
  forcedLogoutOnPasswordChange: boolean;
  ipBindingEnabled: boolean;
  deviceBindingEnabled: boolean;
}

// Kullanıcı güvenlik ayarları
export interface UserSecurity {
  userId: string;
  passwordLastChanged: Date;
  passwordExpiresAt?: Date; // null ise süresi dolmaz
  failedLoginAttempts: number;
  lockedUntil?: Date; // hesap kilitlenene kadar null
  securityQuestions?: {
    question: string;
    answer: string; // hash olarak saklanmalı
  }[];
  lastActivity?: Date;
  activeDevices: {
    deviceId: string;
    deviceName: string;
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'other';
    lastUsed: Date;
    ipAddress: string;
    location?: string;
    userAgent?: string;
  }[];
}

// İzin düzeyleri
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin',
  NONE = 'none'
}

// Rol bazlı erişim kontrolü
export interface RolePermission {
  roleId: string;
  roleName: string;
  resources: {
    resourceName: string; // örn: "volunteers", "tasks", "reports"
    permissionLevel: PermissionLevel;
    constraints?: any; // Ek kısıtlayıcılar (örn: sadece kendi departmanı)
  }[];
}

// Güvenlik günlüğü kaydı
export interface SecurityLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  action: 'login' | 'logout' | 'password_change' | 'account_lock' | 'permission_change' | 'sensitive_data_access' | 'api_access' | 'file_download' | 'admin_action' | 'data_export' | '2fa_change' | 'other';
  description: string;
  deviceInfo?: string;
  location?: string;
  severity: 'info' | 'warning' | 'critical';
  success: boolean;
  relatedResource?: string;
  additionalInfo?: any;
}

// Çevrimdışı çalışma modu ayarları
export interface OfflineMode {
  enabled: boolean;
  syncInterval: number; // dakika cinsinden, 0 ise sadece manuel senkronizasyon
  maxOfflineDays: number; // verilerin çevrimdışı saklanabileceği maksimum gün sayısı
  dataPriority: {
    resourceName: string; // örn: "volunteers", "tasks", "maps"
    priority: 'high' | 'medium' | 'low'; // çevrimdışı erişim önceliği
    partialData: boolean; // tüm veri yerine özet veri 
  }[];
  storageLimitMB: number; // çevrimdışı depolama limiti (MB)
  encryptOfflineData: boolean;
}

// Veri şifreleme ayarları
export interface EncryptionSettings {
  personalDataEncrypted: boolean;
  documentEncryption: boolean;
  communicationEncryption: boolean;
  atRestEncryption: boolean;
  backupEncryption: boolean;
  keyRotationInterval: number; // gün cinsinden
}

// Veri yedekleme yapılandırması
export interface BackupConfiguration {
  enabled: boolean;
  automaticBackup: boolean;
  backupInterval: number; // saat cinsinden
  backupRetentionDays: number;
  backupLocations: {
    type: 'local' | 'cloud' | 'external';
    path: string;
    credentials?: any;
    isActive: boolean;
  }[];
  encryptBackups: boolean;
  lastBackupTime?: Date;
  lastBackupStatus?: 'success' | 'partial' | 'failed';
  lastBackupErrorMessage?: string;
}

// Uygulama güncelleştirme ayarları
export interface UpdateSettings {
  autoCheckForUpdates: boolean;
  autoInstallUpdates: boolean;
  updateChannel: 'stable' | 'beta' | 'development';
  lastUpdateCheck?: Date;
  currentVersion: string;
  availableVersion?: string;
  criticalUpdateAvailable: boolean;
}

// Sistem sağlık durumu
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  components: {
    name: string;
    status: 'up' | 'down' | 'degraded' | 'maintenance';
    lastChecked: Date;
    message?: string;
    metrics?: any;
  }[];
  lastHealthCheck: Date;
  activeIncidents?: {
    id: string;
    title: string;
    startTime: Date;
    resolvedTime?: Date;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    impact: 'none' | 'minor' | 'major' | 'critical';
    description: string;
    updates: {
      timestamp: Date;
      message: string;
    }[];
  }[];
} 