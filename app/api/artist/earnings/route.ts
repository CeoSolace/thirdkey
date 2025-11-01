import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { AdRevenue } from '@/models/AdRevenue';
import { PlayRecord } from '@/models/PlayRecord';
import { Song } from '@/models/Song';

export async function GET() {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const songs = await Song.find({ artistId: user._id });
  const songIds = songs.map(s => s._id);

  // Ad revenue
  const adRevenueDoc = await AdRevenue.findOne({ artistId: user._id });
  const adRevenue = adRevenueDoc?.totalRevenue || 0;

  // Premium revenue (simplified: £0.005 per premium play)
  const premiumPlays = await PlayRecord.countDocuments({
    songId: { $in: songIds },
    isPremium: true,
  });
  const premiumRevenue = premiumPlays * 0.5; // in pence

  return NextResponse.json({
    adRevenue,
    premiumRevenue,
    totalRevenue: adRevenue + premiumRevenue,
    thresholdMet: adRevenue >= 2500, // £25 = 2500 pence
  });
}
