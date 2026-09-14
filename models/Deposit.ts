import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeposit extends Document {
  userId: mongoose.Types.ObjectId;
  method: 'MPESA' | 'CRYPTO';
  amount: number; // in USD or KES
  currency: string;
  usdEquivalent: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  mpesaPhoneNumber?: string;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  mpesaReceipt?: string;
  cryptoAsset?: string;
  cryptoNetwork?: string;
  cryptoAddress?: string;
  txHash?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    method: { type: String, enum: ['MPESA', 'CRYPTO'], required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    usdEquivalent: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    mpesaPhoneNumber: { type: String },
    merchantRequestId: { type: String, index: true },
    checkoutRequestId: { type: String, index: true },
    mpesaReceipt: { type: String },
    cryptoAsset: { type: String },
    cryptoNetwork: { type: String },
    cryptoAddress: { type: String },
    txHash: { type: String, index: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

const Deposit: Model<IDeposit> = mongoose.models.Deposit || mongoose.model<IDeposit>('Deposit', DepositSchema);
export default Deposit;
