"use client";

import React, { Suspense } from "react";
import KusamLeadForm from "../../components/KusamLeadForm";

export default function EventoEspecialLanding() {
  return (
    <Suspense>
      <KusamLeadForm variant="evento-especial" hideEmail />
    </Suspense>
  );
}
