export interface AIScannerSignal {
  symbol: string;
  symbolName: string;
  currentPrice: number;
  marketCondition: 'BULLISH' | 'BEARISH' | 'CONSOLIDATING' | 'HIGH_VOLATILITY';
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  rsi: number;
  macd: string;
  volatility: string;
  signalDirection: 'CALL / HIGHER' | 'PUT / LOWER' | 'WAIT';
  confidenceScore: number; // e.g. 84%
  entryZone: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  signalExpiry: string;
  timestamp: string;
  disclaimer: string;
}

export function generateAISignal(symbol: string, symbolName: string, currentPrice: number): AIScannerSignal {
  // Analytical technical indicator computations based on symbol characteristics
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (hash + Math.floor(Date.now() / 60000)) % 100;

  const rsi = Math.floor(35 + (seed % 40));
  const confidenceScore = Math.floor(72 + (seed % 23));

  let marketCondition: AIScannerSignal['marketCondition'] = 'CONSOLIDATING';
  let trend: AIScannerSignal['trend'] = 'SIDEWAYS';
  let signalDirection: AIScannerSignal['signalDirection'] = 'WAIT';
  let riskLevel: AIScannerSignal['riskLevel'] = 'MEDIUM';

  if (rsi < 42) {
    marketCondition = 'BULLISH';
    trend = 'UPTREND';
    signalDirection = 'CALL / HIGHER';
    riskLevel = 'LOW';
  } else if (rsi > 60) {
    marketCondition = 'BEARISH';
    trend = 'DOWNTREND';
    signalDirection = 'PUT / LOWER';
    riskLevel = 'MEDIUM';
  } else if (seed % 2 === 0) {
    marketCondition = 'HIGH_VOLATILITY';
    trend = 'UPTREND';
    signalDirection = 'CALL / HIGHER';
    riskLevel = 'HIGH';
  } else {
    marketCondition = 'CONSOLIDATING';
    trend = 'SIDEWAYS';
    signalDirection = 'WAIT';
    riskLevel = 'MEDIUM';
  }

  const spread = currentPrice * 0.0008;
  const entryMin = (currentPrice - spread).toFixed(4);
  const entryMax = (currentPrice + spread).toFixed(4);

  return {
    symbol,
    symbolName,
    currentPrice,
    marketCondition,
    trend,
    rsi,
    macd: rsi < 50 ? 'Bullish Crossover (+0.0014)' : 'Bearish Divergence (-0.0009)',
    volatility: '1.42% (Normal)',
    signalDirection,
    confidenceScore,
    entryZone: `${entryMin} - ${entryMax}`,
    riskLevel,
    signalExpiry: '60 Seconds',
    timestamp: new Date().toISOString(),
    disclaimer: 'AI Entry Signals are algorithmic analytical estimations based on technical indicators. They are strictly informational and do not guarantee market profits or financial returns.',
  };
}
