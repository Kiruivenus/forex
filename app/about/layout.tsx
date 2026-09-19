import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'About PalOption | High-Frequency Trading Platform',
  description:
    'Learn about PalOption institutional trading engine, synthetic market algorithms, security architecture, and commitment to transparent, microsecond contract execution.',
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: 'About PalOption | High-Frequency Trading Platform',
    description:
      'Discover PalOption technology stack, synthetic index pricing algorithms, and instant mobile money settlement engine.',
    url: `${baseUrl}/about`,
    siteName: 'PalOption',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
