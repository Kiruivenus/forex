import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILedgerEntry extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_STAKE' | 'TRADE_PAYOUT' | 'ADMIN_ADJUSTMENT';
  accountMode?: 'REAL' | 'DEMO';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: Date;
}

const LedgerEntrySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'TRADE_STAKE', 'TRADE_PAYOUT', 'ADMIN_ADJUSTMENT'],
      required: true,
      index: true,
    },
    accountMode: { type: String, enum: ['REAL', 'DEMO'], default: 'REAL', index: true },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: String, index: true },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const LedgerEntry: Model<ILedgerEntry> =
  mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
export default LedgerEntry;
