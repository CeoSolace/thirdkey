import { Schema, model, models } from 'mongoose';

const ArtistPayoutLogSchema = new Schema({
  artistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'GBP' },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const ArtistPayoutLog = models.ArtistPayoutLog || model('ArtistPayoutLog', ArtistPayoutLogSchema);
