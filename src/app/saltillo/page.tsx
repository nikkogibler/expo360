// src/app/saltillo/page.tsx

'use client';
import { Suspense } from 'react';



import KusamLeadForm from '../../components/KusamLeadForm';

export default function SaltilloLanding() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <KusamLeadForm variant="saltillo" />
    </Suspense>
  );
}
