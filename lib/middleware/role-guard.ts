// 📁 `lib/middleware/role-guard.ts`
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth';
import { dbConnect } from '../dbConnect';
import { User } from '@/models/User';

export async function roleGuard(
  req: NextRequest,
  allowedRoles: ('user' | 'artist' | 'admin' | 'owner')[]
) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user || !allowedRoles.includes(user.role as any)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  return { user };
}
