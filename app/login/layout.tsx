import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'PalOption Login | Official Binary Trading Platform',
  description:
    'Sign in to your PalOption account. Access 100+ synthetic volatility indices, real-time market execution, instant M-Pesa STK Push deposits, and payouts up to 95%.',
  alternates: {
    canonical: `${baseUrl}/login`,
  },
  openGraph: {
    title: 'PalOption Login | Official Binary Trading Platform',
    description:
      'Trade smarter with real-time markets. Access 100+ assets, lightning execution, and up to 95% returns — all from one powerful platform.',
    url: `${baseUrl}/login`,
    siteName: 'PalOption',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PalOption Login | Official Binary Trading Platform',
    description:
      'Access your PalOption trading account, real-time charts, and position execution.',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

