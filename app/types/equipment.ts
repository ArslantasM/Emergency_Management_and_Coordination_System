export enum EquipmentType {
  POWER = 'Güç Ekipmanı',
  WATER_PURIFICATION = 'Su Arıtma',
  SEARCH_RESCUE = 'Arama Kurtarma',
  COMMUNICATION = 'İletişim',
  MEDICAL = 'Tıbbi',
  SHELTER = 'Barınma',
  TRANSPORTATION = 'Ulaşım',
  FOOD = 'Gıda',
  TOOLS = 'Aletler',
  OTHER = 'Diğer'
}

export enum EquipmentStatus {
  AVAILABLE = 'Kullanılabilir',
  IN_USE = 'Kullanımda',
  MAINTENANCE = 'Bakımda',
  BROKEN = 'Arızalı',
  RESERVED = 'Rezerve',
  RETIRED = 'Emekli'
}

export enum MaintenanceType {
  ROUTINE = 'Rutin Bakım',
  PREVENTIVE = 'Önleyici Bakım',
  CORRECTIVE = 'Düzeltici Bakım',
  EMERGENCY = 'Acil Bakım',
  INSPECTION = 'Denetim',
  CALIBRATION = 'Kalibrasyon'
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  serialNumber: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  location: string;
  assignedTo?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  date: string;
  performedBy: string;
  description: string;
  cost?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  assignedTo: string;
  assignedBy: string;
  startDate: string;
  endDate?: string;
  purpose: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFilter {
  type?: EquipmentType;
  status?: EquipmentStatus;
  location?: string;
  assignedTo?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface EquipmentStats {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  broken: number;
  reserved: number;
  retired: number;
  byType: Record<EquipmentType, number>;
  byLocation: Record<string, number>;
} 