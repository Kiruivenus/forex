import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  availableBalance: number;
  demoBalance: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalProfit: number;
  totalLoss: number;
  currency: string;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    availableBalance: { type: Number, default: 0.0, min: 0 },
    demoBalance: { type: Number, default: 10000.0, min: 0 },
    lockedBalance: { type: Number, default: 0.0, min: 0 },
    totalDeposited: { type: Number, default: 0.0 },
    totalWithdrawn: { type: Number, default: 0.0 },
    totalProfit: { type: Number, default: 0.0 },
    totalLoss: { type: Number, default: 0.0 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

const Wallet: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
export default Wallet;
