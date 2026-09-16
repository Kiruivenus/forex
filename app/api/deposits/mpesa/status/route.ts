import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { checkGravityPayStatus } from '@/lib/gravitypay';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const checkoutRequestId = searchParams.get('checkoutRequestId');

  if (!checkoutRequestId) {
    return NextResponse.json({ success: false, message: 'Missing checkoutRequestId' }, { status: 400 });
  }

  await connectToDatabase();
  const deposit = await Deposit.findOne({ checkoutRequestId, userId: auth.user.userId });

  if (!deposit) {
    return NextResponse.json({ success: false, message: 'Deposit transaction not found' }, { status: 404 });
  }

  // If pending, check status via official GravityPay API (if configured)
  if (deposit.status === 'PENDING' && (process.env.GRAVITYPAY_SECRET_KEY || process.env.GRAVITYPAY_API_KEY)) {
    const gpStatus = await checkGravityPayStatus(checkoutRequestId);
    if (gpStatus.success && gpStatus.status) {
      const normalizedStatus = gpStatus.status.toLowerCase();
      if (normalizedStatus === 'success' || normalizedStatus === 'completed') {
        const mpesaReceipt = gpStatus.mpesaReceipt || `GP${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        deposit.status = 'COMPLETED';
        deposit.mpesaReceipt = mpesaReceipt;
        await deposit.save();

        const wallet = await Wallet.findOne({ userId: deposit.userId });
        if (wallet) {
          const balanceBefore = wallet.availableBalance;
          const creditAmount = deposit.usdEquivalent;
          const balanceAfter = Number((balanceBefore + creditAmount).toFixed(2));

          wallet.availableBalance = balanceAfter;
          wallet.totalDeposited = Number((wallet.totalDeposited + creditAmount).toFixed(2));
          await wallet.save();

          await LedgerEntry.create({
            userId: deposit.userId,
            type: 'DEPOSIT',
            amount: creditAmount,
            balanceBefore,
            balanceAfter,
            referenceId: deposit._id.toString(),
            description: `GravityPay M-Pesa Deposit KES ${deposit.amount} ($${creditAmount} USD) - Receipt ${mpesaReceipt}`,
          });

          await Notification.create({
            userId: deposit.userId,
            type: 'FINANCIAL',
            title: 'Deposit Successful',
            message: `Your deposit of KES ${deposit.amount} ($${creditAmount} USD) via GravityPay M-Pesa was credited to your wallet.`,
          });
        }
      } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') {
        deposit.status = 'FAILED';
        deposit.failureReason = gpStatus.errorMessage || 'Transaction cancelled or failed.';
        await deposit.save();
      }
    }
  }

  return NextResponse.json({
    success: true,
    status: deposit.status,
    amount: deposit.amount,
    currency: deposit.currency,
    usdEquivalent: deposit.usdEquivalent,
    failureReason: deposit.failureReason,
    mpesaReceipt: deposit.mpesaReceipt,
  });
}
