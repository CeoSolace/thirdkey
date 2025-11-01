import { Schema, model, models } from 'mongoose';

const SiteStateSchema = new Schema({
  state: { type: String, enum: ['open', 'maintenance', 'closed'], default: 'open' },
  message: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

// Enforce singleton
SiteStateSchema.pre('save', async function (next) {
  const count = await this.constructor.estimatedDocumentCount();
  if (count > 0) {
    throw new Error('Only one SiteState document allowed');
  }
  next();
});

export const SiteState = models.SiteState || model('SiteState', SiteStateSchema);
