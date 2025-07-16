import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock task stats
    const stats = {
      total: 5,
      pending: 2,
      in_progress: 2,
      completed: 1,
      overdue: 0,
      high_priority: 2,
      medium_priority: 2,
      low_priority: 1
    };
    
    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Task stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 