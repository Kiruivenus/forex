import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'PalOption Register - Create Account | Official Binary Trading Platform',
  description:
    'Join PalOption today. Create your binary trading account in seconds, claim your free $10,000 demo funds, and trade synthetic volatility indices with payouts up to 95%.',
  alternates: {
    canonical: `${baseUrl}/register`,
  },
  openGraph: {
    title: 'PalOption Register - Create Account | Official Binary Trading Platform',
    description:
      'Open a free account on PalOption. Trade Synthetic Volatility Indices & Forex with $10,000 demo funds, instant M-Pesa STK Push, and up to 95% payouts.',
    url: `${baseUrl}/register`,
    siteName: 'PalOption',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PalOption Register | Official Binary Trading Platform',
    description:
      'Create your free PalOption account and start trading binary options on synthetic indices today.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

