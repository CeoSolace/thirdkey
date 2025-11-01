import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { AdminAuditLog } from '@/models/AdminAuditLog';
import { roleGuard } from '@/lib/middleware/role-guard';

export async function POST(req: NextRequest) {
  await dbConnect();

  const guardResult = await roleGuard(req, ['admin', 'owner']);
  if (guardResult instanceof NextResponse) return guardResult;
  const { user: admin } = guardResult;

  const { userId, action, reason } = await req.json();

  if (!userId || !['ban', 'unban'].includes(action) || !reason) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  targetUser.isBanned = action === 'ban';
  await targetUser.save();

  await AdminAuditLog.create({
    adminId: admin._id,
    action: `${action}_user`,
    targetType: 'User',
    targetId: userId,
    reason,
    isOwnerOverride: admin.role === 'owner',
    ip: req.ip || 'unknown',
  });

  return NextResponse.json({ success: true });
}
