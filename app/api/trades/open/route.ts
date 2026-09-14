import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Instrument from '@/models/Instrument';
import Trade from '@/models/Trade';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { evaluateTradeContract, generateNextTickPrice, TradeType, TradeDirection } from '@/lib/trading-engine';

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { symbol, tradeType, direction, stake, barrier, durationSeconds = 3, accountMode = 'REAL', isAiScanner = false } = await req.json();

    if (!symbol || !tradeType || !direction || !stake || stake <= 0) {
      return NextResponse.json(
        { success: false, code: 'INVALID_TRADE_PARAMS', message: 'Valid symbol, trade type, direction, and stake amount are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(auth.user.userId);
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, message: 'User account is restricted from trading.' }, { status: 403 });
    }

    let instrument = await Instrument.findOne({ symbol, isActive: true });
    if (!instrument) {
      instrument = await Instrument.create({
        symbol: symbol || 'VOL10_1S',
        name: symbol === 'VOL10_1S' ? 'Volatility 10 (1s) Index' : symbol,
        category: 'SYNTHETIC',
        currentPrice: 6842.15,
        volatility: 0.0015,
        minStake: 1,
        maxStake: 1000,
        isActive: true,
      });
    }

    if (stake < instrument.minStake || stake > instrument.maxStake) {
      return NextResponse.json(
        {
          success: false,
          code: 'STAKE_OUT_OF_BOUNDS',
          message: `Stake must be between $${instrument.minStake} and $${instrument.maxStake}.`,
        },
        { status: 400 }
      );
    }

    let wallet = await Wallet.findOne({ userId: auth.user.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: auth.user.userId, availableBalance: 0, demoBalance: 10000.0 });
    }

    const isDemo = accountMode === 'DEMO';
    const currentBal = isDemo ? (wallet.demoBalance || 10000.0) : wallet.availableBalance;

    if (currentBal < stake) {
      return NextResponse.json(
        {
          success: false,
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient ${isDemo ? 'demo' : 'available'} balance ($${currentBal.toFixed(2)}) for $${stake} trade.`,
        },
        { status: 400 }
      );
    }

    // Deduct stake atomically from appropriate balance
    const balanceBeforeStake = currentBal;
    const balanceAfterStake = Number((balanceBeforeStake - stake).toFixed(2));

    if (isDemo) {
      wallet.demoBalance = balanceAfterStake;
    } else {
      wallet.availableBalance = balanceAfterStake;
    }
    await wallet.save();

    const tradeId = `TRD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const entryPrice = instrument.currentPrice;

    if (!isDemo) {
      // Record initial stake ledger for real account
      await LedgerEntry.create({
        userId: auth.user.userId,
        type: 'TRADE_STAKE',
        amount: -stake,
        balanceBefore: balanceBeforeStake,
        balanceAfter: balanceAfterStake,
        referenceId: tradeId,
        description: `Trade Stake on ${symbol} (${tradeType} - ${direction})`,
      });
    }

    // Calculate potential payout based on contract type
    let multiplier = 1.95;
    if (tradeType === 'MATCH_DIFFER') multiplier = direction === 'MATCH' ? 8.5 : 1.1;
    else if (tradeType === 'OVER_UNDER') multiplier = 1.9;

    const potentialPayout = Number((stake * multiplier).toFixed(2));

    // Create Trade Record in OPEN status
    const openTime = new Date();
    const closeTime = new Date(Date.now() + durationSeconds * 1000);

    const trade = await Trade.create({
      tradeId,
      userId: auth.user.userId,
      accountMode: isDemo ? 'DEMO' : 'REAL',
      instrumentId: instrument._id,
      symbol,
      tradeType,
      direction,
      stake,
      entryPrice,
      barrier: barrier || 5,
      multiplier,
      potentialPayout,
      payout: 0,
      profit: 0,
      status: 'OPEN',
      durationSeconds,
      openTime,
      closeTime,
      isAiScanner: Boolean(isAiScanner),
    });

    return NextResponse.json({
      success: true,
      trade: {
        tradeId: trade.tradeId,
        symbol: trade.symbol,
        tradeType: trade.tradeType,
        direction: trade.direction,
        stake: trade.stake,
        entryPrice: trade.entryPrice,
        status: trade.status,
        accountMode: trade.accountMode,
        durationSeconds: trade.durationSeconds,
        closeTime: trade.closeTime,
      },
      wallet: {
        availableBalance: wallet.availableBalance,
        demoBalance: wallet.demoBalance || 10000.0,
      },
      updatedBalance: isDemo ? wallet.demoBalance : wallet.availableBalance,
    });
  } catch (error) {
    console.error('Trade Execution Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process trade contract.' }, { status: 500 });
  }
}
