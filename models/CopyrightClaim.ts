import { Schema, model, models } from 'mongoose';

const CopyrightClaimSchema = new Schema({
  claimantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  originalSongId: { type: Schema.Types.ObjectId, ref: 'Song' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  revenueHeld: { type: Boolean, default: true },
});

export const CopyrightClaim = models.CopyrightClaim || model('CopyrightClaim', CopyrightClaimSchema);
