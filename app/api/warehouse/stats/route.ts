import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock warehouse stats
    const stats = {
      total_warehouses: 8,
      active_warehouses: 6,
      total_inventory: 450,
      low_stock_items: 15,
      storage_capacity: 85,
      occupied_space: 68
    };
    
    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Warehouse stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 