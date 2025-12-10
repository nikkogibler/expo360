import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stripe + Expo360 - Métodos de Pago",
  description: "Con Stripe integrado en Expo360, accede a más de 100 métodos de pago internacionales y maximiza tus ventas en tiempo real.",
};

export default function StripeBenefitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen">
      {/* Preload critical LCP image - WebP for modern browsers */}
      <link
        rel="preload"
        href="/stripe_hero.webp"
        as="image"
        type="image/webp"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/expo360_logo.webp"
        as="image"
        type="image/webp"
      />
      {children}
    </div>
  );
}
