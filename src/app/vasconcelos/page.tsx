// src/app/vasconcelos/page.tsx
'use client';

import React from 'react';

import KusamLeadForm from '../../components/KusamLeadForm';

export default function VasconcelosLanding() {
  return (
    <React.Suspense fallback={<div>Cargando...</div>}>
      <KusamLeadForm variant="vasconcelos" />
    </React.Suspense>
  );
}
