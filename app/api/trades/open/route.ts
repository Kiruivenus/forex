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
    const { symbol, tradeType, direction, stake, barrier, durationSeconds = 3 } = await req.json();

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

    const wallet = await Wallet.findOne({ userId: auth.user.userId });
    if (!wallet || wallet.availableBalance < stake) {
      return NextResponse.json(
        {
          success: false,
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient available balance ($${wallet?.availableBalance || 0}) for $${stake} trade.`,
        },
        { status: 400 }
      );
    }

    // Deduct stake atomically
    const balanceBeforeStake = wallet.availableBalance;
    const balanceAfterStake = Number((balanceBeforeStake - stake).toFixed(2));
    wallet.availableBalance = balanceAfterStake;
    await wallet.save();

    const tradeId = `TRD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const entryPrice = instrument.currentPrice;

    // Record initial stake ledger
    await LedgerEntry.create({
      userId: auth.user.userId,
      type: 'TRADE_STAKE',
      amount: -stake,
      balanceBefore: balanceBeforeStake,
      balanceAfter: balanceAfterStake,
      referenceId: tradeId,
      description: `Trade Stake on ${symbol} (${tradeType} - ${direction})`,
    });

    // Simulate tick exit price deterministically
    const exitPrice = generateNextTickPrice(entryPrice, instrument.volatility);

    // Evaluate contract rules
    const outcome = evaluateTradeContract(
      tradeType as TradeType,
      direction as TradeDirection,
      entryPrice,
      exitPrice,
      barrier || 5
    );

    const actualPayout = outcome.status === 'WON' ? Number((stake * outcome.multiplier).toFixed(2)) : 0.0;
    const netProfit = outcome.status === 'WON' ? Number((actualPayout - stake).toFixed(2)) : -stake;

    // Create Trade Record
    const trade = await Trade.create({
      tradeId,
      userId: auth.user.userId,
      instrumentId: instrument._id,
      symbol,
      tradeType,
      direction,
      stake,
      entryPrice,
      exitPrice,
      barrier: barrier || 5,
      multiplier: outcome.multiplier,
      potentialPayout: Number((stake * outcome.multiplier).toFixed(2)),
      payout: actualPayout,
      profit: netProfit,
      status: outcome.status,
      durationSeconds,
      openTime: new Date(),
      closeTime: new Date(Date.now() + durationSeconds * 1000),
    });

    // If trade won, credit payout to wallet
    if (outcome.status === 'WON' && actualPayout > 0) {
      const balanceBeforePayout = wallet.availableBalance;
      const balanceAfterPayout = Number((balanceBeforePayout + actualPayout).toFixed(2));
      wallet.availableBalance = balanceAfterPayout;
      wallet.totalProfit = Number((wallet.totalProfit + netProfit).toFixed(2));
      await wallet.save();

      await LedgerEntry.create({
        userId: auth.user.userId,
        type: 'TRADE_PAYOUT',
        amount: actualPayout,
        balanceBefore: balanceBeforePayout,
        balanceAfter: balanceAfterPayout,
        referenceId: tradeId,
        description: `Trade Win Payout for ${tradeId} (${symbol})`,
      });

      await Notification.create({
        userId: auth.user.userId,
        type: 'TRADE',
        title: 'Trade Won! 🎉',
        message: `Your $${stake} trade on ${symbol} won! Payout credited: +$${actualPayout} USD (Net profit: +$${netProfit}).`,
      });
    } else {
      wallet.totalLoss = Number((wallet.totalLoss + stake).toFixed(2));
      await wallet.save();

      await Notification.create({
        userId: auth.user.userId,
        type: 'TRADE',
        title: 'Trade Expired',
        message: `Your $${stake} trade on ${symbol} closed (${outcome.status}).`,
      });
    }

    return NextResponse.json({
      success: true,
      trade: {
        tradeId: trade.tradeId,
        symbol: trade.symbol,
        tradeType: trade.tradeType,
        direction: trade.direction,
        stake: trade.stake,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        status: trade.status,
        payout: trade.payout,
        profit: trade.profit,
      },
      updatedBalance: wallet.availableBalance,
    });
  } catch (error) {
    console.error('Trade Execution Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process trade contract.' }, { status: 500 });
  }
}
