import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Wallet from '@/models/Wallet';
import Withdrawal from '@/models/Withdrawal';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import SystemSetting from '@/models/SystemSetting';

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { method, amountUSD, destination, cryptoAsset, cryptoNetwork } = await req.json();

    await connectToDatabase();

    const minWithdrawalSetting = await SystemSetting.findOne({ key: 'MIN_WITHDRAWAL' });
    const minWithdrawalLimit = Number(minWithdrawalSetting?.value) || 10.0;

    if (!method || !amountUSD || !destination || amountUSD < minWithdrawalLimit) {
      return NextResponse.json(
        { success: false, code: 'INVALID_INPUT', message: `Minimum withdrawal amount is $${minWithdrawalLimit.toFixed(2)} USD.` },
        { status: 400 }
      );
    }

    const wallet = await Wallet.findOne({ userId: auth.user.userId });
    if (!wallet || wallet.availableBalance < amountUSD) {
      return NextResponse.json(
        {
          success: false,
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient available balance ($${wallet?.availableBalance || 0} USD) for withdrawal of $${amountUSD} USD.`,
        },
        { status: 400 }
      );
    }

    const fee = method === 'CRYPTO' ? 2.0 : 0.5;
    const netAmount = Number((amountUSD - fee).toFixed(2));

    if (netAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Withdrawal amount must be greater than network fees.' }, { status: 400 });
    }

    // Atomic balance deduction & lock
    const balanceBefore = wallet.availableBalance;
    const balanceAfter = Number((balanceBefore - amountUSD).toFixed(2));

    wallet.availableBalance = balanceAfter;
    wallet.lockedBalance = Number((wallet.lockedBalance + amountUSD).toFixed(2));
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      userId: auth.user.userId,
      method,
      amount: amountUSD,
      fee,
      netAmount,
      destination,
      cryptoAsset: method === 'CRYPTO' ? cryptoAsset : undefined,
      cryptoNetwork: method === 'CRYPTO' ? cryptoNetwork : undefined,
      status: 'PENDING',
    });

    // Record Ledger Entry
    await LedgerEntry.create({
      userId: auth.user.userId,
      type: 'WITHDRAWAL',
      amount: -amountUSD,
      balanceBefore,
      balanceAfter,
      referenceId: withdrawal._id.toString(),
      description: `Withdrawal request via ${method} (${destination}) - $${amountUSD} USD`,
    });

    // Send Notification
    await Notification.create({
      userId: auth.user.userId,
      type: 'FINANCIAL',
      title: 'Withdrawal Requested',
      message: `Your withdrawal request of $${amountUSD} USD to ${destination} is being processed.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully.',
      withdrawalId: withdrawal._id.toString(),
    });
  } catch (error) {
    console.error('Withdrawal Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process withdrawal request.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  const withdrawals = await Withdrawal.find({ userId: auth.user.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ success: true, withdrawals });
}
