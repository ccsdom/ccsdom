
'use client';

import { Loader2 } from 'lucide-react';
import Logo from './logo';

export function SplashScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <Logo showSlogan />
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
