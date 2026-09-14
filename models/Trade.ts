import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrade extends Document {
  tradeId: string;
  userId: mongoose.Types.ObjectId;
  accountMode: 'REAL' | 'DEMO';
  instrumentId?: mongoose.Types.ObjectId;
  symbol: string;
  tradeType: 'RISE_FALL' | 'EVEN_ODD' | 'MATCH_DIFFER' | 'OVER_UNDER';
  direction: 'HIGHER' | 'LOWER' | 'EVEN' | 'ODD' | 'MATCH' | 'DIFFER' | 'OVER' | 'UNDER';
  stake: number;
  entryPrice: number;
  exitPrice?: number;
  barrier?: number;
  multiplier: number;
  potentialPayout: number;
  payout: number;
  profit: number;
  status: 'PENDING' | 'OPEN' | 'WON' | 'LOST' | 'CANCELLED' | 'EXPIRED' | 'REJECTED';
  durationSeconds: number;
  openTime: Date;
  closeTime?: Date;
  isAiScanner?: boolean;
  createdAt: Date;
}

const TradeSchema: Schema = new Schema(
  {
    tradeId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountMode: { type: String, enum: ['REAL', 'DEMO'], default: 'REAL', index: true },
    instrumentId: { type: Schema.Types.ObjectId, ref: 'Instrument' },
    symbol: { type: String, required: true, index: true },
    tradeType: {
      type: String,
      enum: ['RISE_FALL', 'EVEN_ODD', 'MATCH_DIFFER', 'OVER_UNDER'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['HIGHER', 'LOWER', 'EVEN', 'ODD', 'MATCH', 'DIFFER', 'OVER', 'UNDER'],
      required: true,
    },
    stake: { type: Number, required: true, min: 0.1 },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    barrier: { type: Number, default: 5 },
    multiplier: { type: Number, default: 1.95 },
    potentialPayout: { type: Number, required: true },
    payout: { type: Number, default: 0.0 },
    profit: { type: Number, default: 0.0 },
    status: {
      type: String,
      enum: ['PENDING', 'OPEN', 'WON', 'LOST', 'CANCELLED', 'EXPIRED', 'REJECTED'],
      default: 'OPEN',
      index: true,
    },
    durationSeconds: { type: Number, default: 3 },
    openTime: { type: Date, default: Date.now, index: true },
    closeTime: { type: Date },
    isAiScanner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Trade: Model<ITrade> = mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);
export default Trade;
