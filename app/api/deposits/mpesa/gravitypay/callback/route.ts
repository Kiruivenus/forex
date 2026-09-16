import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Handle GravityPay direct payload or forwarded Daraja callback structure
    const stkCallback = body?.Body?.stkCallback;

    const checkoutRequestId =
      stkCallback?.CheckoutRequestID ||
      body?.checkout_request_id ||
      body?.checkoutRequestId ||
      body?.CheckoutRequestID ||
      body?.id;

    const merchantRequestId =
      stkCallback?.MerchantRequestID ||
      body?.merchant_request_id ||
      body?.merchantRequestId ||
      body?.MerchantRequestID;

    const status =
      body?.status ||
      body?.state ||
      (stkCallback?.ResultCode === 0 ? 'COMPLETED' : 'FAILED');

    const isSuccess =
      status === 'COMPLETED' ||
      status === 'SUCCESS' ||
      status === 'success' ||
      status === 'COMPLETED_SUCCESS' ||
      stkCallback?.ResultCode === 0;

    if (!checkoutRequestId && !merchantRequestId) {
      return NextResponse.json({ success: false, message: 'Invalid callback payload' }, { status: 400 });
    }

    await connectToDatabase();

    // Query deposit by checkoutRequestId or merchantRequestId
    let deposit = null;
    if (checkoutRequestId) {
      deposit = await Deposit.findOne({ checkoutRequestId });
    }
    if (!deposit && merchantRequestId) {
      deposit = await Deposit.findOne({ merchantRequestId });
    }

    if (!deposit) {
      console.warn(`GravityPay Callback: Deposit not found for ${checkoutRequestId || merchantRequestId}`);
      return NextResponse.json({ success: true, message: 'Deposit record not found, acknowledged' });
    }

    // Idempotency check: ignore if already processed
    if (deposit.status === 'COMPLETED' || deposit.status === 'FAILED') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    if (isSuccess) {
      // Extract receipt number from GravityPay body or Daraja CallbackMetadata
      let mpesaReceipt =
        body?.mpesa_receipt ||
        body?.mpesaReceiptNumber ||
        body?.mpesaReceipt ||
        body?.receipt ||
        body?.receipt_number;

      if (!mpesaReceipt && stkCallback?.CallbackMetadata?.Item) {
        for (const item of stkCallback.CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceipt = String(item.Value);
          }
        }
      }

      if (!mpesaReceipt) {
        mpesaReceipt = `GP${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      }

      deposit.status = 'COMPLETED';
      deposit.mpesaReceipt = mpesaReceipt;
      await deposit.save();

      // Atomically update user wallet balance
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
          description: `GravityPay STK Deposit KES ${deposit.amount} ($${creditAmount} USD) - Receipt ${mpesaReceipt}`,
        });

        // Notify User
        await Notification.create({
          userId: deposit.userId,
          type: 'FINANCIAL',
          title: 'Deposit Successful',
          message: `Your deposit of KES ${deposit.amount} ($${creditAmount} USD) via GravityPay M-Pesa was credited to your wallet.`,
        });
      }
    } else {
      const failureReason =
        body?.failure_reason ||
        body?.error ||
        body?.message ||
        stkCallback?.ResultDesc ||
        'Payment cancelled or failed.';

      deposit.status = 'FAILED';
      deposit.failureReason = failureReason;
      await deposit.save();

      await Notification.create({
        userId: deposit.userId,
        type: 'FINANCIAL',
        title: 'Deposit Failed',
        message: `M-Pesa deposit of KES ${deposit.amount} failed: ${failureReason}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Callback processed successfully' });
  } catch (error) {
    console.error('GravityPay Callback Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
