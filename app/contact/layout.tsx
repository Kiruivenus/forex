import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Contact Us | PalOption Customer Support',
  description:
    'Get in touch with PalOption 24/7 technical and compliance support desk via live chat or official email at support@paloption.com.',
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Us | PalOption Customer Support',
    description:
      'Contact PalOption customer support team for deposit assistance, KYC verification, or trading inquiry.',
    url: `${baseUrl}/contact`,
    siteName: 'PalOption',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
