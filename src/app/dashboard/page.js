import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  // Redirect based on role
  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin');
  } else if (user.role === 'HEAD') {
    redirect('/dashboard/head');
  } else if (user.role === 'STAFF') {
    redirect('/dashboard/staff');
  } else if (user.role === 'VIEWER') {
    redirect('/dashboard/viewer');
  } else {
    redirect('/login'); // Unknown role
  }
}