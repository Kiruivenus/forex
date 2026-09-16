import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import SystemSetting from '@/models/SystemSetting';

const DEFAULT_SETTINGS: Record<string, any> = {
  MIN_DEPOSIT: 5.0,
  MIN_STAKE: 1.0,
  MAX_STAKE: 5000.0,
  MIN_WITHDRAWAL: 10.0,
  MAX_DAILY_WITHDRAWAL: 25000.0,
  MPESA_USD_RATE: 130.0,
  USDT_TRC20_ADDRESS: 'TYu8aX9kL3pQmRn2vW7zH1bC4dE5fG6hJk',
  USDT_ERC20_ADDRESS: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  BTC_ADDRESS: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH_ADDRESS: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

export async function GET() {
  try {
    await connectToDatabase();
    const settingsList = await SystemSetting.find({});

    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: settingsMap,
    });
  } catch (error) {
    console.error('Public System Settings Fetch Error:', error);
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
  }
}
