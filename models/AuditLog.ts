import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  targetUserId?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  reason?: string;
  ipAddress: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    targetResource: { type: String, default: 'N/A' },
    targetUserId: { type: String, index: true },
    beforeState: { type: Schema.Types.Mixed },
    afterState: { type: Schema.Types.Mixed },
    reason: { type: String },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
