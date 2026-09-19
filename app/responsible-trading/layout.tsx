import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Responsible Trading Policy | PalOption',
  description:
    'Read PalOption responsible trading policies, risk management guidelines, analytical disclaimers, and voluntary self-exclusion options.',
  alternates: {
    canonical: `${baseUrl}/responsible-trading`,
  },
  openGraph: {
    title: 'Responsible Trading Policy | PalOption',
    description:
      'PalOption risk disclosure, analytical disclaimers, and self-exclusion options.',
    url: `${baseUrl}/responsible-trading`,
    siteName: 'PalOption',
  },
};

export default function ResponsibleTradingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
