import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CreatePersonnelDTO, Personnel, UpdatePersonnelDTO } from '@/types/personnel';

export class PersonnelService {
  private baseUrl = '/api/warehouse';

  // Depo personellerini getir
  async findAllByWarehouse(warehouseId: string): Promise<Personnel[]> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/personnel`);
    if (!response.ok) {
      throw new Error('Personel listesi alınamadı');
    }
    return response.json();
  }

  // Tekil personel getir
  async findById(warehouseId: string, personnelId: string): Promise<Personnel> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/personnel/${personnelId}`);
    if (!response.ok) {
      throw new Error('Personel detayı alınamadı');
    }
    return response.json();
  }

  // Yeni personel ekle
  async create(warehouseId: string, data: CreatePersonnelDTO): Promise<Personnel> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/personnel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Personel eklenemedi');
    }
    return response.json();
  }

  // Personel güncelle
  async update(warehouseId: string, personnelId: string, data: UpdatePersonnelDTO): Promise<Personnel> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/personnel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ personnelId, ...data }),
    });
    if (!response.ok) {
      throw new Error('Personel güncellenemedi');
    }
    return response.json();
  }

  // Personel sil
  async delete(warehouseId: string, personnelId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${warehouseId}/personnel?personnelId=${personnelId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Personel silinemedi');
    }
  }

  // Kullanıcı listesini getir
  async getUsers(): Promise<any[]> {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Kullanıcı listesi alınamadı');
    }
    return response.json();
  }

  // Personel durumunu güncelle
  async updateStatus(warehouseId: string, personnelId: string, status: string): Promise<Personnel> {
    return this.update(warehouseId, personnelId, { status: status as any });
  }

  // İzinli personelleri getir
  async findOnLeave(warehouseId: string): Promise<Personnel[]> {
    const allPersonnel = await this.findAllByWarehouse(warehouseId);
    return allPersonnel.filter(p => p.status === 'ON_LEAVE' || p.status === 'SICK_LEAVE');
  }

  // Aktif personelleri getir
  async findActive(warehouseId: string): Promise<Personnel[]> {
    const allPersonnel = await this.findAllByWarehouse(warehouseId);
    return allPersonnel.filter(p => p.status === 'ACTIVE');
  }

  // Departmana göre personelleri getir
  async findByDepartment(warehouseId: string, department: string): Promise<Personnel[]> {
    const allPersonnel = await this.findAllByWarehouse(warehouseId);
    return allPersonnel.filter(p => p.department === department);
  }

  // Pozisyona göre personelleri getir
  async findByPosition(warehouseId: string, position: string): Promise<Personnel[]> {
    const allPersonnel = await this.findAllByWarehouse(warehouseId);
    return allPersonnel.filter(p => p.position === position);
  }
} 