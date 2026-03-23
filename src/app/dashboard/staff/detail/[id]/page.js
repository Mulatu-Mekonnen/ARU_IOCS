import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import StaffDetailClient from './StaffDetailClient';

export default async function Page({ params }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'STAFF') {
    redirect('/login');
  }

  const { id } = await params;
  return <StaffDetailClient agendaId={id} />;
}
