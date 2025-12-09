import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminList } from '../../../config/adminList';
import SucursalesGallery from '../../../components/SucursalesGallery';

function getCurrentUserEmail() {
  // Example: get user email from cookie (replace with your auth logic)
  const getEmailFromCookies = async () => {
    const cookieStore = await cookies();
    const email = cookieStore.get('user_email');
    return email?.value ? decodeURIComponent(email.value) : null;
  };
  // This function is now async, so callers must await it
  return getEmailFromCookies();
}

export default async function SucursalesPage() {
  const email = await getCurrentUserEmail();
  if (!email || !adminList.includes(email)) {
    redirect('/admin/signin');
    return null;
  }
  
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      <SucursalesGallery />
    </div>
  );
}