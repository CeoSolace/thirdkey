import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Song } from '@/models/Song';
import { roleGuard } from '@/lib/middleware/role-guard';

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const guardResult = await roleGuard(req, ['artist']);
  if (guardResult instanceof NextResponse) return guardResult;
  const { user } = guardResult;

  const url = new URL(req.url);
  const songId = url.searchParams.get('id');

  if (!songId) {
    return NextResponse.json({ error: 'Song ID required' }, { status: 400 });
  }

  const song = await Song.findOneAndDelete({ _id: songId, artistId: user._id });
  if (!song) {
    return NextResponse.json({ error: 'Song not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
