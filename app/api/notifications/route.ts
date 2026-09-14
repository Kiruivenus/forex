import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  const notifications = await Notification.find({ userId: auth.user.userId })
    .sort({ createdAt: -1 })
    .limit(30);

  return NextResponse.json({ success: true, notifications });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  await connectToDatabase();
  await Notification.updateMany({ userId: auth.user.userId, isRead: false }, { $set: { isRead: true } });

  return NextResponse.json({ success: true, message: 'Notifications marked as read.' });
}
