export interface Personnel {
  id: string;
  userId: string;
  warehouseId: string;
  position: PersonnelPosition;
  department: string;
  status: PersonnelStatus;
  notes?: string;
  startDate: Date;
  endDate?: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    image_url?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum PersonnelPosition {
  MANAGER = 'MANAGER',         // Depo Müdürü
  SUPERVISOR = 'SUPERVISOR',   // Depo Amiri
  STAFF = 'STAFF',            // Depo Görevlisi
  OPERATOR = 'OPERATOR',      // Forklift Operatörü
  DRIVER = 'DRIVER',          // Şoför
  SECURITY = 'SECURITY',      // Güvenlik Görevlisi
  MAINTENANCE = 'MAINTENANCE', // Bakım Görevlisi
}

export enum PersonnelStatus {
  ACTIVE = 'ACTIVE',         // Aktif
  ON_LEAVE = 'ON_LEAVE',     // İzinli
  SICK_LEAVE = 'SICK_LEAVE', // Hastalık İzni
  INACTIVE = 'INACTIVE',     // Pasif
}

export interface CreatePersonnelDTO {
  userId: string;
  position: PersonnelPosition;
  department: string;
  notes?: string;
  startDate?: Date;
}

export interface UpdatePersonnelDTO {
  position?: PersonnelPosition;
  department?: string;
  status?: PersonnelStatus;
  notes?: string;
  endDate?: Date;
} 