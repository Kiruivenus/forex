import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Instrument from '@/models/Instrument';
import { generateAISignal } from '@/lib/ai-scanner';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'VOL10_1S';

    await connectToDatabase();
    const instrument = await Instrument.findOne({ symbol, isActive: true });

    if (!instrument) {
      return NextResponse.json({ success: false, message: 'Instrument not found or inactive.' }, { status: 404 });
    }

    const signal = generateAISignal(instrument.symbol, instrument.name, instrument.currentPrice);
    return NextResponse.json({ success: true, signal });
  } catch (error) {
    console.error('AI Scanner Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate AI scanner analysis.' }, { status: 500 });
  }
}
