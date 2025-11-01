import { Schema, model, models, Model, Document } from 'mongoose';

// Define the TypeScript interface for the SiteState document
export interface ISiteState extends Document {
  state: 'open' | 'maintenance' | 'closed';
  message: string;
  updatedAt: Date;
}

// Define the schema
const SiteStateSchema = new Schema<ISiteState>({
  state: { type: String, enum: ['open', 'maintenance', 'closed'], default: 'open' },
  message: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

// Enforce singleton — only one SiteState document allowed
SiteStateSchema.pre('save', async function (next) {
  const SiteStateModel = this.constructor as Model<ISiteState>;
  const count = await SiteStateModel.estimatedDocumentCount();

  // Prevent creating more than one document
  if (count > 0 && this.isNew) {
    return next(new Error('Only one SiteState document allowed'));
  }

  next();
});

// Export model (reuse existing one if already compiled)
export const SiteState =
  models.SiteState || model<ISiteState>('SiteState', SiteStateSchema);
