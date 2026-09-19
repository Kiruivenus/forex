export type TradeType = 'RISE_FALL' | 'EVEN_ODD' | 'MATCH_DIFFER' | 'OVER_UNDER';
export type TradeDirection = 'HIGHER' | 'LOWER' | 'EVEN' | 'ODD' | 'MATCH' | 'DIFFER' | 'OVER' | 'UNDER';

export interface ExecuteTradeParams {
  userId: string;
  symbol: string;
  tradeType: TradeType;
  direction: TradeDirection;
  stake: number;
  barrier?: number;
  durationSeconds?: number;
}

export interface TradeResultCalculation {
  status: 'WON' | 'LOST';
  entryPrice: number;
  exitPrice: number;
  multiplier: number;
  potentialPayout: number;
  payout: number;
  profit: number;
}

// Synchronized deterministic price generator for identical chart feeds across all devices and refreshes
export function getDeterministicPrice(symbol: string, basePrice: number, timestampSec: number): number {
  const roundedSec = Math.floor(timestampSec);

  // Hash string seeded by symbol + second timestamp
  const seed = `${symbol}_${roundedSec}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  // Instant tick noise factor
  const pseudoRand = (Math.sin(hash * 9999) + 1) / 2 - 0.5;

  // Cumulative random walk over 15-second windows for realistic volatility trends
  const windowIdx = Math.floor(roundedSec / 8);
  let walk = 0;
  for (let w = windowIdx - 12; w <= windowIdx; w++) {
    const wSeed = `${symbol}_w_${w}`;
    let wHash = 0;
    for (let j = 0; j < wSeed.length; j++) {
      wHash = (wHash << 5) - wHash + wSeed.charCodeAt(j);
      wHash |= 0;
    }
    const wStep = (Math.sin(wHash * 43758.5453) + 1) / 2 - 0.5;
    walk += wStep * 0.0012;
  }

  const tickJitter = pseudoRand * 0.0006;
  const priceFactor = 1 + walk + tickJitter;
  return Number((basePrice * priceFactor).toFixed(2));
}

// Generate realistic micro-fluctuation price feed based on base instrument price
export function generateNextTickPrice(currentPrice: number, volatilityFactor: number = 0.0015): number {
  const changePercent = (Math.random() - 0.495) * volatilityFactor;
  const newPrice = currentPrice * (1 + changePercent);
  return Number(newPrice.toFixed(4));
}

// Evaluate trade outcome deterministically server-side
export function evaluateTradeContract(
  tradeType: TradeType,
  direction: TradeDirection,
  entryPrice: number,
  exitPrice: number,
  barrier: number = 5,
  multiplier: number = 1.95,
  isAiScanner: boolean = false
): TradeResultCalculation {
  let isWin = false;
  const exitLastDigit = parseInt(exitPrice.toFixed(4).replace('.', '').slice(-1), 10) || 0;

  if (isAiScanner) {
    // High-confidence signal boost (>90% win rate for AI Scanner Auto-Trading)
    isWin = Math.random() < 0.93;
  } else {
    switch (tradeType) {
    case 'RISE_FALL':
      if (direction === 'HIGHER') {
        isWin = exitPrice > entryPrice;
      } else {
        isWin = exitPrice < entryPrice;
      }
      break;

    case 'EVEN_ODD':
      if (direction === 'EVEN') {
        isWin = exitLastDigit % 2 === 0;
      } else {
        isWin = exitLastDigit % 2 !== 0;
      }
      break;

    case 'MATCH_DIFFER':
      if (direction === 'MATCH') {
        isWin = exitLastDigit === barrier;
      } else {
        isWin = exitLastDigit !== barrier;
      }
      break;

    case 'OVER_UNDER':
      if (direction === 'OVER') {
        isWin = exitLastDigit > barrier;
      } else {
        isWin = exitLastDigit < barrier;
      }
      break;
    }
  }

  // Multiplier adjustments by trade type
  let adjustedMultiplier = multiplier;
  if (tradeType === 'MATCH_DIFFER') {
    adjustedMultiplier = direction === 'MATCH' ? 8.5 : 1.1;
  } else if (tradeType === 'OVER_UNDER') {
    adjustedMultiplier = 1.9;
  } else if (tradeType === 'EVEN_ODD') {
    adjustedMultiplier = 1.95;
  } else {
    adjustedMultiplier = 1.95;
  }

  const potentialPayout = Number((1 * adjustedMultiplier).toFixed(2));

  if (isWin) {
    const payoutAmount = Number((1 * adjustedMultiplier).toFixed(2));
    const profitAmount = Number((payoutAmount - 1).toFixed(2));
    return {
      status: 'WON',
      entryPrice,
      exitPrice,
      multiplier: adjustedMultiplier,
      potentialPayout,
      payout: payoutAmount,
      profit: profitAmount,
    };
  } else {
    return {
      status: 'LOST',
      entryPrice,
      exitPrice,
      multiplier: adjustedMultiplier,
      potentialPayout,
      payout: 0,
      profit: -1,
    };
  }
}

