import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import CryptoAsset from '@/models/CryptoAsset';
import Deposit from '@/models/Deposit';
import SystemSetting from '@/models/SystemSetting';

const DEFAULT_ASSETS = [
  {
    symbol: 'USDT',
    name: 'Tether USD (TRC20)',
    network: 'TRC20',
    settingKey: 'USDT_TRC20_ADDRESS',
    defaultAddress: 'TYu8aX9kL3pQmRn2vW7zH1bC4dE5fG6hJk',
    minDeposit: 5,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (ERC20)',
    network: 'ERC20',
    settingKey: 'USDT_ERC20_ADDRESS',
    defaultAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    minDeposit: 5,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'BTC',
    settingKey: 'BTC_ADDRESS',
    defaultAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    minDeposit: 10,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ETH',
    settingKey: 'ETH_ADDRESS',
    defaultAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    minDeposit: 10,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    const settingsList = await SystemSetting.find({});
    const dbAssets = await CryptoAsset.find({ isActive: true });

    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = String(s.value || '');
    });

    // Combine default assets with Admin System Settings addresses
    const combinedAssets = DEFAULT_ASSETS.map((def) => {
      const dbMatch = dbAssets.find((a) => a.symbol === def.symbol && a.network === def.network);
      const address = settingsMap[def.settingKey] || dbMatch?.depositAddress || def.defaultAddress;
      return {
        symbol: def.symbol,
        name: def.name,
        network: def.network,
        depositAddress: address,
        minDeposit: dbMatch?.minDeposit || def.minDeposit,
      };
    });

    return NextResponse.json({ success: true, assets: combinedAssets });
  } catch (error) {
    console.error('Crypto Assets GET Error:', error);
    return NextResponse.json({ success: true, assets: DEFAULT_ASSETS.map(a => ({ ...a, depositAddress: a.defaultAddress })) });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { symbol, network, amountUSD, txHash, depositAddress } = await req.json();

    if (!symbol || !network || !amountUSD || !txHash) {
      return NextResponse.json(
        { success: false, message: 'Crypto asset, network, USD amount, and transaction hash are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const minDepositSetting = await SystemSetting.findOne({ key: 'MIN_DEPOSIT' });
    const minDepositLimit = Number(minDepositSetting?.value) || 5.0;

    if (amountUSD < minDepositLimit) {
      return NextResponse.json(
        { success: false, message: `Minimum deposit for ${symbol} (${network}) is $${minDepositLimit}.` },
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

    let finalAddress = depositAddress;
    if (!finalAddress) {
      const keyMap: Record<string, string> = {
        'USDT-TRC20': 'USDT_TRC20_ADDRESS',
        'USDT-ERC20': 'USDT_ERC20_ADDRESS',
        'BTC-BTC': 'BTC_ADDRESS',
        'ETH-ETH': 'ETH_ADDRESS',
      };
      const settingKey = keyMap[`${symbol}-${network}`];
      if (settingKey) {
        const addressSetting = await SystemSetting.findOne({ key: settingKey });
        if (addressSetting?.value) finalAddress = addressSetting.value;
      }
    }

    const deposit = await Deposit.create({
      userId: auth.user.userId,
      method: 'CRYPTO',
      amount: amountUSD,
      currency: 'USD',
      usdEquivalent: amountUSD,
      cryptoAsset: symbol,
      cryptoNetwork: network,
      cryptoAddress: finalAddress || 'Admin Wallet',
      txHash,
      status: 'PENDING',
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
