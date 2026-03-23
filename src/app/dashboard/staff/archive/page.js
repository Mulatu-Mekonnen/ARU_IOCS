import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffArchiveClient from './StaffArchiveClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'STAFF') {
    redirect('/login');
  }
  return <StaffArchiveClient />;
}
