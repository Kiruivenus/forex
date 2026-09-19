import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Privacy Policy | PalOption',
  description:
    'Learn how PalOption collects, protects, and encrypts your personal data, mobile money credentials, and verification documents.',
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | PalOption',
    description:
      'Official privacy and data protection policy of PalOption.',
    url: `${baseUrl}/privacy`,
    siteName: 'PalOption',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
