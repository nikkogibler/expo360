'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenu from '../../../components/BurgerMenu';
import AdminMenu from '../../../components/AdminMenu';

export default function SoporteInterzektPage() {
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
            Soporte Interzekt
          </h1>
          <div style={{ position: 'relative' }}>
            <BurgerMenu isOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
            <AdminMenu open={menuOpen} setOpen={setMenuOpen} currentPage="soporte" />
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
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <img
              src="/admin/interzekt_dashboard_background.png"
              alt="Interzekt Support"
              style={{
                maxWidth: '300px',
                height: 'auto',
                margin: '0 auto 2rem',
                display: 'block',
                borderRadius: '12px',
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
              Asistencia Técnica y Soporte
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
              Contacta al equipo de Interzekt para soporte técnico, preguntas frecuentes, 
              tutoriales y asistencia con el dashboard.
            </p>
          </div>

          {/* Contact Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem',
            }}
          >
            {/* Email Support */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F8F5F0 0%, #E8E4DC 100%)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #4B2E09',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: '#4B2E09', marginBottom: '1rem', fontSize: '1.4rem' }}>
                Email de Soporte
              </h3>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Envía tus preguntas o problemas técnicos
              </p>
              <a
                href="mailto:soporte@interzekt.com"
                style={{
                  display: 'inline-block',
                  background: '#4B2E09',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                soporte@interzekt.com
              </a>
            </div>

            {/* WhatsApp Support */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F8F5F0 0%, #E8E4DC 100%)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #25D366',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ color: '#4B2E09', marginBottom: '1rem', fontSize: '1.4rem' }}>
                WhatsApp
              </h3>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Chatea en vivo con nuestro equipo
              </p>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#25D366',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Abrir WhatsApp
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div
            style={{
              background: '#F8F5F0',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}
          >
            <h3
              style={{
                color: '#4B2E09',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              📚 Recursos de Ayuda
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  borderLeft: '4px solid #4B2E09',
                }}
              >
                <h4 style={{ color: '#4B2E09', marginBottom: '0.5rem' }}>
                  🎥 Video Tutoriales
                </h4>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                  Accede a nuestra biblioteca de video tutoriales para aprender a usar cada función del dashboard.
                </p>
              </div>

              <div
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  borderLeft: '4px solid #4B2E09',
                }}
              >
                <h4 style={{ color: '#4B2E09', marginBottom: '0.5rem' }}>
                  📖 Documentación
                </h4>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                  Consulta nuestra documentación completa con guías paso a paso para todas las herramientas.
                </p>
              </div>

              <div
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  borderLeft: '4px solid #4B2E09',
                }}
              >
                <h4 style={{ color: '#4B2E09', marginBottom: '0.5rem' }}>
                  ❓ Preguntas Frecuentes
                </h4>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                  Encuentra respuestas rápidas a las preguntas más comunes sobre el sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Chat Assistant Note */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4B2E09 0%, #6D4520 100%)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              ¿Necesitas ayuda ahora?
            </h3>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>
              Usa el asistente de chat en la esquina inferior derecha para obtener ayuda instantánea con el dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
