import { Schema, model, models } from 'mongoose';

const SongSchema = new Schema({
  title: { type: String, required: true },
  artistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  audioUrl: { type: String, required: true },
  artworkUrl: { type: String },
  fingerprint: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isAdEligible: { type: Boolean, default: false },
  adOptIn: { type: Boolean, default: true },
  listens: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  activeMonths: { type: Number, default: 0 },
});

export const Song = models.Song || model('Song', SongSchema);
