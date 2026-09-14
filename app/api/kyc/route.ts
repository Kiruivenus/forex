import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import KYCVerification from '@/models/KYCVerification';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  const kyc = await KYCVerification.findOne({ userId: auth.user.userId });
  return NextResponse.json({ success: true, kyc });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { fullName, dateOfBirth, documentType, documentNumber, country, address, documentFrontUrl, documentBackUrl, selfieUrl } = await req.json();

    if (!fullName || !dateOfBirth || !documentType || !documentNumber || !country || !address || !documentFrontUrl) {
      return NextResponse.json({ success: false, message: 'Required KYC information is missing.' }, { status: 400 });
    }

    await connectToDatabase();

    const kyc = await KYCVerification.findOneAndUpdate(
      { userId: auth.user.userId },
      {
        userId: auth.user.userId,
        fullName,
        dateOfBirth,
        documentType,
        documentNumber,
        country,
        address,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || '',
        selfieUrl: selfieUrl || '',
        status: 'PENDING',
        submittedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await Notification.create({
      userId: auth.user.userId,
      type: 'KYC',
      title: 'KYC Verification Submitted',
      message: 'Your identity document submission is under review by our compliance team.',
    });

    return NextResponse.json({ success: true, message: 'KYC submitted successfully.', kyc });
  } catch (error) {
    console.error('KYC Submission Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit KYC details.' }, { status: 500 });
  }
}
