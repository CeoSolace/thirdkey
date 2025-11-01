import { Schema, model, models } from 'mongoose';

const AdminAuditLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  reason: { type: String },
  isOwnerOverride: { type: Boolean, default: false },
  ip: { type: String },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export const AdminAuditLog = models.AdminAuditLog || model('AdminAuditLog', AdminAuditLogSchema);
