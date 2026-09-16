import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';
import SystemSetting from '@/models/SystemSetting';
import { initiateSTKPush } from '@/lib/mpesa';
import { initiateGravityPaySTKPush } from '@/lib/gravitypay';

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { phoneNumber, amountKES } = await req.json();

    if (!phoneNumber || !amountKES || amountKES < 10) {
      return NextResponse.json(
        { success: false, code: 'INVALID_AMOUNT', message: 'Minimum deposit amount via M-Pesa is KES 10.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get KES to USD rate from SystemSettings or default 130
    const rateSetting = await SystemSetting.findOne({ key: 'MPESA_USD_RATE' });
    const kesToUsdRate = Number(rateSetting?.value) || 130.0;
    const usdEquivalent = Number((amountKES / kesToUsdRate).toFixed(2));

    const provider = process.env.MPESA_PROVIDER || (process.env.GRAVITYPAY_API_KEY ? 'GRAVITYPAY' : 'DARAJA');

    let stkResult;
    if (provider === 'GRAVITYPAY') {
      stkResult = await initiateGravityPaySTKPush({
        phoneNumber,
        amount: amountKES,
        accountReference: 'ApexTrader',
        transactionDesc: `Deposit KES ${amountKES} ($${usdEquivalent} USD)`,
      });
    } else {
      stkResult = await initiateSTKPush({
        phoneNumber,
        amount: amountKES,
        accountReference: 'ApexTrader',
        transactionDesc: `Deposit KES ${amountKES} ($${usdEquivalent} USD)`,
      });
    }

    if (!stkResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: stkResult.code || 'STK_INITIATION_FAILED',
          message: stkResult.errorMessage || 'Failed to initiate M-Pesa payment prompt.',
        },
        { status: 400 }
      );
    }

    // Save pending transaction record
    const deposit = await Deposit.create({
      userId: auth.user.userId,
      method: 'MPESA',
      amount: amountKES,
      currency: 'KES',
      usdEquivalent,
      status: 'PENDING',
      mpesaPhoneNumber: phoneNumber,
      merchantRequestId: stkResult.merchantRequestId,
      checkoutRequestId: stkResult.checkoutRequestId,
    });

    return NextResponse.json({
      success: true,
      depositId: deposit._id.toString(),
      checkoutRequestId: stkResult.checkoutRequestId,
      customerMessage: stkResult.customerMessage || `STK Push sent to ${phoneNumber}. Please complete the prompt on your phone.`,
    });
  } catch (error) {
    console.error('M-Pesa Initiate Error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'Failed to process M-Pesa deposit request.' },
      { status: 500 }
    );
  }
}
