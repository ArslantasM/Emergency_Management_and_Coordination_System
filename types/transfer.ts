export interface Transfer {
  id: string;
  type: TransferType;
  status: TransferStatus;
  date: Date;
  notes?: string;
  sourceId?: string;
  targetId: string;
  source?: {
    id: string;
    name: string;
    code: string;
  };
  target: {
    id: string;
    name: string;
    code: string;
  };
  inventory: TransferInventoryItem[];
  equipment: TransferEquipmentItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferInventoryItem {
  id: string;
  transferId: string;
  inventoryId: string;
  quantity: number;
  inventory: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
}

export interface TransferEquipmentItem {
  id: string;
  transferId: string;
  equipmentId: string;
  equipment: {
    id: string;
    name: string;
    code: string;
    serialNumber: string;
  };
}

export enum TransferType {
  IN = 'IN',           // Giriş
  OUT = 'OUT',         // Çıkış
  TRANSFER = 'TRANSFER' // Transfer
}

export enum TransferStatus {
  PENDING = 'PENDING',     // Beklemede
  APPROVED = 'APPROVED',   // Onaylandı
  REJECTED = 'REJECTED',   // Reddedildi
  COMPLETED = 'COMPLETED', // Tamamlandı
  CANCELLED = 'CANCELLED'  // İptal Edildi
}

export interface CreateTransferDTO {
  type: TransferType;
  date: Date;
  notes?: string;
  sourceId?: string;
  targetId: string;
  inventory?: {
    inventoryId: string;
    quantity: number;
  }[];
  equipment?: {
    equipmentId: string;
  }[];
}

export interface UpdateTransferDTO {
  status?: TransferStatus;
  date?: Date;
  notes?: string;
  inventory?: {
    inventoryId: string;
    quantity: number;
  }[];
  equipment?: {
    equipmentId: string;
  }[];
} 