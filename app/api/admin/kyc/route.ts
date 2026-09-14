import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import KYCVerification from '@/models/KYCVerification';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();
  const kycs = await KYCVerification.find({}).sort({ submittedAt: -1 }).populate('userId', 'name email phone');

  return NextResponse.json({ success: true, kycs });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  try {
    const { kycId, action, rejectionReason, adminNotes } = await req.json();

    if (!kycId || !action) {
      return NextResponse.json({ success: false, message: 'KYC ID and Action are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const kyc = await KYCVerification.findById(kycId);
    if (!kyc) {
      return NextResponse.json({ success: false, message: 'KYC record not found.' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      kyc.status = 'APPROVED';
      kyc.adminNotes = adminNotes || 'Identity verified';
      kyc.reviewedBy = auth.user.userId as unknown as import('mongoose').Types.ObjectId;
      kyc.reviewedAt = new Date();
      await kyc.save();

      await User.findByIdAndUpdate(kyc.userId, { isVerified: true });

      await Notification.create({
        userId: kyc.userId,
        type: 'KYC',
        title: 'Identity Verified! ✅',
        message: 'Your KYC verification request has been approved. You now have full trading and withdrawal access.',
      });

      await createAuditLog({
        adminId: auth.user.userId,
        adminEmail: auth.user.email,
        action: 'ADMIN_APPROVED_KYC',
        targetUserId: kyc.userId.toString(),
        targetResource: `KYC:${kyc._id}`,
      });
    } else {
      kyc.status = 'REJECTED';
      kyc.rejectionReason = rejectionReason || 'Document unreadable or invalid';
      kyc.adminNotes = adminNotes || '';
      kyc.reviewedBy = auth.user.userId as unknown as import('mongoose').Types.ObjectId;
      kyc.reviewedAt = new Date();
      await kyc.save();

      await User.findByIdAndUpdate(kyc.userId, { isVerified: false });

      await Notification.create({
        userId: kyc.userId,
        type: 'KYC',
        title: 'KYC Verification Update',
        message: `Your identity verification submission requires action: ${kyc.rejectionReason}`,
      });

      await createAuditLog({
        adminId: auth.user.userId,
        adminEmail: auth.user.email,
        action: 'ADMIN_REJECTED_KYC',
        targetUserId: kyc.userId.toString(),
        targetResource: `KYC:${kyc._id}`,
        reason: kyc.rejectionReason,
      });
    }

    return NextResponse.json({ success: true, message: `KYC ${action.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('Admin KYC Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update KYC status.' }, { status: 500 });
  }
}
