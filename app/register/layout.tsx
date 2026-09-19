import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Create Account | PalOption',
  description:
    'Open a free trading account on PalOption with a $10,000 demo wallet. Access Synthetic Volatility Indices, M-Pesa STK Push, and AI signal scanning.',
  alternates: {
    canonical: `${baseUrl}/register`,
  },
  openGraph: {
    title: 'Create Account | PalOption',
    description:
      'Join PalOption today. Trade Synthetic Volatility Indices with $10,000 virtual demo funds.',
    url: `${baseUrl}/register`,
    siteName: 'PalOption',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
