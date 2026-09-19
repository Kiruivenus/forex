import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Terminal Login | PalOption',
  description:
    'Sign in to your PalOption account to access the high-frequency trading hub, live tick charts, and AI Scanner signals.',
  alternates: {
    canonical: `${baseUrl}/login`,
  },
  openGraph: {
    title: 'Terminal Login | PalOption',
    description:
      'Access your PalOption trading account, real-time charts, and position execution.',
    url: `${baseUrl}/login`,
    siteName: 'PalOption',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
