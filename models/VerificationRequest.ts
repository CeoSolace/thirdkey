import { Schema, model, models } from 'mongoose';

const VerificationRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
});

export const VerificationRequest = models.VerificationRequest || model('VerificationRequest', VerificationRequestSchema);
