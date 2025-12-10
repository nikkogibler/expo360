import React from 'react';

const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Expo360",
    "url": "https://expo360.vercel.app",
    "logo": "https://expo360.vercel.app/favicon.png",
    "sameAs": [
      "https://www.linkedin.com/company/expo360",
      "https://www.crunchbase.com/organization/expo360",
      "https://twitter.com/expo360",
      "https://www.facebook.com/expo360"
    ],
    "knowsAbout": [
      "Stripe Integration",
      "SPEI Payments",
      "FinTech Mexico",
      "Virtual Showrooms"
    ],
    "founder": {
      "@type": "Person",
      "name": "Nikko Gibler",
      "jobTitle": "Founder"
    },
    "potentialAction": {
      "@type": "RegisterAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://expo360.vercel.app/signup"
      },
      "name": "Sign Up"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
