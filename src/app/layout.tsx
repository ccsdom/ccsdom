import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Outfit } from 'next/font/google';
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";

import { Suspense } from 'react';
import { SplashScreen } from '@/components/splash-screen';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { CookieBanner } from '@/components/cookie-banner';
import { ServiceWorkerReset } from '@/components/service-worker-reset';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

const siteUrl = "https://ccsdom.fr";
const siteTitle = "CCS DOM - Domiciliation d'entreprise agréée en ligne";
const siteDescription =
  "Domiciliez votre entreprise dans un centre agréé, signez vos documents en ligne et pilotez votre courrier depuis un espace client sécurisé.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | CCS DOM",
  },
  description: siteDescription,
  applicationName: "CCS DOM",
  keywords: [
    "domiciliation entreprise",
    "domiciliation commerciale",
    "domiciliation Orly",
    "domiciliation Paris 12",
    "siège social",
    "gestion courrier entreprise",
    "attestation de domiciliation",
  ],
  authors: [{ name: "CCS DOM" }],
  creator: "CCS DOM",
  publisher: "CCS DOM",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "CCS DOM",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Logo CCS DOM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "CCS DOM",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* SplashScreen pendant le chargement Firebase */}
          <Suspense fallback={<SplashScreen />}>
            <FirebaseClientProvider>
              {children}
              <FirebaseErrorListener />
            </FirebaseClientProvider>
          </Suspense>

          {/* Composants globaux toujours rendus au-dessus du reste */}
          <Toaster />
          <CookieBanner />
          <ServiceWorkerReset />
        </ThemeProvider>
      </body>
    </html>
  );
}
