// 📁 `app/api/jobs/cleanup-logs/route.ts`
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { AdminAuditLog } from '@/models/AdminAuditLog';

export async function POST() {
  await dbConnect();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await AdminAuditLog.deleteMany({
    createdAt: { $lt: ninetyDaysAgo },
  });

  return NextResponse.json({ deleted: result.deletedCount });
}
