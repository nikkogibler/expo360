import { requireUserContext } from '@/lib/expo360/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserContext(['interzekt_admin']);

  return <>{children}</>;
}
