import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadDashboardClient from './HeadDashboardClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }
  return <HeadDashboardClient user={user} />;
}