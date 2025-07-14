export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice?: number;
  status: InventoryStatus;
  expiryDate?: Date;
  categoryId: string;
  warehouseId: string;
  category: InventoryCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',     // Kullanılabilir
  LOW_STOCK = 'LOW_STOCK',     // Düşük Stok
  OUT_OF_STOCK = 'OUT_OF_STOCK', // Stokta Yok
  EXPIRED = 'EXPIRED',         // Süresi Dolmuş
  RESERVED = 'RESERVED'        // Rezerve Edilmiş
}

export interface CreateInventoryDTO {
  name: string;
  code: string;
  description?: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice?: number;
  expiryDate?: Date;
  categoryId: string;
}

export interface UpdateInventoryDTO {
  name?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  unitPrice?: number;
  status?: InventoryStatus;
  expiryDate?: Date;
  categoryId?: string;
} 