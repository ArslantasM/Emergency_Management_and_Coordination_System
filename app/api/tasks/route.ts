import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock tasks data
const mockTasks = [
  {
    id: '1',
    title: 'Acil Durum Tatbikatı',
    description: 'Haftalık acil durum tatbikatı düzenle',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'Mehmet Demir',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Envanter Kontrolü',
    description: 'Aylık envanter sayımı yap',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'Ayşe Şahin',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    title: 'Ekipman Bakımı',
    description: 'Jeneratörlerin bakımını yap',
    status: 'completed',
    priority: 'high',
    assignedTo: 'Ali Veli',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4',
    title: 'Gönüllü Eğitimi',
    description: 'Yeni gönüllülere temel eğitim ver',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'Fatma Kaya',
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '5',
    title: 'Rapor Hazırlama',
    description: 'Aylık faaliyet raporunu hazırla',
    status: 'in_progress',
    priority: 'low',
    assignedTo: 'Ahmet Yılmaz',
    dueDate: new Date(Date.now() + 345600000).toISOString(),
    createdAt: new Date(Date.now() - 10800000).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit');
    const isStats = searchParams.get('stats') === 'true';

    // Stats endpoint
    if (isStats) {
      const stats = {
        total: mockTasks.length,
        pending: mockTasks.filter(t => t.status === 'pending').length,
        in_progress: mockTasks.filter(t => t.status === 'in_progress').length,
        completed: mockTasks.filter(t => t.status === 'completed').length,
        overdue: mockTasks.filter(t => 
          new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length,
        high_priority: mockTasks.filter(t => t.priority === 'high').length,
        medium_priority: mockTasks.filter(t => t.priority === 'medium').length,
        low_priority: mockTasks.filter(t => t.priority === 'low').length
      };
      
      return NextResponse.json({ stats });
    }

    // Filter tasks
    let filteredTasks = [...mockTasks];

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }

    if (priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }

    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      filteredTasks = filteredTasks.slice(0, limitNum);
    }

    // Sort by due date
    filteredTasks.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return NextResponse.json({
      tasks: filteredTasks,
      total: filteredTasks.length
    });

  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 