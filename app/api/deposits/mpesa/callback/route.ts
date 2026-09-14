import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { getMpesaErrorMessage } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid Callback Payload' });
    }

    const merchantRequestId = stkCallback.MerchantRequestID;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    await connectToDatabase();

    const deposit = await Deposit.findOne({ checkoutRequestId });
    if (!deposit) {
      console.warn(`M-Pesa Callback: Deposit not found for CheckoutRequestID ${checkoutRequestId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Idempotency: Ignore if already completed/failed
    if (deposit.status === 'COMPLETED' || deposit.status === 'FAILED') {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Already Processed' });
    }

    if (resultCode === 0) {
      // Extract Receipt Number from CallbackMetadata
      let mpesaReceipt = '';
      const metaItems = stkCallback.CallbackMetadata?.Item || [];
      for (const item of metaItems) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceipt = String(item.Value);
        }
      }

      deposit.status = 'COMPLETED';
      deposit.mpesaReceipt = mpesaReceipt;
      await deposit.save();

      // Update Wallet balance atomically
      const wallet = await Wallet.findOne({ userId: deposit.userId });
      if (wallet) {
        const balanceBefore = wallet.availableBalance;
        const creditAmount = deposit.usdEquivalent;
        const balanceAfter = Number((balanceBefore + creditAmount).toFixed(2));

        wallet.availableBalance = balanceAfter;
        wallet.totalDeposited = Number((wallet.totalDeposited + creditAmount).toFixed(2));
        await wallet.save();

        // Record Ledger Entry
        await LedgerEntry.create({
          userId: deposit.userId,
          type: 'DEPOSIT',
          amount: creditAmount,
          balanceBefore,
          balanceAfter,
          referenceId: deposit._id.toString(),
          description: `M-Pesa STK Deposit KES ${deposit.amount} ($${creditAmount} USD) - Receipt ${mpesaReceipt}`,
        });

        // Notify User
        await Notification.create({
          userId: deposit.userId,
          type: 'FINANCIAL',
          title: 'Deposit Successful',
          message: `Your deposit of KES ${deposit.amount} ($${creditAmount} USD) via M-Pesa was credited to your wallet.`,
        });
      }
    } else {
      const userFriendlyReason = getMpesaErrorMessage(resultCode, resultDesc);
      deposit.status = 'FAILED';
      deposit.failureReason = userFriendlyReason;
      await deposit.save();

      await Notification.create({
        userId: deposit.userId,
        type: 'FINANCIAL',
        title: 'Deposit Failed',
        message: `M-Pesa deposit of KES ${deposit.amount} failed: ${userFriendlyReason}`,
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal Error' });
  }
}
