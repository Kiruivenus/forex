import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICryptoAsset extends Document {
  symbol: string;
  name: string;
  network: string;
  depositAddress: string;
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFee: number;
  isActive: boolean;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CryptoAssetSchema: Schema = new Schema(
  {
    symbol: { type: String, required: true, index: true },
    name: { type: String, required: true },
    network: { type: String, required: true, index: true },
    depositAddress: { type: String, required: true },
    minDeposit: { type: Number, default: 10.0 },
    minWithdrawal: { type: Number, default: 20.0 },
    withdrawalFee: { type: Number, default: 1.0 },
    isActive: { type: Boolean, default: true, index: true },
    qrCodeUrl: { type: String },
  },
  { timestamps: true }
);

CryptoAssetSchema.index({ symbol: 1, network: 1 }, { unique: true });

const CryptoAsset: Model<ICryptoAsset> =
  mongoose.models.CryptoAsset || mongoose.model<ICryptoAsset>('CryptoAsset', CryptoAssetSchema);
export default CryptoAsset;
