import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Terms of Service | PalOption',
  description:
    'Read PalOption Terms of Service governing user accounts, contract execution, M-Pesa & crypto deposit processing, and trading platform rules.',
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | PalOption',
    description:
      'Official terms and conditions governing financial trading contracts on PalOption.',
    url: `${baseUrl}/terms`,
    siteName: 'PalOption',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
