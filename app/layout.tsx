import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://apextrader.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'ApexTrader | Next-Gen HFT Trading Platform & AI Entry Scanner',
    template: '%s | ApexTrader',
  },
  description:
    'Trade Synthetic Volatility Indices (Vol 10, Vol 25, Vol 50, Vol 75, Vol 100 1s), Forex Pairs, and Crypto with microsecond tick execution, instant Safaricom M-Pesa STK Push deposits, and real-time AI Entry Scanning signals.',
  keywords: [
    'ApexTrader',
    'Apex Trader',
    'Synthetic Volatility Indices',
    'Vol 10 1s index',
    'Vol 25 1s index',
    'Vol 75 1s index',
    'Vol 100 1s index',
    'M-Pesa STK Push Forex',
    'M-Pesa Trading Platform',
    'Deriv alternative',
    'Deriv M-Pesa Kenya',
    'AI Entry Scanner',
    'AI Trading Signals',
    'Even Odd Trading Bot',
    'Match Differ Trading',
    'Over Under Trading',
    'Crypto Deposit Forex',
    'USDT TRC20 Deposit',
    'High Frequency Trading Terminal',
    'Binary Options Kenya M-Pesa',
  ],
  authors: [{ name: 'ApexTrader Technologies', url: baseUrl }],
  creator: 'ApexTrader Technologies',
  publisher: 'ApexTrader Technologies',
  category: 'Finance / Financial Trading Platform',
  applicationName: 'ApexTrader Terminal',
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'ApexTrader | Next-Gen HFT Trading Platform & AI Entry Scanner',
    description:
      'Institutional-grade high-frequency trading terminal for Volatility Indices & Forex. Instant Safaricom M-Pesa STK Push deposits, crypto support, and automated AI signal scanning.',
    url: baseUrl,
    siteName: 'ApexTrader',
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'ApexTrader High-Frequency Trading Terminal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApexTrader | HFT Trading Platform & AI Scanner',
    description:
      'Trade Volatility Indices with microsecond speed, automated Safaricom M-Pesa STK Push deposits & AI Scanner signals.',
    images: [`${baseUrl}/logo.png`],
    creator: '@apextrader',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'ApexTrader High-Frequency Trading Platform',
    url: baseUrl,
    description:
      'Institutional-grade trading terminal for Synthetic Volatility Indices, Forex, and Crypto with instant Safaricom M-Pesa STK Push deposits and AI Entry Scanning.',
    brand: {
      '@type': 'Brand',
      name: 'ApexTrader',
      logo: `${baseUrl}/logo.png`,
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Safaricom M-Pesa STK Push Instant Deposits',
      'Cryptocurrency TRC20/ERC20 Deposits & Withdrawals',
      'Synthetic Volatility Indices (Vol 10, Vol 25, Vol 50, Vol 75, Vol 100 1s)',
      'AI Entry Signal Scanner Engine',
      'Automated Target Profit & Stop Loss Risk Management',
      'Microsecond Execution Terminal',
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0e17] text-slate-100">{children}</body>
    </html>
  );
}
