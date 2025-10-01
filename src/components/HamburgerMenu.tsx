import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const menuOptions = [
  { label: 'Admin Dashboard', action: 'admin-dashboard' },
  { label: 'Librería de Imágenes', action: 'image-library' },
  { label: 'Optimizador de Imágenes', action: 'image-optimizer' },
  { label: 'Colección de Prompts', action: 'prompt-collection' },
  { label: 'Preferencias', action: 'settings' },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
  }, [open]);

  async function handleMenuClick(action: string) {
    if (action === 'admin-dashboard') {
      router.push('/admin');
    } else if (action === 'image-library') {
      router.push('/admin/image-library');
    } else if (action === 'image-optimizer') {
      router.push('/admin/image-standardizer');
    } else if (action === 'prompt-collection') {
      router.push('/admin/pro-shot-now/prompts');
    } else if (action === 'signout') {
      await supabase.auth.signOut();
      document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/admin/signin');
    } else if (action === 'settings') {
      alert('Settings clicked');
    }
    setOpen(false);
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        aria-label="Open menu"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="7" width="32" height="3.5" rx="1.75" fill="#4B2E09" />
          <rect y="14" width="32" height="3.5" rx="1.75" fill="#4B2E09" />
          <rect y="21" width="32" height="3.5" rx="1.75" fill="#4B2E09" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            background: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            borderRadius: '12px',
            minWidth: '160px',
            zIndex: 100,
            padding: '0.5rem 0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Main menu options */}
          {menuOptions.map((opt, idx) => (
            <button
              key={opt.action}
              onClick={() => handleMenuClick(opt.action)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.75rem 1.5rem',
                textAlign: 'left',
                fontSize: '1rem',
                color: '#4B2E09',
                cursor: 'pointer',
                borderBottom: idx === menuOptions.length - 1 ? 'none' : '1px solid #eee',
                outline: 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
          {/* Sign Out at the bottom */}
          <div style={{ borderTop: '1px solid #eee', marginTop: 4 }} />
          <button
            key="signout"
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
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}