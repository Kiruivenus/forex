import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { verifyGravityPayWebhookSignature } from '@/lib/gravitypay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-webhook-signature') || req.headers.get('X-Webhook-Signature');

    // Verify Webhook HMAC signature if WEBHOOK_SECRET is configured
    const isValidSignature = verifyGravityPayWebhookSignature(rawBody, signatureHeader);
    if (!isValidSignature) {
      console.warn('GravityPay Callback: Invalid webhook signature header');
      return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody || '{}');

    // Official GravityPay callback payload parameters
    const checkoutRequestId =
      body?.checkoutRequestId ||
      body?.checkout_request_id ||
      body?.CheckoutRequestID;

    const merchantRequestId =
      body?.merchantRequestId ||
      body?.merchant_request_id ||
      body?.MerchantRequestID;

    const status = (body?.status || body?.state || '').toLowerCase();
    const isSuccess = status === 'success' || status === 'completed' || body?.errorCode === 0 || body?.ResultCode === 0;

    if (!checkoutRequestId && !merchantRequestId) {
      return NextResponse.json({ success: false, message: 'Missing transaction identifier' }, { status: 400 });
    }

    await connectToDatabase();

    // Query deposit record
    let deposit = null;
    if (checkoutRequestId) {
      deposit = await Deposit.findOne({ checkoutRequestId });
    }
    if (!deposit && merchantRequestId) {
      deposit = await Deposit.findOne({ merchantRequestId });
    }

    if (!deposit) {
      console.warn(`GravityPay Callback: Deposit record not found for ${checkoutRequestId || merchantRequestId}`);
      return NextResponse.json({ success: true, message: 'Deposit record not found, acknowledged' });
    }

    // Idempotency: skip processing if already finalized
    if (deposit.status === 'COMPLETED' || deposit.status === 'FAILED') {
      return NextResponse.json({ success: true, message: 'Transaction already processed' });
    }

    if (isSuccess) {
      const mpesaReceipt =
        body?.mpesaReceipt ||
        body?.mpesa_receipt ||
        body?.receipt ||
        `GP${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      deposit.status = 'COMPLETED';
      deposit.mpesaReceipt = mpesaReceipt;
      await deposit.save();

      // Credit USD wallet balance atomically
      const wallet = await Wallet.findOne({ userId: deposit.userId });
      if (wallet) {
        const balanceBefore = wallet.availableBalance;
        const creditAmount = deposit.usdEquivalent;
        const balanceAfter = Number((balanceBefore + creditAmount).toFixed(2));

        wallet.availableBalance = balanceAfter;
        wallet.totalDeposited = Number((wallet.totalDeposited + creditAmount).toFixed(2));
        await wallet.save();

        // Add ledger record
        await LedgerEntry.create({
          userId: deposit.userId,
          type: 'DEPOSIT',
          amount: creditAmount,
          balanceBefore,
          balanceAfter,
          referenceId: deposit._id.toString(),
          description: `GravityPay M-Pesa Deposit KES ${deposit.amount} ($${creditAmount} USD) - Receipt ${mpesaReceipt}`,
        });

        // Add notification
        await Notification.create({
          userId: deposit.userId,
          type: 'FINANCIAL',
          title: 'Deposit Successful',
          message: `Your deposit of KES ${deposit.amount} ($${creditAmount} USD) via GravityPay M-Pesa was credited to your wallet.`,
        });
      }
    } else {
      const failureReason =
        body?.errorMessage ||
        body?.error ||
        body?.message ||
        `Payment failed with status code ${body?.errorCode || 'FAILED'}`;

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

    return NextResponse.json({ success: true, message: 'Webhook callback processed successfully' });
  } catch (error) {
    console.error('GravityPay Callback Route Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
