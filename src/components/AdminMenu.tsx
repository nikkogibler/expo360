import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const menuOptions = [
  { label: 'Sign Out', action: 'signout' },
  { label: 'Change Avatar', action: 'avatar' },
  { label: 'Settings', action: 'settings' },
];

interface AdminMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ open, setOpen }) => {
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
  }, [open, setOpen]);

  async function handleMenuClick(action: string) {
    if (action === 'signout') {
      await supabase.auth.signOut();
      document.cookie = 'user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/admin/signin');
    } else if (action === 'avatar') {
      alert('Change avatar clicked');
    } else if (action === 'settings') {
      router.push('/admin/settings');
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
    </div>
  );
};

export default AdminMenu;