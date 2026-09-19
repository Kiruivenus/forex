import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Withdraw Funds | PalOption',
  description:
    'Withdraw your trading profits quickly and securely to your Safaricom M-Pesa account or crypto wallet on PalOption.',
  alternates: {
    canonical: `${baseUrl}/withdraw`,
  },
  openGraph: {
    title: 'Withdraw Funds | PalOption',
    description:
      'Fast, secure withdrawals via M-Pesa and Cryptocurrency on PalOption.',
    url: `${baseUrl}/withdraw`,
    siteName: 'PalOption',
  },
};

export default function WithdrawLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
