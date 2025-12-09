import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

// Define all available menu options
const allMenuOptions = [
  { label: 'Admin Dashboard', action: 'admin-dashboard', page: 'admin' },
  { label: 'Analítica y Reportes', action: 'analitica-reportes', page: 'reportes' },
  { label: 'Agregar Clientes +', action: 'agregar-clientes', page: 'sucursales' },
  { label: 'Catálogo de Productos', action: 'catalogo-productos', page: 'catalogo' },
  { label: 'Airtable CRM', action: 'airtable-crm', page: 'airtable' },
  { label: 'ProShotNow™', action: 'pro-shot-now', page: 'pro-shot-now' },
  { label: 'Soporte Interzekt', action: 'soporte-interzekt', page: 'soporte' },
  { label: 'Preferencias', action: 'settings', page: 'settings' },
];

interface AdminMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentPage?: string; // Current page identifier to filter menu options
}

const AdminMenu: React.FC<AdminMenuProps> = ({ open, setOpen, currentPage }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Filter out the current page from menu options
  const menuOptions = allMenuOptions.filter(opt => opt.page !== currentPage);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  async function handleMenuClick(action: string) {
    if (action === 'admin-dashboard') {
      router.push('/admin');
    } else if (action === 'analitica-reportes') {
      router.push('/admin/reportes');
    } else if (action === 'agregar-clientes') {
      router.push('/admin/sucursales');
    } else if (action === 'catalogo-productos') {
      router.push('/admin/catalogo');
    } else if (action === 'airtable-crm') {
      router.push('/admin/airtable');
    } else if (action === 'pro-shot-now') {
      router.push('/admin/pro-shot-now');
    } else if (action === 'soporte-interzekt') {
      router.push('/admin/soporte');
    } else if (action === 'settings') {
      router.push('/admin/settings');
    } else if (action === 'signout') {
      await supabase.auth.signOut();
      document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/signin');
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div ref={menuRef} style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: '12px', minWidth: '160px', zIndex: 100, padding: '0.5rem 0' }}>
      <style>{`
        .admin-menu-btn {
          width: 100%;
          background: none;
          border: none;
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 1rem;
          color: #4B2E09;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          outline: none;
          transition: background 0.2s, color 0.2s;
        }
        .admin-menu-btn:hover {
          background: #4B2E09;
          color: #F8F5F0;
        }
      `}</style>
      {menuOptions.map((opt) => (
        <button
          key={opt.action}
          onClick={() => handleMenuClick(opt.action)}
          className="admin-menu-btn"
        >
          {opt.label}
        </button>
      ))}
      {/* Sign Out button in red at the bottom */}
      <div style={{ borderTop: '2px solid #eee', marginTop: '0.25rem', paddingTop: '0.25rem' }} />
      <button
        onClick={() => handleMenuClick('signout')}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '0.75rem 1.5rem',
          textAlign: 'left',
          fontSize: '1rem',
          color: '#B91C1C',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: 600,
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#B91C1C';
          e.currentTarget.style.color = '#F8F5F0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#B91C1C';
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default AdminMenu;