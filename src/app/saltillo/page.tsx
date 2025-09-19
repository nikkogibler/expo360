// src/app/saltillo/page.tsx
'use client';


import React, { Suspense } from 'react';
import KusamLeadForm from '../../components/KusamLeadForm';

export default function SaltilloLanding() {
  return (
    <Suspense>
      <KusamLeadForm variant="saltillo" />
    </Suspense>
  );
}
