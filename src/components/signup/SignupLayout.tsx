
'use client';

import { useTheme } from 'next-themes';
import { useSignupFormStore, useSignupSteps } from '@/store/signup-form-store';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { ArrowLeft, Moon, Sun, Shield } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

export const SignupLayout = ({ children }: { children: React.ReactNode }) => {
  const { setTheme, theme } = useTheme();

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-[380px_1fr] relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="absolute top-4 right-4 z-50 print:hidden flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold tracking-widest uppercase text-primary">
          <Shield className="w-3 h-3" /> Inscription Sécurisée
        </div>
        <Button
            variant="ghost"
            size="icon"
            className="backdrop-blur-md bg-background/30 border border-white/10"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Changer de thème"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Changer de thème</span>
        </Button>
      </div>

      <div className="relative z-10 w-full lg:contents">
        {children}
      </div>
    </div>
  );
};
