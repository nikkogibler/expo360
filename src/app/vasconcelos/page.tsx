// src/app/vasconcelos/page.tsx
'use client';


import KusamLeadForm from '../../components/KusamLeadForm';
import { Suspense } from 'react';

export default function VasconcelosLanding() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <KusamLeadForm variant="vasconcelos" />
    </Suspense>
  );
}
