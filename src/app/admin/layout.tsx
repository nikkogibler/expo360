import { cookies } from 'next/headers';
import FloatingChatbot from '@/components/FloatingChatbot';

async function getUserEmail() {
  const cookieStore = await cookies();
  const email = cookieStore.get('user_email');
  return email?.value || 'anonymous';
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userEmail = await getUserEmail();

  return (
    <>
      {children}
      <FloatingChatbot userEmail={userEmail} />
    </>
  );
}
