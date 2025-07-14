export interface Equipment {
  id: string;
  name: string;
  code: string;
  serialNumber: string;
  description?: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  categoryId: string;
  warehouseId: string;
  category: EquipmentCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  maintenanceInterval?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',       // Kullanılabilir
  IN_USE = 'IN_USE',            // Kullanımda
  MAINTENANCE = 'MAINTENANCE',   // Bakımda
  REPAIR = 'REPAIR',            // Tamirde
  RESERVED = 'RESERVED',        // Rezerve Edilmiş
  RETIRED = 'RETIRED'           // Kullanım Dışı
}

export enum EquipmentCondition {
  EXCELLENT = 'EXCELLENT',      // Mükemmel
  GOOD = 'GOOD',               // İyi
  FAIR = 'FAIR',               // Orta
  POOR = 'POOR',               // Kötü
  UNUSABLE = 'UNUSABLE'        // Kullanılamaz
}

export interface CreateEquipmentDTO {
  name: string;
  code: string;
  serialNumber: string;
  description?: string;
  condition: EquipmentCondition;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  categoryId: string;
}

export interface UpdateEquipmentDTO {
  name?: string;
  description?: string;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  categoryId?: string;
} 