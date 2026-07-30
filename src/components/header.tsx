
"use client";

import * as React from 'react';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, Sun, Moon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Header() {
  const { setTheme, theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { scrollY } = useScroll();
  
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const headerPadding = useTransform(scrollY, [0, 50], ["1.5rem", "1rem"]);
  
  const navLinks = [
    { href: "/creation-entreprise", label: "Création" },
    { href: "/transfert-entreprise", label: "Transfert" },
    { href: "/features", label: "Plateforme" },
    { href: "/#tarifs", label: "Tarifs" },
    { href: "/blog", label: "Ressources" },
    { href: "/contact", label: "Contact" },
  ];
  
  const mobileNavLinks = [...navLinks, { href: "/login", label: "Espace client" }];

  return (
    <motion.header 
      style={{ 
        paddingTop: headerPadding,
        paddingBottom: headerPadding,
      }}
      className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-2xl transition-all duration-500 dark:border-white/10 dark:bg-slate-950/80"
    >
      <div className="container flex items-center h-12">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center space-x-2 group">
                <Logo showSlogan className="w-44 md:w-52 group-hover:scale-105 transition-transform duration-300" />
            </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex flex-[2] justify-center items-center space-x-1 gap-1 text-sm font-medium">
            {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="px-4 py-2 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/5 relative group"
            >
                {link.label}
                <motion.span 
                  className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
            </Link>
            ))}
        </nav>

        {/* Right: Actions & Mobile Menu */}
        <div className="flex-1 flex justify-end items-center gap-3">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                aria-label="Changer de thème"
                className="hidden md:inline-flex rounded-full hover:bg-primary/10 transition-colors"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Changer de thème</span>
            </Button>
             
             <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" className="rounded-full px-6 hover:bg-primary/5">
                    <Link href="/login">Espace client</Link>
                </Button>
                <Button asChild className="rounded-full px-6 shadow-premium hover:translate-y-[-2px] transition-all group">
                    <Link href="/signup" className="flex items-center gap-2">
                      Commencer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="border-l-slate-200 bg-white/95 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95">
                  <SheetTitle className="sr-only">Menu principal</SheetTitle>
                  <div className="flex flex-col h-full py-6">
                    <div className="flex justify-between items-center mb-10">
                      <Logo />
                       <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                          aria-label="Changer de thème"
                          className="rounded-full"
                      >
                          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span className="sr-only">Changer de thème</span>
                      </Button>
                    </div>
                    
                    <nav className="flex flex-col space-y-2">
                      {mobileNavLinks.map(link => (
                        <Link 
                          key={link.href} 
                          href={link.href} 
                          className="text-lg font-medium px-4 py-3 rounded-2xl hover:bg-primary/10 transition-all"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    
                    <div className="mt-auto pt-10">
                      <Button asChild className="w-full h-12 rounded-2xl shadow-premium" onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href="/signup">Commencer l'aventure</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </motion.header>
  );
}
