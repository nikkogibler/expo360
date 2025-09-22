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
  title: "Kusam Expo App",
  description: "Official Kusam Expo Mobile Web Application",
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