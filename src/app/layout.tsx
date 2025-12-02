// src/app/layout.tsx
// This file remains a Server Component (NO 'use client' at the top)

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomerIdInitializer from '../components/CustomerIdInitializer'; // This is the correct import location
import GoogleAnalytics from '../components/GoogleAnalytics'; // NEW: Import Google Analytics
import { Suspense } from 'react'; // <--- NEW: Import Suspense
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Expo360 - Interactive Showroom",
  description: "Expo360: Experience interactive 3D furniture and design customization in real-time.",
  metadataBase: new URL('https://expo360.vercel.app'),
  icons: {
    icon: '/favicon.png',
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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* CORRECT LOCATION for Suspense: Wrap CustomerIdInitializer here */}
        <Suspense fallback={null}> {/* `null` for fallback as this component renders no UI */}
          <CustomerIdInitializer /> 
          <GoogleAnalytics /> {/* NEW: Add Google Analytics tracking */}
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
  );
}