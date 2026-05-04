import { requireUserContext } from '@/lib/expo360/auth';
import { listClientsWithSummary } from '@/lib/expo360/repositories';

import AdminConsole from './AdminConsole';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await requireUserContext(['interzekt_admin']);
  const clients = await listClientsWithSummary();

  return <AdminConsole adminEmail={user.email} initialClients={clients} />;
}
