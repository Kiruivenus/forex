import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();
  const users = await User.find({}).sort({ createdAt: -1 }).select('-passwordHash');

  // Fetch wallets for users
  const wallets = await Wallet.find({});
  const walletMap = new Map(wallets.map((w) => [w.userId.toString(), w]));

  const enrichedUsers = users.map((u) => {
    const w = walletMap.get(u._id.toString());
    return {
      ...u.toObject(),
      wallet: w
        ? {
            availableBalance: w.availableBalance,
            lockedBalance: w.lockedBalance,
            totalDeposited: w.totalDeposited,
            totalWithdrawn: w.totalWithdrawn,
          }
        : { availableBalance: 0, lockedBalance: 0, totalDeposited: 0, totalWithdrawn: 0 },
    };
  });

  return NextResponse.json({ success: true, users: enrichedUsers });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  try {
    const { userId, status, balanceAdjustment, adjustmentReason } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Target user not found.' }, { status: 404 });
    }

    const beforeState = { status: targetUser.status };

    if (status && ['ACTIVE', 'SUSPENDED', 'LOCKED'].includes(status)) {
      targetUser.status = status;
      await targetUser.save();

      await createAuditLog({
        adminId: auth.user.userId,
        adminEmail: auth.user.email,
        action: 'ADMIN_UPDATED_USER_STATUS',
        targetUserId: userId,
        targetResource: `User:${targetUser.email}`,
        beforeState,
        afterState: { status: targetUser.status },
        reason: adjustmentReason || 'Status update via Admin portal',
      });
    }

    if (balanceAdjustment && typeof balanceAdjustment === 'number' && balanceAdjustment !== 0) {
      if (!adjustmentReason) {
        return NextResponse.json({ success: false, message: 'Adjustment reason is required for balance modifications.' }, { status: 400 });
      }

      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        const balanceBefore = wallet.availableBalance;
        const balanceAfter = Number((balanceBefore + balanceAdjustment).toFixed(2));

        if (balanceAfter < 0) {
          return NextResponse.json({ success: false, message: 'Balance adjustment cannot result in negative available balance.' }, { status: 400 });
        }

        wallet.availableBalance = balanceAfter;
        await wallet.save();

        await LedgerEntry.create({
          userId,
          type: 'ADMIN_ADJUSTMENT',
          amount: balanceAdjustment,
          balanceBefore,
          balanceAfter,
          description: `Admin balance adjustment by ${auth.user.email}: ${adjustmentReason}`,
        });

        await createAuditLog({
          adminId: auth.user.userId,
          adminEmail: auth.user.email,
          action: 'ADMIN_ADJUSTED_BALANCE',
          targetUserId: userId,
          targetResource: `Wallet:${userId}`,
          beforeState: { balanceBefore },
          afterState: { balanceAfter, adjustment: balanceAdjustment },
          reason: adjustmentReason,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('Admin Update User Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user.' }, { status: 500 });
  }
}
