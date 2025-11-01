// 📁 `app/api/jobs/expire-temp-verifications/route.ts`
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';

export async function POST() {
  // Optional: protect with secret header in production
  await dbConnect();

  const now = new Date();
  const result = await User.updateMany(
    { tempVerified: true, tempVerifiedUntil: { $lt: now } },
    { $set: { tempVerified: false, tempVerifiedUntil: null } }
  );

  return NextResponse.json({ expired: result.modifiedCount });
}
