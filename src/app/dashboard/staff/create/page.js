import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffCreateClient from './StaffCreateClient';

export default async function Page() {
  const user = await getSessionUser();
  if (!user || user.role !== 'STAFF') {
    redirect('/login');
  }
  return <StaffCreateClient />;
}
