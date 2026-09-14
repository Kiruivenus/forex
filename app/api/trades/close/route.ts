import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Trade from '@/models/Trade';
import Wallet from '@/models/Wallet';
import Instrument from '@/models/Instrument';
import LedgerEntry from '@/models/LedgerEntry';
import Notification from '@/models/Notification';
import { evaluateTradeContract, generateNextTickPrice, TradeType, TradeDirection } from '@/lib/trading-engine';

export async function POST(req: NextRequest) {
  const auth = await verifyApiAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { tradeId } = await req.json();
    if (!tradeId) {
      return NextResponse.json({ success: false, message: 'Trade ID is required.' }, { status: 400 });
    }

    await connectToDatabase();

    const trade = await Trade.findOne({ tradeId, userId: auth.user.userId, status: 'OPEN' });
    if (!trade) {
      return NextResponse.json({ success: false, message: 'Open trade contract not found or already closed.' }, { status: 404 });
    }

    let instrument = await Instrument.findOne({ symbol: trade.symbol });
    const entryPrice = trade.entryPrice;
    const volatility = instrument?.volatility || 0.0015;
    const exitPrice = generateNextTickPrice(entryPrice, volatility);

    const outcome = evaluateTradeContract(
      trade.tradeType as TradeType,
      trade.direction as TradeDirection,
      entryPrice,
      exitPrice,
      trade.barrier || 5,
      trade.multiplier,
      Boolean(trade.isAiScanner)
    );

    const actualPayout = outcome.status === 'WON' ? Number((trade.stake * outcome.multiplier).toFixed(2)) : 0.0;
    const netProfit = outcome.status === 'WON' ? Number((actualPayout - trade.stake).toFixed(2)) : -trade.stake;

    trade.status = outcome.status;
    trade.exitPrice = exitPrice;
    trade.payout = actualPayout;
    trade.profit = netProfit;
    trade.closeTime = new Date();
    await trade.save();

    const wallet = await Wallet.findOne({ userId: auth.user.userId });
    if (wallet) {
      const isDemo = trade.accountMode === 'DEMO';
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
            referenceId: trade.tradeId,
            description: `Manual Early Settlement Payout for ${trade.tradeId} (${trade.symbol})`,
          });
        }
        await wallet.save();
      } else if (!isDemo) {
        wallet.totalLoss = Number((wallet.totalLoss + trade.stake).toFixed(2));
        await wallet.save();
      }
    }

    return NextResponse.json({
      success: true,
      trade,
      wallet: wallet
        ? {
            availableBalance: wallet.availableBalance,
            demoBalance: wallet.demoBalance || 10000.0,
          }
        : null,
      message: outcome.status === 'WON' ? `Position closed! Won +$${actualPayout.toFixed(2)} USD` : `Position closed! Lost -$${trade.stake.toFixed(2)} USD`,
    });
  } catch (error) {
    console.error('Error closing trade position:', error);
    return NextResponse.json({ success: false, message: 'Failed to close position.' }, { status: 500 });
  }
}
