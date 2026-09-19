import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Help Center & FAQs | PalOption',
  description:
    'Find step-by-step guides, M-Pesa STK push deposit instructions, trading engine rules, and answers to common trading questions on PalOption.',
  alternates: {
    canonical: `${baseUrl}/help`,
  },
  openGraph: {
    title: 'Help Center & FAQs | PalOption',
    description:
      'Search PalOption knowledge base, deposit guides, and trading FAQs.',
    url: `${baseUrl}/help`,
    siteName: 'PalOption',
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
