import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock notification stats
    const stats = {
      all: 10,
      unread: 4,
      read: 6,
      warning: 3,
      error: 2,
      info: 3,
      success: 2,
      inventory: 3,
      equipment: 2,
      tasks: 2,
      volunteers: 2,
      personnel: 1,
      system: 0
    };
    
    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Notification stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 