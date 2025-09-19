import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const menuOptions = [
  { label: 'Sign Out', action: 'signout' },
  { label: 'Change Avatar', action: 'avatar' },
  { label: 'Settings', action: 'settings' },
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
    if (action === 'signout') {
      await supabase.auth.signOut();
      document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/admin/signin');
    } else if (action === 'avatar') {
      alert('Change avatar clicked');
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
          }}
        >
          {menuOptions.map((opt) => (
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
                borderBottom: '1px solid #eee',
                outline: 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}