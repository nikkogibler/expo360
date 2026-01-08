// src/app/layout.tsx
// This file remains a Server Component (NO 'use client' at the top)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomerIdInitializer from '../components/CustomerIdInitializer'; // This is the correct import location
import GoogleAnalytics from '../components/GoogleAnalytics'; // NEW: Import Google Analytics
import StructuredData from '../components/StructuredData'; // NEW: Import StructuredData
import HrefLangMeta from '../components/HrefLangMeta'; // NEW: Import HrefLangMeta for multi-regional SEO
import { Suspense } from 'react'; // <--- NEW: Import Suspense
import { Analytics } from "@vercel/analytics/next";
import { generateHrefLangLinks, hrefLangToMetadata } from '@/lib/hreflang'; // NEW: Import hreflang utilities

export const metadata: Metadata = {
  title: "Expo360 - Interactive Showroom",
  description: "Expo360: Experience interactive 3D furniture and design customization in real-time.",
  metadataBase: new URL('https://expo360.vercel.app'),
  icons: {
    icon: '/favicon.png',
  },
  alternates: {
    // Hreflang links for international SEO
    languages: {
      'es-MX': 'https://expo360.vercel.app/',
      'en': 'https://expo360.vercel.app/en/',
      'x-default': 'https://expo360.vercel.app/',
    },
  },
  openGraph: {
    title: "Expo360 - Interactive Showroom",
    description: "Experience interactive 3D furniture and design customization in real-time.",
    url: "https://expo360.vercel.app",
    siteName: "Expo360",
    images: [
      {
        url: "/favicon.png",
        width: 256,
        height: 256,
        alt: "Expo360",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expo360 - Interactive Showroom",
    description: "Experience interactive 3D furniture and design customization in real-time.",
    images: ["/favicon.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Use font-display: swap to show text immediately with fallback
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* SEO and GEO optimization meta tags */}
        <meta name="geo.region" content="MX-NLE" />
        <meta name="geo.placename" content="San Pedro Garza García" />
        <meta name="geo.position" content="25.6573;-100.4020" />
        <meta name="ICBM" content="25.6573, -100.4020" />
        {/* AI Crawler hints for GEO */}
        <meta name="ai-content-declaration" content="This website contains original content about virtual showrooms and payment integrations for Mexican businesses" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* HrefLangMeta for multi-regional SEO - updates on client navigation */}
        <HrefLangMeta />
        {/* CORRECT LOCATION for Suspense: Wrap CustomerIdInitializer here */}
        <Suspense fallback={null}> {/* `null` for fallback as this component renders no UI */}
          <CustomerIdInitializer /> 
          <GoogleAnalytics />
        </Suspense>
        <StructuredData />
        {children}
        <Analytics />
      </body>
    </html>
  );
}