import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  method: 'MPESA' | 'CRYPTO';
  amount: number;
  fee: number;
  netAmount: number;
  destination: string; // Phone number or Crypto wallet address
  cryptoAsset?: string;
  cryptoNetwork?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    method: { type: String, enum: ['MPESA', 'CRYPTO'], required: true, index: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0.0 },
    netAmount: { type: Number, required: true },
    destination: { type: String, required: true },
    cryptoAsset: { type: String },
    cryptoNetwork: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

const Withdrawal: Model<IWithdrawal> =
  mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
export default Withdrawal;
