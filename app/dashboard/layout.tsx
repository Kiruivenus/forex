import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Trader Hub & Execution | PalOption',
  description:
    'Execute high-frequency trades on Synthetic Volatility Indices (Vol 10, Vol 25, Vol 75, Vol 100 1s), Forex, and Crypto with real-time charts and AI Scanner signals.',
  alternates: {
    canonical: `${baseUrl}/dashboard`,
  },
  openGraph: {
    title: 'Trader Hub & Execution | PalOption',
    description:
      'High-frequency trading terminal for Volatility Indices with real-time tick streaming and AI Scanner signals.',
    url: `${baseUrl}/dashboard`,
    siteName: 'PalOption',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
