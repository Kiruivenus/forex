import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Deposit from '@/models/Deposit';
import Withdrawal from '@/models/Withdrawal';
import Trade from '@/models/Trade';
import KYCVerification from '@/models/KYCVerification';
import Conversation from '@/models/Conversation';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();

  const totalUsers = await User.countDocuments({ role: 'USER' });
  const activeUsers = await User.countDocuments({ role: 'USER', status: 'ACTIVE' });
  const pendingKYC = await KYCVerification.countDocuments({ status: 'PENDING' });
  const openTickets = await Conversation.countDocuments({ status: 'OPEN' });

  // Financial aggregates from DB
  const depositsAgg = await Deposit.aggregate([
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: null, total: { $sum: '$usdEquivalent' } } },
  ]);
  const totalDeposits = depositsAgg[0]?.total || 0;

  const withdrawalsAgg = await Withdrawal.aggregate([
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalWithdrawals = withdrawalsAgg[0]?.total || 0;

  const tradesAgg = await Trade.aggregate([
    { $group: { _id: null, totalVolume: { $sum: '$stake' }, totalProfit: { $sum: '$profit' } } },
  ]);
  const totalTradeVolume = tradesAgg[0]?.totalVolume || 0;
  const netPlatformProfit = tradesAgg[0]?.totalProfit || 0;

  return NextResponse.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      pendingKYC,
      openTickets,
      totalDeposits,
      totalWithdrawals,
      totalTradeVolume,
      netPlatformProfit,
    },
  });
}
