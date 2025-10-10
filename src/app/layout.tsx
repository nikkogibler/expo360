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
  title: "Kusam Outdoor Solutions",
  description: "The Official Kusam Outdoor Solutions Interactive Catalog",
  metadataBase: new URL('https://kusam.com'),
  openGraph: {
    title: "Kusam Outdoor Solutions",
    description: "The Official Kusam Outdoor Solutions Interactive Catalog",
    url: "https://kusam.com",
    siteName: "Kusam Outdoor Solutions",
    images: [
      {
        url: "/kusam_opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Kusam Outdoor Solutions",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kusam Outdoor Solutions",
    description: "The Official Kusam Outdoor Solutions Interactive Catalog",
    images: ["/kusam_opengraph.jpg"],
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
    <html lang="en">
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