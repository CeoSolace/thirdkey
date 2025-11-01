import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { getAdUrl } from '@/lib/adtonos';

export async function GET(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user || user.isPremium) {
    return NextResponse.json({ adUrl: null }); // Premium skips ads
  }

  const adUrl = await getAdUrl();
  return NextResponse.json({ adUrl });
}
