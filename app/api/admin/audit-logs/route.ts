import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);

  return NextResponse.json({ success: true, logs });
}
