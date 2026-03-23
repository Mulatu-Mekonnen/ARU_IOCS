import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffInboxClient from './StaffInboxClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'STAFF') {
    redirect('/login');
  }
  return <StaffInboxClient />;
}
