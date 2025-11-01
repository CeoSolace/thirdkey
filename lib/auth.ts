import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { dbConnect } from './dbConnect';
import { User } from '@/models/User';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(email: string) {
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  cookies().set({
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function auth() {
  const cookie = cookies().get('session')?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, secret);
    return { user: { email: payload.email as string } };
  } catch {
    return null;
  }
}

export async function logout() {
  cookies().delete('session');
}
