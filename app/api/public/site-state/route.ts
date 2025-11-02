import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { SiteState } from '@/models/SiteState';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const doc = await SiteState.findOne();
    return NextResponse.json({
      state: doc?.state || 'open',
      message: doc?.message || '',
    });
  } catch (error) {
    console.error('SiteState fetch error:', error);
    // Always return a safe default — never 500/502
    return NextResponse.json({
      state: 'open',
      message: '',
    });
  }
}
