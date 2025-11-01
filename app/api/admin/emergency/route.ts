import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { SiteState } from '@/models/SiteState';
import { AdminAuditLog } from '@/models/AdminAuditLog';

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { action, secret } = await req.json();

  const validActions = ['maintenance', 'close', 'shutdown'];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  let isOwnerOverride = false;
  if (action === 'shutdown') {
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Owner only' }, { status: 403 });
    }
    if (secret !== process.env.OWNER_SHARED_SECRET) {
      return NextResponse.json({ error: 'Invalid owner secret' }, { status: 403 });
    }
    isOwnerOverride = true;
  }

  let state, message;
  if (action === 'maintenance') {
    state = 'maintenance';
    message = 'We’re performing maintenance. Back soon!';
  } else if (action === 'close') {
    state = 'closed';
    message = 'Temporarily closed.';
  } else if (action === 'shutdown') {
    state = 'closed';
    message = 'Permanently closed.';
  }

  await SiteState.findOneAndUpdate(
    {},
    { state, message, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  await AdminAuditLog.create({
    adminId: user._id,
    action: `emergency_${action}`,
    targetType: 'SiteState',
    targetId: 'singleton',
    reason: 'Emergency action',
    isOwnerOverride,
    ip: req.ip || 'unknown',
  });

  return NextResponse.json({ success: true });
}
