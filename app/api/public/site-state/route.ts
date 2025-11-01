import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { SiteState } from '@/models/SiteState';

export async function GET() {
  try {
    await dbConnect();
    const siteState = await SiteState.findOne();

    return NextResponse.json({
      state: siteState?.state || 'open',
      message: siteState?.message || '',
    });
  } catch (error) {
    console.error('Error fetching site state:', error);
    return NextResponse.json(
      { state: 'open', message: 'Failed to fetch site state.' },
      { status: 500 }
    );
  }
}
