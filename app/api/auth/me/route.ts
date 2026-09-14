import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  const user = await User.findById(auth.user.userId).select('-passwordHash -twoFactorSecret');
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  let wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) {
    wallet = await Wallet.create({ userId: user._id, availableBalance: 0.0, demoBalance: 10000.0, lockedBalance: 0.0, currency: 'USD' });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      country: user.country,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      status: user.status,
      createdAt: user.createdAt,
    },
    wallet: {
      availableBalance: wallet.availableBalance,
      demoBalance: wallet.demoBalance || 10000.0,
      lockedBalance: wallet.lockedBalance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalProfit: wallet.totalProfit,
      currency: wallet.currency,
    },
  });
}
