import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffNotificationsClient from './StaffNotificationsClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'STAFF') {
    redirect('/login');
  }
  return <StaffNotificationsClient />;
}
