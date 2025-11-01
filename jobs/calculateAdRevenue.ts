// 📁 `app/api/jobs/calculate-ad-revenue/route.ts`
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PlayRecord } from '@/models/PlayRecord';
import { Song } from '@/models/Song';
import { AdRevenue } from '@/models/AdRevenue';

export async function POST() {
  await dbConnect();

  // Simulate ad revenue: £0.01 per ad play
  const adPlays = await PlayRecord.aggregate([
    { $match: { isAdPlayed: true } },
    {
      $lookup: {
        from: 'songs',
        localField: 'songId',
        foreignField: '_id',
        as: 'song',
      },
    },
    { $unwind: '$song' },
    {
      $group: {
        _id: '$song.artistId',
        songId: { $first: '$songId' },
        totalPlays: { $sum: 1 },
      },
    },
  ]);

  for (const play of adPlays) {
    const revenue = play.totalPlays * 1; // £0.01 = 1 pence
    await AdRevenue.findOneAndUpdate(
      { artistId: play._id, songId: play.songId },
      {
        $inc: { totalPlays: play.totalPlays, totalRevenue: revenue },
        $set: { lastCalculated: new Date() },
        $setOnInsert: { thresholdMet: false },
      },
      { upsert: true, new: true }
    );

    // Mark threshold met if over £25
    const adRev = await AdRevenue.findOne({ artistId: play._id });
    if (adRev && adRev.totalRevenue >= 2500 && !adRev.thresholdMet) {
      await AdRevenue.updateOne({ _id: adRev._id }, { $set: { thresholdMet: true } });
    }
  }

  return NextResponse.json({ processed: adPlays.length });
}
