import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Instrument from '@/models/Instrument';

export async function GET() {
  try {
    await connectToDatabase();
    const instruments = await Instrument.find({ isActive: true }).sort({ category: 1, symbol: 1 });
    return NextResponse.json({ success: true, instruments });
  } catch (error) {
    console.error('Fetch Instruments Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch instruments.' }, { status: 500 });
  }
}
