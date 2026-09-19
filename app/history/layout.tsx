import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Transaction & Trade History | PalOption',
  description:
    'View your full trading contract execution logs, P/L performance stats, and transaction history on PalOption.',
  alternates: {
    canonical: `${baseUrl}/history`,
  },
  openGraph: {
    title: 'Transaction & Trade History | PalOption',
    description:
      'Review your trade history, win/loss stats, and wallet transaction ledgers.',
    url: `${baseUrl}/history`,
    siteName: 'PalOption',
  },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
