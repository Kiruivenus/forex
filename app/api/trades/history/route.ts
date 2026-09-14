import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Trade from '@/models/Trade';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  await connectToDatabase();
  const filter: Record<string, unknown> = { userId: auth.user.userId };
  if (status) {
    filter.status = status;
  }

  const trades = await Trade.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return NextResponse.json({ success: true, trades });
}
