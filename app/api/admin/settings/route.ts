import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import SystemSetting from '@/models/SystemSetting';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();
  const settings = await SystemSetting.find({});
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  try {
    const { key, value, description } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, message: 'Key and Value are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const before = await SystemSetting.findOne({ key });

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { key, value, description: description || '', updatedBy: auth.user.email },
      { upsert: true, new: true }
    );

    await createAuditLog({
      adminId: auth.user.userId,
      adminEmail: auth.user.email,
      action: 'ADMIN_UPDATED_SYSTEM_SETTING',
      targetResource: `Setting:${key}`,
      beforeState: before ? { value: before.value } : null,
      afterState: { value: setting.value },
    });

    return NextResponse.json({ success: true, message: 'System setting updated successfully.', setting });
  } catch (error) {
    console.error('System Setting Update Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update system setting.' }, { status: 500 });
  }
}
