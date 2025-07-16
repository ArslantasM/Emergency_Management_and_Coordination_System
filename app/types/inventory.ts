export enum InventoryCategory {
  FOOD = 'Gıda',
  WATER = 'Su',
  MEDICAL = 'Tıbbi Malzeme',
  HYGIENE = 'Hijyen Malzemesi',
  CLOTHING = 'Giyim',
  SHELTER = 'Barınma',
  COMMUNICATION = 'İletişim',
  EQUIPMENT = 'Ekipman',
  TOOL = 'Alet',
  TOOLS = 'Aletler ve Ekipmanlar',
  FUEL = 'Yakıt',
  GENERAL = 'Genel',
  OTHER = 'Diğer'
}

export enum TransactionType {
  PURCHASE = 'Satın Alma',
  DONATION = 'Bağış',
  TRANSFER_IN = 'Transfer (Giriş)',
  TRANSFER_OUT = 'Transfer (Çıkış)',
  TRANSFER = 'Transfer',
  CONSUMPTION = 'Tüketim',
  ADJUSTMENT = 'Ayarlama',
  RETURN = 'İade',
  DISCARD = 'İmha',
  DISTRIBUTION = 'Dağıtım',
  OTHER = 'Diğer'
}

export enum StorageCondition {
  AMBIENT = 'Oda Sıcaklığı',
  REFRIGERATED = 'Soğuk',
  FROZEN = 'Donmuş',
  COLD = 'Serin',
  COOL = 'Serin',
  COOL_DRY = 'Serin ve Kuru',
  VENTILATED = 'Havalandırmalı',
  PROTECTED = 'Korumalı',
  HEATED = 'Isıtmalı',
  DRY = 'Kuru Ortam',
  NORMAL = 'Normal',
  SPECIAL = 'Özel Şartlar'
}

export interface Inventory {
  id: string;
  name: string;
  category: InventoryCategory;
  description?: string;
  sku?: string;
  currentStock: number;
  minimumStock?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  quantity: number;
  unitOfMeasure: string;
  minQuantity?: number;
  maxQuantity?: number;
  location: string;
  storageCondition?: StorageCondition;
  expiryDate?: string;
  lastStockCheck?: string;
  batchNumber?: string;
  supplier?: string;
  supplierInfo?: string;
  unitCost?: number;
  totalValue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  type: TransactionType;
  quantity: number;
  date: string;
  source?: string;
  destination?: string;
  performedBy: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAdjustment {
  id: string;
  inventoryId: string;
  newStock: number;
  previousStock?: number;
  reason: string;
  date: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilter {
  category?: InventoryCategory;
  location?: string;
  storageCondition?: StorageCondition;
  lowStock?: boolean;
  expiringSoon?: boolean;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  byCategory: Record<InventoryCategory, number>;
  byLocation: Record<string, number>;
  byStorageCondition: Record<StorageCondition, number>;
  recentTransactions: number;
} 