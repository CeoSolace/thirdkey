import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Song } from '@/models/Song';
import { roleGuard } from '@/lib/middleware/role-guard';

export async function PUT(req: NextRequest) {
  await dbConnect();

  const guardResult = await roleGuard(req, ['artist']);
  if (guardResult instanceof NextResponse) return guardResult;
  const { user } = guardResult;

  const { songId, title, adOptIn } = await req.json();

  if (!songId || !title) {
    return NextResponse.json({ error: 'Song ID and title required' }, { status: 400 });
  }

  const song = await Song.findOne({ _id: songId, artistId: user._id });
  if (!song) {
    return NextResponse.json({ error: 'Song not found or unauthorized' }, { status: 404 });
  }

  song.title = title;
  if (adOptIn !== undefined) song.adOptIn = adOptIn;

  await song.save();

  return NextResponse.json({ success: true });
}
