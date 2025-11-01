import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { SiteState } from '@/models/SiteState';

export async function GET() {
  await dbConnect();
  const siteState = await SiteState.findOne();
  return NextResponse.json({
    state: siteState?.state || 'open',
    message: siteState?.message || '',
  });
}
