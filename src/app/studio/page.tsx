import { redirect } from 'next/navigation';

import { requireUserContext } from '@/lib/expo360/auth';
import { getClientBundle } from '@/lib/expo360/repositories';

import StudioWorkspace from './StudioWorkspace';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  const user = await requireUserContext(['smb_admin']);

  if (!user.clientId) {
    redirect('/signin');
  }

  const bundle = await getClientBundle(user.clientId);

  if (!bundle) {
    return (
      <main className="min-h-screen bg-[#f4f1ea] p-8 text-[#111827]">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#d8d1c2] bg-white p-6">
          <h1 className="text-2xl font-semibold">Workspace not found</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            This SMB admin account is not connected to an event landing page yet.
          </p>
        </div>
      </main>
    );
  }

  return <StudioWorkspace initialBundle={bundle} userEmail={user.email} />;
}
