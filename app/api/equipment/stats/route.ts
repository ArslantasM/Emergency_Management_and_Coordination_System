import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock equipment stats
    const stats = {
      total: 150,
      active: 120,
      maintenance: 20,
      inactive: 10,
      available: 120
    };
    
    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Equipment stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 