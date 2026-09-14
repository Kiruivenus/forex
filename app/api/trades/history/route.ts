import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Trade from '@/models/Trade';
import Wallet from '@/models/Wallet';
import Instrument from '@/models/Instrument';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { evaluateTradeContract, generateNextTickPrice, TradeType, TradeDirection } from '@/lib/trading-engine';

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  await connectToDatabase();

  // Auto-settle any OPEN trades whose contract duration has elapsed
  const now = new Date();
  const openTrades = await Trade.find({ userId: auth.user.userId, status: 'OPEN' });

  for (const t of openTrades) {
    const openTimeDate = t.openTime ? new Date(t.openTime) : new Date();
    const closeTimeDate = t.closeTime ? new Date(t.closeTime) : new Date();
    const elapsedSeconds = (now.getTime() - openTimeDate.getTime()) / 1000;

    if (elapsedSeconds >= t.durationSeconds || now >= closeTimeDate) {
      let instrument = await Instrument.findOne({ symbol: t.symbol });
      const entryPrice = t.entryPrice;
      const volatility = instrument?.volatility || 0.0015;
      const exitPrice = generateNextTickPrice(entryPrice, volatility);

      const outcome = evaluateTradeContract(
        t.tradeType as TradeType,
        t.direction as TradeDirection,
        entryPrice,
        exitPrice,
        t.barrier || 5,
        t.multiplier,
        Boolean(t.isAiScanner)
      );

      const actualPayout = outcome.status === 'WON' ? Number((t.stake * outcome.multiplier).toFixed(2)) : 0.0;
      const netProfit = outcome.status === 'WON' ? Number((actualPayout - t.stake).toFixed(2)) : -t.stake;

      t.status = outcome.status;
      t.exitPrice = exitPrice;
      t.payout = actualPayout;
      t.profit = netProfit;
      await t.save();

      const wallet = await Wallet.findOne({ userId: auth.user.userId });
      if (wallet) {
        const isDemo = t.accountMode === 'DEMO';
        if (outcome.status === 'WON' && actualPayout > 0) {
          if (isDemo) {
            wallet.demoBalance = Number(((wallet.demoBalance || 10000.0) + actualPayout).toFixed(2));
          } else {
            const balanceBeforePayout = wallet.availableBalance;
            const balanceAfterPayout = Number((balanceBeforePayout + actualPayout).toFixed(2));
            wallet.availableBalance = balanceAfterPayout;
            wallet.totalProfit = Number((wallet.totalProfit + netProfit).toFixed(2));

            await LedgerEntry.create({
              userId: auth.user.userId,
              type: 'TRADE_PAYOUT',
              amount: actualPayout,
              balanceBefore: balanceBeforePayout,
              balanceAfter: balanceAfterPayout,
              referenceId: t.tradeId,
              description: `Trade Win Payout for ${t.tradeId} (${t.symbol})`,
            });
          }
          await wallet.save();

          await Notification.create({
            userId: auth.user.userId,
            type: 'TRADE',
            title: 'Trade Won! 🎉',
            message: `Your $${t.stake} ${isDemo ? '(Demo)' : ''} trade on ${t.symbol} won! Payout credited: +$${actualPayout} USD.`,
          });
        } else {
          if (!isDemo) {
            wallet.totalLoss = Number((wallet.totalLoss + t.stake).toFixed(2));
            await wallet.save();
          }

          await Notification.create({
            userId: auth.user.userId,
            type: 'TRADE',
            title: 'Trade Expired',
            message: `Your $${t.stake} ${isDemo ? '(Demo)' : ''} trade on ${t.symbol} expired.`,
          });
        }
      }
    }
  }

  const filter: Record<string, unknown> = { userId: auth.user.userId };
  if (status) {
    filter.status = status;
  }

  const trades = await Trade.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  return NextResponse.json({ success: true, trades });
}
