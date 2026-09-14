import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInstrument extends Document {
  symbol: string;
  name: string;
  category: 'SYNTHETIC' | 'FOREX' | 'CRYPTO';
  currentPrice: number;
  change24h: number;
  volatility: number;
  isActive: boolean;
  minStake: number;
  maxStake: number;
  supportedTradeTypes: string[];
}

const InstrumentSchema: Schema = new Schema(
  {
    symbol: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['SYNTHETIC', 'FOREX', 'CRYPTO'], default: 'SYNTHETIC', index: true },
    currentPrice: { type: Number, required: true },
    change24h: { type: Number, default: 0.0 },
    volatility: { type: Number, default: 0.0015 },
    isActive: { type: Boolean, default: true, index: true },
    minStake: { type: Number, default: 1.0 },
    maxStake: { type: Number, default: 1000.0 },
    supportedTradeTypes: [{ type: String, default: ['RISE_FALL', 'EVEN_ODD', 'MATCH_DIFFER', 'OVER_UNDER'] }],
  },
  { timestamps: true }
);

const Instrument: Model<IInstrument> =
  mongoose.models.Instrument || mongoose.model<IInstrument>('Instrument', InstrumentSchema);
export default Instrument;
