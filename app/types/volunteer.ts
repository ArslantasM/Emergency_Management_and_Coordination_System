// Gönüllü yönetimi için tip tanımlamaları
import { UserRole } from "./user";

// Gönüllü durumu
export enum VolunteerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DEPLOYED = 'deployed',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended'
}

// Gönüllü yetenek/beceri kategorileri
export enum VolunteerSkillCategory {
  MEDICAL = 'medical',
  SEARCH_RESCUE = 'search_rescue',
  LOGISTICS = 'logistics',
  COMMUNICATION = 'communication',
  SHELTER = 'shelter',
  TECHNICAL = 'technical',
  TRANSPORT = 'transport',
  FOOD_SUPPLY = 'food_supply',
  LANGUAGE = 'language',
  OTHER = 'other'
}

// Gönüllü becerisi
export interface VolunteerSkill {
  id: string;
  category: VolunteerSkillCategory;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  verifiedBy?: string; // Admin veya yönetici ID'si
  verifiedAt?: Date;
}

// Gönüllü sertifikası
export interface VolunteerCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
  verified: boolean;
  verifiedBy?: string; // Admin veya yönetici ID'si
  verifiedAt?: Date;
}

// Gönüllü çalışma zamanı tercihleri
export interface VolunteerAvailability {
  id: string;
  days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
  startTime?: string; // format: "HH:MM"
  endTime?: string; // format: "HH:MM"
  timeZone?: string;
  note?: string;
}

// Gönüllü görevlendirme
export interface VolunteerDeployment {
  id: string;
  volunteerId: string;
  taskId: string;
  startDate: Date;
  endDate?: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  checkInTime?: Date;
  checkOutTime?: Date;
  feedback?: string;
  rating?: number; // 1-5 arası
  createdBy: string; // Admin veya yönetici ID'si
  createdAt: Date;
  updatedAt: Date;
}

// Ana gönüllü tipi
export interface Volunteer {
  id: string;
  userId: string; // Bağlı olduğu kullanıcı ID'si
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  address?: string;
  city: string;
  district: string;
  postalCode?: string;
  birthDate?: Date;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalConditions?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  drivingLicense: {
    has: boolean;
    type: string[];
  };
  identificationNumber?: string; // TC Kimlik numarası
  vehicleAccess: boolean;
  languages: string[];
  skills: VolunteerSkill[];
  certifications: VolunteerCertification[];
  availability: VolunteerAvailability[];
  deployments: VolunteerDeployment[];
  status: VolunteerStatus;
  registeredAt: Date;
  lastActiveAt?: Date;
  locationPreferences?: string[]; // Tercih edilen görev bölgeleri
  notes?: string;
  trainingCompleted: boolean;
  totalHoursVolunteered: number;
  rating?: number; // 1-5 arası gönüllünün ortalama değerlendirmesi
  createdAt: Date;
  updatedAt: Date;
  // Bölge bilgileri
  region: string;
  operationalRegions?: string[];
}

// Gönüllü grubu
export interface VolunteerGroup {
  id: string;
  name: string;
  description?: string;
  skillCategory?: VolunteerSkillCategory;
  volunteers: string[]; // Gönüllü ID'leri
  leader?: string; // Lider gönüllü ID'si
  status: 'active' | 'inactive' | 'deployed';
  deployments?: string[]; // Görevlendirme ID'leri
  location?: string; // Grubun aktif olduğu bölge
  createdBy: string; // Admin veya yönetici ID'si
  createdAt: Date;
  updatedAt: Date;
}

// Gönüllü eğitimi
export interface VolunteerTraining {
  id: string;
  title: string;
  description: string;
  category: VolunteerSkillCategory;
  type: 'online' | 'in_person' | 'hybrid';
  requiredFor: VolunteerSkillCategory[];
  duration: number; // dakika cinsinden
  location?: string;
  startDate?: Date;
  endDate?: Date;
  maxAttendees?: number;
  attendees: {
    volunteerId: string;
    status: 'registered' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    registeredAt: Date;
    completedAt?: Date;
    certificateIssued?: boolean;
  }[];
  materials?: {
    title: string;
    type: 'document' | 'video' | 'link';
    url: string;
  }[];
  createdBy: string; // Admin veya yönetici ID'si
  createdAt: Date;
  updatedAt: Date;
}

// 2FA için tip tanımları
export interface TwoFactorAuth {
  userId: string;
  isEnabled: boolean;
  method: '2fa_app' | 'sms' | 'email';
  secret?: string; // TOTP Secret
  backupCodes?: string[];
  lastUpdated: Date;
} 