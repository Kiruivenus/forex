import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  const wallet = await Wallet.findOne({ userId: auth.user.userId });
  if (!wallet) {
    return NextResponse.json({ success: false, message: 'Wallet not found' }, { status: 404 });
  }

  const ledger = await LedgerEntry.find({ userId: auth.user.userId })
    .sort({ createdAt: -1 })
    .limit(20);

  return NextResponse.json({
    success: true,
    wallet: {
      availableBalance: wallet.availableBalance,
      lockedBalance: wallet.lockedBalance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalProfit: wallet.totalProfit,
      currency: wallet.currency,
    },
    ledger,
  });
}
