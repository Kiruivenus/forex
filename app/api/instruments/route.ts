import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Instrument from '@/models/Instrument';

const DEFAULT_INSTRUMENTS = [
  { symbol: 'VOL10_1S', name: 'Volatility 10 (1s) Index', category: 'SYNTHETIC', currentPrice: 6842.15, change24h: 1.25, volatility: 0.0015, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL75_1S', name: 'Volatility 75 (1s) Index', category: 'SYNTHETIC', currentPrice: 142850.40, change24h: -0.84, volatility: 0.0035, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL100', name: 'Volatility 100 Index', category: 'SYNTHETIC', currentPrice: 9420.80, change24h: 2.10, volatility: 0.0040, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'EURUSD', name: 'EUR/USD Forex', category: 'FOREX', currentPrice: 1.0845, change24h: 0.12, volatility: 0.0008, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'GBPUSD', name: 'GBP/USD Forex', category: 'FOREX', currentPrice: 1.2960, change24h: -0.35, volatility: 0.0010, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'BTCUSD', name: 'Bitcoin / USD Crypto', category: 'CRYPTO', currentPrice: 64250.00, change24h: 3.45, volatility: 0.0080, minStake: 1, maxStake: 1000, isActive: true },
];

export async function GET() {
  try {
    await connectToDatabase();
    let instruments = await Instrument.find({ isActive: true }).sort({ category: 1, symbol: 1 });

    if (!instruments || instruments.length === 0) {
      // Auto-populate default instruments into database if empty
      for (const inst of DEFAULT_INSTRUMENTS) {
        await Instrument.findOneAndUpdate({ symbol: inst.symbol }, inst, { upsert: true, new: true });
      }
      instruments = await Instrument.find({ isActive: true }).sort({ category: 1, symbol: 1 });
    }

    return NextResponse.json({ success: true, instruments: instruments.length > 0 ? instruments : DEFAULT_INSTRUMENTS });
  } catch (error) {
    console.error('Fetch Instruments Error:', error);
    // Return default instruments fallback even on database connection delay
    return NextResponse.json({ success: true, instruments: DEFAULT_INSTRUMENTS });
  }
}
