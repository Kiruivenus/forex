import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKYCVerification extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  dateOfBirth: string;
  documentType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
  documentNumber: string;
  country: string;
  address: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_ACTION';
  adminNotes?: string;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  submittedAt: Date;
  reviewedAt?: Date;
}

const KYCVerificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    documentType: {
      type: String,
      enum: ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE'],
      required: true,
    },
    documentNumber: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    documentFrontUrl: { type: String, required: true },
    documentBackUrl: { type: String },
    selfieUrl: { type: String },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_ACTION'],
      default: 'PENDING',
      index: true,
    },
    adminNotes: { type: String },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const KYCVerification: Model<IKYCVerification> =
  mongoose.models.KYCVerification || mongoose.model<IKYCVerification>('KYCVerification', KYCVerificationSchema);
export default KYCVerification;
