import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Deposit from '@/models/Deposit';
import Withdrawal from '@/models/Withdrawal';
import Wallet from '@/models/Wallet';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();

  const deposits = await Deposit.find({}).sort({ createdAt: -1 }).limit(100);
  const withdrawals = await Withdrawal.find({}).sort({ createdAt: -1 }).limit(100);

  return NextResponse.json({ success: true, deposits, withdrawals });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  try {
    const { type, id, action, reason } = await req.json();

    if (!type || !id || !action) {
      return NextResponse.json({ success: false, message: 'Type, ID, and Action are required.' }, { status: 400 });
    }

    await connectToDatabase();

    if (type === 'DEPOSIT') {
      const deposit = await Deposit.findById(id);
      if (!deposit || deposit.status !== 'PENDING') {
        return NextResponse.json({ success: false, message: 'Deposit not found or already processed.' }, { status: 400 });
      }

      if (action === 'APPROVE') {
        deposit.status = 'COMPLETED';
        await deposit.save();

        const wallet = await Wallet.findOne({ userId: deposit.userId });
        if (wallet) {
          const balanceBefore = wallet.availableBalance;
          const balanceAfter = Number((balanceBefore + deposit.usdEquivalent).toFixed(2));
          wallet.availableBalance = balanceAfter;
          wallet.totalDeposited = Number((wallet.totalDeposited + deposit.usdEquivalent).toFixed(2));
          await wallet.save();

          await LedgerEntry.create({
            userId: deposit.userId,
            type: 'DEPOSIT',
            amount: deposit.usdEquivalent,
            balanceBefore,
            balanceAfter,
            referenceId: deposit._id.toString(),
            description: `Crypto Deposit Approved by Admin - ${deposit.cryptoAsset} (${deposit.cryptoNetwork})`,
          });

          await Notification.create({
            userId: deposit.userId,
            type: 'FINANCIAL',
            title: 'Deposit Approved',
            message: `Your deposit of $${deposit.usdEquivalent} USD via ${deposit.cryptoAsset || 'Crypto'} has been approved.`,
          });
        }

        await createAuditLog({
          adminId: auth.user.userId,
          adminEmail: auth.user.email,
          action: 'ADMIN_APPROVED_DEPOSIT',
          targetUserId: deposit.userId.toString(),
          targetResource: `Deposit:${deposit._id}`,
          reason: reason || 'Manual Admin Approval',
        });
      } else {
        deposit.status = 'FAILED';
        deposit.failureReason = reason || 'Rejected by administrator';
        await deposit.save();

        await createAuditLog({
          adminId: auth.user.userId,
          adminEmail: auth.user.email,
          action: 'ADMIN_REJECTED_DEPOSIT',
          targetUserId: deposit.userId.toString(),
          targetResource: `Deposit:${deposit._id}`,
          reason: reason || 'Manual Admin Rejection',
        });
      }
    } else if (type === 'WITHDRAWAL') {
      const withdrawal = await Withdrawal.findById(id);
      if (!withdrawal || withdrawal.status !== 'PENDING') {
        return NextResponse.json({ success: false, message: 'Withdrawal not found or already processed.' }, { status: 400 });
      }

      const wallet = await Wallet.findOne({ userId: withdrawal.userId });

      if (action === 'APPROVE') {
        withdrawal.status = 'COMPLETED';
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        if (wallet) {
          wallet.lockedBalance = Math.max(0, Number((wallet.lockedBalance - withdrawal.amount).toFixed(2)));
          wallet.totalWithdrawn = Number((wallet.totalWithdrawn + withdrawal.amount).toFixed(2));
          await wallet.save();
        }

        await Notification.create({
          userId: withdrawal.userId,
          type: 'FINANCIAL',
          title: 'Withdrawal Approved',
          message: `Your withdrawal of $${withdrawal.amount} USD to ${withdrawal.destination} has been completed.`,
        });

        await createAuditLog({
          adminId: auth.user.userId,
          adminEmail: auth.user.email,
          action: 'ADMIN_APPROVED_WITHDRAWAL',
          targetUserId: withdrawal.userId.toString(),
          targetResource: `Withdrawal:${withdrawal._id}`,
          reason: reason || 'Manual Admin Approval',
        });
      } else {
        // Rejection: refund locked balance back to available balance
        withdrawal.status = 'REJECTED';
        withdrawal.rejectionReason = reason || 'Rejected by administrator';
        await withdrawal.save();

        if (wallet) {
          const balanceBefore = wallet.availableBalance;
          const balanceAfter = Number((balanceBefore + withdrawal.amount).toFixed(2));

          wallet.availableBalance = balanceAfter;
          wallet.lockedBalance = Math.max(0, Number((wallet.lockedBalance - withdrawal.amount).toFixed(2)));
          await wallet.save();

          await LedgerEntry.create({
            userId: withdrawal.userId,
            type: 'ADMIN_ADJUSTMENT',
            amount: withdrawal.amount,
            balanceBefore,
            balanceAfter,
            referenceId: withdrawal._id.toString(),
            description: `Refund for rejected withdrawal: ${withdrawal.rejectionReason}`,
          });
        }

        await createAuditLog({
          adminId: auth.user.userId,
          adminEmail: auth.user.email,
          action: 'ADMIN_REJECTED_WITHDRAWAL',
          targetUserId: withdrawal.userId.toString(),
          targetResource: `Withdrawal:${withdrawal._id}`,
          reason: reason || 'Manual Admin Rejection',
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Transaction status updated successfully.' });
  } catch (error) {
    console.error('Admin Transaction Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update transaction.' }, { status: 500 });
  }
}
