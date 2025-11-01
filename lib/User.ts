import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'artist', 'admin', 'owner'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  tempVerified: { type: Boolean, default: false },
  tempVerifiedUntil: { type: Date },
  isPremium: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export const User = models.User || model('User', UserSchema);
