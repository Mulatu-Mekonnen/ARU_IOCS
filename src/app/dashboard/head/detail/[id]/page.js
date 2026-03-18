import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import HeadDetailClient from './HeadDetailClient';

export default async function Page({ params }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'HEAD') {
    redirect('/login');
  }

  // Next.js dynamic route params are async, so we await them first
  const { id } = await params;

  return <HeadDetailClient user={user} agendaId={id} />;
}