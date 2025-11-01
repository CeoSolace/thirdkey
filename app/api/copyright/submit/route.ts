import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Song } from '@/models/Song';
import { CopyrightClaim } from '@/models/CopyrightClaim';

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { songUrl, originalSongUrl, reason } = await req.json();

  // Extract song IDs from URLs (simplified)
  const songId = songUrl.split('/').pop();
  const originalSongId = originalSongUrl.split('/').pop();

  if (!songId || !originalSongId) {
    return NextResponse.json({ error: 'Invalid URLs' }, { status: 400 });
  }

  const infringingSong = await Song.findById(songId);
  const originalSong = await Song.findById(originalSongId);

  if (!infringingSong || !originalSong) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  if (String(originalSong.artistId) !== String(user._id)) {
    return NextResponse.json({ error: 'You must own the original song' }, { status: 403 });
  }

  // Check for existing claim
  const existing = await CopyrightClaim.findOne({
    songId,
    status: 'pending',
  });
  if (existing) {
    return NextResponse.json({ error: 'Claim already pending' }, { status: 409 });
  }

  await CopyrightClaim.create({
    claimantId: user._id,
    songId,
    originalSongId,
    reason,
  });

  // Revenue hold handled in background job

  return NextResponse.json({ success: true });
}
