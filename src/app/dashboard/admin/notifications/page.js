import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminNotificationsClient from './AdminNotificationsClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }
  return <AdminNotificationsClient user={user} />;
}