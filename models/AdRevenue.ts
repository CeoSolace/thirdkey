import { Schema, model, models } from 'mongoose';

const AdRevenueSchema = new Schema({
  songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  artistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalPlays: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 }, // in GBP pence
  thresholdMet: { type: Boolean, default: false },
  lastCalculated: { type: Date, default: Date.now },
});

export const AdRevenue = models.AdRevenue || model('AdRevenue', AdRevenueSchema);
