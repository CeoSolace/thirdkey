// 📁 `app/api/jobs/process-copyright-claims/route.ts`
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { CopyrightClaim } from '@/models/CopyrightClaim';

export async function POST() {
  await dbConnect();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Auto-release claims older than 14 days if still pending (optional)
  // In real system, admin would decide — this is a fallback

  const result = await CopyrightClaim.updateMany(
    { submittedAt: { $lt: fourteenDaysAgo }, status: 'pending' },
    { $set: { status: 'rejected', resolvedAt: new Date(), revenueHeld: false } }
  );

  return NextResponse.json({ processed: result.modifiedCount });
}
