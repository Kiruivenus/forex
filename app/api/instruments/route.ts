import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Instrument from '@/models/Instrument';

const DEFAULT_INSTRUMENTS = [
  { symbol: 'VOL10_1S', name: 'Volatility 10 (1s) Index', category: 'SYNTHETIC', currentPrice: 9681.83, change24h: -1.91, volatility: 0.0015, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL10', name: 'Volatility 10 Index', category: 'SYNTHETIC', currentPrice: 6842.15, change24h: 1.25, volatility: 0.0015, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL15_1S', name: 'Volatility 15 (1s) Index', category: 'SYNTHETIC', currentPrice: 15234.50, change24h: 0.85, volatility: 0.0020, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL25_1S', name: 'Volatility 25 (1s) Index', category: 'SYNTHETIC', currentPrice: 25410.20, change24h: -0.42, volatility: 0.0025, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL25', name: 'Volatility 25 Index', category: 'SYNTHETIC', currentPrice: 25120.80, change24h: 1.10, volatility: 0.0025, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL30_1S', name: 'Volatility 30 (1s) Index', category: 'SYNTHETIC', currentPrice: 30180.40, change24h: -1.05, volatility: 0.0028, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL50_1S', name: 'Volatility 50 (1s) Index', category: 'SYNTHETIC', currentPrice: 50420.60, change24h: 0.64, volatility: 0.0030, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL50', name: 'Volatility 50 Index', category: 'SYNTHETIC', currentPrice: 49850.15, change24h: -0.92, volatility: 0.0030, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL75_1S', name: 'Volatility 75 (1s) Index', category: 'SYNTHETIC', currentPrice: 142850.40, change24h: -0.84, volatility: 0.0035, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL75', name: 'Volatility 75 Index', category: 'SYNTHETIC', currentPrice: 138900.00, change24h: 1.45, volatility: 0.0035, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL100_1S', name: 'Volatility 100 (1s) Index', category: 'SYNTHETIC', currentPrice: 9840.50, change24h: -0.55, volatility: 0.0040, minStake: 1, maxStake: 1000, isActive: true },
  { symbol: 'VOL100', name: 'Volatility 100 Index', category: 'SYNTHETIC', currentPrice: 9420.80, change24h: 2.10, volatility: 0.0040, minStake: 1, maxStake: 1000, isActive: true },
];

export async function GET() {
  try {
    await connectToDatabase();

    // Delete any legacy non-volatility instruments (BTCUSD, EURUSD, GBPUSD, etc.) from MongoDB
    await Instrument.deleteMany({ symbol: { $not: /^VOL/ } });

    // Upsert all Volatility Synthetic Indices into MongoDB
    for (const inst of DEFAULT_INSTRUMENTS) {
      await Instrument.findOneAndUpdate({ symbol: inst.symbol }, inst, { upsert: true, new: true });
    }

    const instruments = await Instrument.find({ symbol: /^VOL/, isActive: true }).sort({ symbol: 1 });

    return NextResponse.json({ success: true, instruments: instruments.length > 0 ? instruments : DEFAULT_INSTRUMENTS });
  } catch (error) {
    console.error('Fetch Instruments Error:', error);
    return NextResponse.json({ success: true, instruments: DEFAULT_INSTRUMENTS });
  }
}
