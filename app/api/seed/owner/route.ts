import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  // 🔒 Safety: Only allow if OWNER_INIT_PASS is in env (proves it's you)
  if (!process.env.OWNER_INIT_PASS) {
    return NextResponse.json({ error: 'Not configured' }, { status: 403 });
  }

  await dbConnect();

  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPass = process.env.OWNER_INIT_PASS;

  if (!ownerEmail || !ownerPass) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const existing = await User.findOne({ email: ownerEmail });
  if (existing) {
    return NextResponse.json({ message: 'Owner already exists' });
  }

  await User.create({
    email: ownerEmail,
    password: ownerPass,
    name: 'Owner',
    role: 'owner',
    isEmailVerified: true,
  });

  return NextResponse.json({ success: true, message: 'Owner created' });
}
