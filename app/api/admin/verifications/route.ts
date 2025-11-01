import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { VerificationRequest } from '@/models/VerificationRequest';
import { AdminAuditLog } from '@/models/AdminAuditLog';
import { roleGuard } from '@/lib/middleware/role-guard';

export async function GET() {
  await dbConnect();

  const requests = await VerificationRequest.find({ status: 'pending' })
    .populate('userId', 'name email')
    .sort({ requestedAt: -1 });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const guardResult = await roleGuard(req, ['admin', 'owner']);
  if (guardResult instanceof NextResponse) return guardResult;
  const { user: admin } = guardResult;

  const { requestId, action, reason } = await req.json();

  if (!requestId || !['approve', 'reject'].includes(action) || !reason) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const request = await VerificationRequest.findById(requestId);
  if (!request || request.status !== 'pending') {
    return NextResponse.json({ error: 'Request not found or already processed' }, { status: 404 });
  }

  const user = await User.findById(request.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'approve') {
    user.isEmailVerified = true;
    user.role = 'artist'; // Auto-upgrade to artist
  }

  request.status = action;
  request.reviewedBy = admin._id;
  request.reviewedAt = new Date();
  await request.save();
  await user.save();

  await AdminAuditLog.create({
    adminId: admin._id,
    action: `verification_${action}`,
    targetType: 'User',
    targetId: user._id,
    reason,
    isOwnerOverride: admin.role === 'owner',
    ip: req.ip || 'unknown',
  });

  return NextResponse.json({ success: true });
}
