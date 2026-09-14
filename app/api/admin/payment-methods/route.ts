import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import CryptoAsset from '@/models/CryptoAsset';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  await connectToDatabase();
  const assets = await CryptoAsset.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, assets });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req, 'ADMIN');
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error || 'Forbidden' }, { status: auth.status || 403 });
  }

  try {
    const { symbol, name, network, depositAddress, minDeposit, minWithdrawal, withdrawalFee, isActive } = await req.json();

    if (!symbol || !name || !network || !depositAddress) {
      return NextResponse.json({ success: false, message: 'Symbol, name, network, and deposit address are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const asset = await CryptoAsset.findOneAndUpdate(
      { symbol: symbol.toUpperCase(), network: network.toUpperCase() },
      {
        symbol: symbol.toUpperCase(),
        name,
        network: network.toUpperCase(),
        depositAddress,
        minDeposit: Number(minDeposit) || 10,
        minWithdrawal: Number(minWithdrawal) || 20,
        withdrawalFee: Number(withdrawalFee) || 1,
        isActive: isActive !== false,
      },
      { upsert: true, new: true }
    );

    await createAuditLog({
      adminId: auth.user.userId,
      adminEmail: auth.user.email,
      action: 'ADMIN_SAVED_PAYMENT_METHOD',
      targetResource: `CryptoAsset:${asset.symbol}-${asset.network}`,
      afterState: JSON.parse(JSON.stringify(asset.toObject())),
    });

    return NextResponse.json({ success: true, message: 'Payment method saved successfully.', asset });
  } catch (error) {
    console.error('Save Payment Method Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to save payment method.' }, { status: 500 });
  }
}
