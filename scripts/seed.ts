import { connectToDatabase } from '../lib/db';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Instrument from '../models/Instrument';
import CryptoAsset from '../models/CryptoAsset';
import SystemSetting from '../models/SystemSetting';
import FAQ from '../models/FAQ';
import HelpArticle from '../models/HelpArticle';
import { hashPassword } from '../lib/auth';

async function seed() {
  console.log('Connecting to MongoDB database...');
  await connectToDatabase();

  console.log('Seeding Admin User...');
  const adminEmail = 'admin@apextrader.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await hashPassword('AdminPass123!');
    admin = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      phone: '254700000000',
      passwordHash,
      role: 'ADMIN',
      country: 'Kenya',
      isVerified: true,
      status: 'ACTIVE',
    });

    await Wallet.create({
      userId: admin._id,
      availableBalance: 10000.0,
      lockedBalance: 0.0,
      currency: 'USD',
    });
    console.log('Admin user created successfully (admin@apextrader.com / AdminPass123!).');
  } else {
    console.log('Admin user already exists.');
  }

  console.log('Seeding Demo User...');
  const demoEmail = 'trader@apextrader.com';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    const passwordHash = await hashPassword('TraderPass123!');
    demoUser = await User.create({
      name: 'John Doe Trader',
      email: demoEmail,
      phone: '254712345678',
      passwordHash,
      role: 'USER',
      country: 'Kenya',
      isVerified: true,
      status: 'ACTIVE',
    });

    await Wallet.create({
      userId: demoUser._id,
      availableBalance: 250.0,
      lockedBalance: 0.0,
      totalDeposited: 250.0,
      currency: 'USD',
    });
    console.log('Demo trader created successfully (trader@apextrader.com / TraderPass123!).');
  }

  console.log('Seeding Instruments...');
  const instruments = [
    { symbol: 'VOL10_1S', name: 'Volatility 10 (1s) Index', category: 'SYNTHETIC', currentPrice: 6842.15, change24h: 1.25, volatility: 0.0015 },
    { symbol: 'VOL75_1S', name: 'Volatility 75 (1s) Index', category: 'SYNTHETIC', currentPrice: 142850.40, change24h: -0.84, volatility: 0.0035 },
    { symbol: 'VOL100', name: 'Volatility 100 Index', category: 'SYNTHETIC', currentPrice: 9420.80, change24h: 2.10, volatility: 0.0040 },
    { symbol: 'EURUSD', name: 'EUR/USD Forex', category: 'FOREX', currentPrice: 1.0845, change24h: 0.12, volatility: 0.0008 },
    { symbol: 'GBPUSD', name: 'GBP/USD Forex', category: 'FOREX', currentPrice: 1.2960, change24h: -0.35, volatility: 0.0010 },
    { symbol: 'BTCUSD', name: 'Bitcoin / USD Crypto', category: 'CRYPTO', currentPrice: 64250.00, change24h: 3.45, volatility: 0.0080 },
  ];

  for (const inst of instruments) {
    await Instrument.findOneAndUpdate({ symbol: inst.symbol }, inst, { upsert: true, new: true });
  }

  console.log('Seeding Crypto Payment Assets...');
  const cryptoAssets = [
    {
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'TRC20',
      depositAddress: 'T9yD14Nj9j7xP41aB2c3d4e5f6g7h8j9kL',
      minDeposit: 10.0,
      minWithdrawal: 15.0,
      withdrawalFee: 1.0,
      isActive: true,
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'ERC20',
      depositAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      minDeposit: 25.0,
      minWithdrawal: 30.0,
      withdrawalFee: 5.0,
      isActive: true,
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'BTC',
      depositAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      minDeposit: 50.0,
      minWithdrawal: 50.0,
      withdrawalFee: 3.0,
      isActive: true,
    },
  ];

  for (const asset of cryptoAssets) {
    await CryptoAsset.findOneAndUpdate({ symbol: asset.symbol, network: asset.network }, asset, {
      upsert: true,
      new: true,
    });
  }

  console.log('Seeding System Settings...');
  const settings = [
    { key: 'MIN_STAKE', value: 1.0, description: 'Minimum allowed trade stake in USD' },
    { key: 'MAX_STAKE', value: 1000.0, description: 'Maximum allowed trade stake in USD' },
    { key: 'MPESA_USD_RATE', value: 130.0, description: 'KES per 1 USD conversion rate' },
    { key: 'PLATFORM_MAINTENANCE', value: false, description: 'Emergency maintenance mode toggle' },
  ];

  for (const s of settings) {
    await SystemSetting.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true });
  }

  console.log('Seeding FAQs & Help Articles...');
  const faqs = [
    { question: 'How quickly are M-Pesa deposits credited?', answer: 'M-Pesa STK push deposits credit atomically within 3-5 seconds after PIN entry.', category: 'Deposits', order: 1 },
    { question: 'What is the minimum trade stake?', answer: 'The minimum stake per contract is $1.00.', category: 'Trading', order: 2 },
    { question: 'How does the AI Entry Scanner work?', answer: 'The AI Entry Scanner calculates technical indicator convergence (RSI, EMA, Momentum) to highlight high-probability entry points.', category: 'AI Scanner', order: 3 },
  ];

  for (const faq of faqs) {
    await FAQ.findOneAndUpdate({ question: faq.question }, faq, { upsert: true, new: true });
  }

  const helpArticles = [
    { title: 'Getting Started with ApexTrader', slug: 'getting-started-apextrader', category: 'ACCOUNT', content: 'Welcome to ApexTrader. Learn how to navigate your terminal, deposit funds, and execute trades.' },
    { title: 'Depositing via M-Pesa STK Push', slug: 'depositing-mpesa-stk', category: 'DEPOSITS', content: 'Step-by-step guide to depositing using Safaricom M-Pesa Daraja STK Push.' },
    { title: 'Understanding Synthetic Indices', slug: 'understanding-synthetic-indices', category: 'TRADING', content: 'Learn about Volatility 10 (1s), Volatility 75, and how tick contracts evaluate.' },
  ];

  for (const article of helpArticles) {
    await HelpArticle.findOneAndUpdate({ slug: article.slug }, article, { upsert: true, new: true });
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
