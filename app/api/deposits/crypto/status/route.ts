import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const depositId = searchParams.get('depositId');

  if (!depositId) {
    return NextResponse.json({ success: false, message: 'Deposit ID is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const deposit = await Deposit.findOne({ _id: depositId, userId: auth.user.userId });

    if (!deposit) {
      return NextResponse.json({ success: false, message: 'Deposit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: deposit.status,
      failureReason: deposit.failureReason,
      amount: deposit.amount,
      usdEquivalent: deposit.usdEquivalent,
    });
  } catch (error) {
    console.error('Fetch Deposit Status Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch deposit status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { depositId, action } = await req.json();

    if (!depositId) {
      return NextResponse.json({ success: false, message: 'Deposit ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const deposit = await Deposit.findOne({ _id: depositId, userId: auth.user.userId });

    if (!deposit) {
      return NextResponse.json({ success: false, message: 'Deposit not found' }, { status: 404 });
    }

    if (action === 'EXPIRE' && (deposit.status === 'PENDING' || deposit.status === 'PROCESSING')) {
      deposit.status = 'FAILED';
      deposit.failureReason = 'Payment window expired (15 minutes time limit exceeded).';
      await deposit.save();
    }

    return NextResponse.json({
      success: true,
      status: deposit.status,
      failureReason: deposit.failureReason,
    });
  } catch (error) {
    console.error('Update Deposit Status Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update deposit status' }, { status: 500 });
  }
}
