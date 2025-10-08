'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenu from '../../../components/BurgerMenu';
import AdminMenu from '../../../components/AdminMenu';

export default function AirtableCRMPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #F8F5F0 0%, #E8E4DC 100%)',
        padding: '2rem',
      }}
    >
      {/* Header with Burger Menu */}
      <div style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/admin')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              cursor: 'pointer',
              color: '#4B2E09',
            }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#4B2E09',
              textAlign: 'center',
              flex: 1,
            }}
          >
            Airtable CRM
          </h1>
          <div style={{ position: 'relative' }}>
            <BurgerMenu isOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
            <AdminMenu open={menuOpen} setOpen={setMenuOpen} currentPage="airtable" />
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '3rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/admin/airtable.png"
              alt="Airtable"
              style={{
                maxWidth: '200px',
                height: 'auto',
                margin: '0 auto 2rem',
                display: 'block',
              }}
            />
            <h2
              style={{
                fontSize: '1.8rem',
                color: '#4B2E09',
                marginBottom: '1rem',
                fontWeight: 600,
              }}
            >
              Base de Datos Empresarial
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: '#666',
                maxWidth: '700px',
                margin: '0 auto 2rem',
                lineHeight: '1.6',
              }}
            >
              Accede y gestiona la base de datos completa de Kusam en Airtable. 
              Sistema CRM, ventas, seguimiento a clientes y más.
            </p>
          </div>

          {/* Airtable Embed or Link */}
          <div
            style={{
              background: '#F8F5F0',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem' }}>
              Haz clic en el botón de abajo para acceder a la base de datos de Airtable
            </p>
            <a
              href="https://airtable.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #4B2E09 0%, #6D4520 100%)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(75, 46, 9, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(75, 46, 9, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 46, 9, 0.3)';
              }}
            >
              Abrir Airtable CRM →
            </a>
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
              Se abrirá en una nueva pestaña
            </p>
          </div>

          {/* Info Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            <div
              style={{
                background: '#F8F5F0',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ color: '#4B2E09', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                📊 CRM Completo
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Gestión completa de clientes, leads y oportunidades de venta
              </p>
            </div>

            <div
              style={{
                background: '#F8F5F0',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ color: '#4B2E09', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                💰 Ventas
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Seguimiento de ventas, cotizaciones y transacciones
              </p>
            </div>

            <div
              style={{
                background: '#F8F5F0',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ color: '#4B2E09', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                📈 Análisis
              </h3>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                Reportes y análisis de datos empresariales en tiempo real
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
