export interface WarehouseReport {
  id: string;
  name: string;
  code: string;
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  utilizationRate: number;
  incomingTransfers: number;
  outgoingTransfers: number;
  equipmentCount: number;
  activePersonnel: number;
  totalPersonnel: number;
}

export interface StockMovementReport {
  id: string;
  date: Date;
  type: 'IN' | 'OUT' | 'TRANSFER';
  quantity: number;
  inventory: {
    id: string;
    name: string;
    code: string;
    unit: string;
  };
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
}

export interface PersonnelPerformanceReport {
  id: string;
  userId: string;
  name: string;
  position: string;
  department: string;
  totalTransfers: number;
  completedTransfers: number;
  pendingTransfers: number;
  rejectedTransfers: number;
  averageCompletionTime: number;
  workingDays: number;
  leaveDays: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  warehouseId?: string;
  type?: string;
  status?: string;
  department?: string;
  position?: string;
}

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf';
  filters?: ReportFilters;
  columns?: string[];
} 