import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paloption.app';

export const metadata: Metadata = {
  title: 'Reset Password | PalOption',
  description:
    'Recover access to your PalOption trading account securely.',
  alternates: {
    canonical: `${baseUrl}/forgot-password`,
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
