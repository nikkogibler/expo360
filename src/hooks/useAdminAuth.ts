import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminList } from '../config/adminList';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      // Get email from cookie with better parsing
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift();
        }
        return null;
      };

      const email = getCookie('user_email');
      
      if (!email) {
        setIsAuthenticated(false);
        router.push('/admin/signin');
        return;
      }

      // Decode the email in case it was encoded
      const decodedEmail = decodeURIComponent(email);
      
      if (!adminList.includes(decodedEmail)) {
        setIsAuthenticated(false);
        router.push('/admin/signin');
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  return isAuthenticated;
};