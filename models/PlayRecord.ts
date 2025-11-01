import { Schema, model, models } from 'mongoose';

const PlayRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  playedAt: { type: Date, default: Date.now },
  isAdPlayed: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
});

export const PlayRecord = models.PlayRecord || model('PlayRecord', PlayRecordSchema);
