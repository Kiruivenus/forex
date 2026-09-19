import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Deposit Funds (M-Pesa & Crypto) | PalOption',
  description:
    'Fund your PalOption trading wallet instantly via Safaricom M-Pesa STK Push or Cryptocurrency (USDT TRC20, ERC20, BTC, ETH) with zero hidden fees.',
  alternates: {
    canonical: `${baseUrl}/deposit`,
  },
  openGraph: {
    title: 'Deposit Funds (M-Pesa & Crypto) | PalOption',
    description:
      'Instant Safaricom M-Pesa STK push and crypto deposit methods for PalOption trading balance.',
    url: `${baseUrl}/deposit`,
    siteName: 'PalOption',
  },
};

export default function DepositLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
