import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock user stats
    const stats = {
      total: 6,
      active: 4,
      inactive: 2,
      admin: 1,
      regional_manager: 1,
      manager: 1,
      staff: 1,
      volunteer: 1,
      citizen: 1
    };
    
    return NextResponse.json({ stats });

  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 