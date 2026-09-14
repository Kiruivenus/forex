import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import CryptoAsset from '@/models/CryptoAsset';
import Deposit from '@/models/Deposit';

export async function GET() {
  await connectToDatabase();
  const assets = await CryptoAsset.find({ isActive: true });
  return NextResponse.json({ success: true, assets });
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { symbol, network, amountUSD, txHash } = await req.json();

    if (!symbol || !network || !amountUSD || !txHash) {
      return NextResponse.json(
        { success: false, message: 'Crypto asset, network, USD amount, and transaction hash are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const asset = await CryptoAsset.findOne({ symbol, network, isActive: true });
    if (!asset) {
      return NextResponse.json({ success: false, message: 'Selected crypto payment method is unavailable.' }, { status: 404 });
    }

    if (amountUSD < asset.minDeposit) {
      return NextResponse.json(
        { success: false, message: `Minimum deposit for ${symbol} (${network}) is $${asset.minDeposit}.` },
        { status: 400 }
      );
    }

    // Check duplicate Tx Hash
    const existingTx = await Deposit.findOne({ txHash });
    if (existingTx) {
      return NextResponse.json(
        { success: false, message: 'This transaction hash has already been submitted.' },
        { status: 409 }
      );
    }

    const deposit = await Deposit.create({
      userId: auth.user.userId,
      method: 'CRYPTO',
      amount: amountUSD,
      currency: 'USD',
      usdEquivalent: amountUSD,
      cryptoAsset: symbol,
      cryptoNetwork: network,
      cryptoAddress: asset.depositAddress,
      txHash,
      status: 'PENDING', // Crypto deposits require manual or backend blockchain confirmation
    });

    return NextResponse.json({
      success: true,
      message: 'Crypto deposit proof submitted successfully. Your transaction is pending verification.',
      depositId: deposit._id.toString(),
    });
  } catch (error) {
    console.error('Crypto Deposit Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to record crypto deposit.' }, { status: 500 });
  }
}
