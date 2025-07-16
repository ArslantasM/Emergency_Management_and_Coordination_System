import { NextRequest, NextResponse } from 'next/server';
import { cronService } from '../../../../lib/services/cron.service';

export async function GET(request: NextRequest) {
  try {
    const status = await cronService.getStatus();
    
    return NextResponse.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(' Cache status API hatası:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cache status alınamadı',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
