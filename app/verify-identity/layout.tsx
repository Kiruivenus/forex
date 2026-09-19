import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Identity Verification (KYC) | PalOption',
  description:
    'Complete your identity verification (KYC) to secure your trading account and enable higher withdrawal limits on PalOption.',
  alternates: {
    canonical: `${baseUrl}/verify-identity`,
  },
  openGraph: {
    title: 'Identity Verification (KYC) | PalOption',
    description:
      'Government identity verification and AML compliance checks on PalOption.',
    url: `${baseUrl}/verify-identity`,
    siteName: 'PalOption',
  },
};

export default function VerifyIdentityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
