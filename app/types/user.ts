export enum UserRole {
  ADMIN = 'admin',
  REGIONAL_MANAGER = 'regional_manager',
  MANAGER = 'manager',
  STAFF = 'staff',
  VOLUNTEER = 'volunteer',
  CITIZEN = 'citizen'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  department?: string;
  position?: string;
  lastActive?: Date;
  status: 'online' | 'offline' | 'away' | 'busy';
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regions?: string[];
  image?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
  };
  preferences: {
    defaultView: 'dashboard' | 'map' | 'tasks';
    autoRefresh: boolean;
    refreshInterval: number; // saniye cinsinden
  };
} 