'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WithdrawPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?action=withdraw');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090714] flex items-center justify-center text-slate-400 font-mono text-xs">
      Redirecting to Trader Hub...
    </div>
  );
}
