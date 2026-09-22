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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'PalOption - Official Binary Trading Platform | Up to 95% Payouts',
    template: '%s | PalOption - Official Binary Trading Platform',
  },
  description:
    'Master the markets with PalOption — the official binary trading platform. Trade 100+ synthetic indices & forex pairs with instant Safaricom M-Pesa STK Push deposits, AI Entry Scanner signals, and payouts up to 95%.',
  keywords: [
    'PalOption',
    'Pal Option',
    'PalOption Binary Trading Platform',
    'PalOption Kenya',
    'PalOption Login',
    'PalOption Register',
    'Binary Trading Platform',
    'Binary Options M-Pesa',
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
  authors: [{ name: 'PalOption Technologies', url: baseUrl }],
  creator: 'PalOption Technologies',
  publisher: 'PalOption Technologies',
  category: 'Finance / Binary Trading Platform',
  applicationName: 'PalOption',
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
    title: 'PalOption - Official Binary Trading Platform | Up to 95% Payouts',
    description:
      'Master the markets with PalOption. Access 100+ global markets, synthetic volatility indices, instant Safaricom M-Pesa STK Push deposits, and payouts up to 95%.',
    url: baseUrl,
    siteName: 'PalOption',
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'PalOption Official Binary Trading Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PalOption - Official Binary Trading Platform',
    description:
      'Trade Synthetic Volatility Indices & Forex with instant Safaricom M-Pesa deposits & up to 95% payouts on PalOption.',
    images: [`${baseUrl}/logo.png`],
    creator: '@paloption',
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

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PalOption',
    alternateName: ['PalOption Binary Trading Platform', 'Pal Option'],
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/help?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PalOption Technologies',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    sameAs: [
      'https://twitter.com/paloption',
      'https://facebook.com/paloption',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254700000000',
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili'],
    },
  };

  const financialProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'PalOption Binary Trading Platform',
    url: baseUrl,
    description:
      'Official binary trading platform for Synthetic Volatility Indices, Forex, and Crypto with instant Safaricom M-Pesa STK Push deposits, AI Entry Scanning, and payouts up to 95%.',
    brand: {
      '@type': 'Brand',
      name: 'PalOption',
      logo: `${baseUrl}/icon.svg`,
    },
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Instant Safaricom M-Pesa STK Push Deposits & Withdrawals',
      'Payouts up to 95% on Synthetic Indices & Forex',
      'Synthetic Volatility Indices (Vol 10, Vol 25, Vol 50, Vol 75, Vol 100 1s)',
      'AI Entry Signal Scanner Engine',
      'Automated Risk Control (Target Profit & Stop Loss)',
      'Microsecond Atomic Tick Execution Terminal',
    ],
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#d946ef" />
        <meta name="apple-mobile-web-app-title" content="PalOption" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('paloption_theme')||'dark';if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#0b0e17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

