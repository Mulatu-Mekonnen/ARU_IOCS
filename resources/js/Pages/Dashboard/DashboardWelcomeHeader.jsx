import React from 'react';
import { usePage } from '@inertiajs/react';

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  HEAD: 'Head of office',
  STAFF: 'Staff',
  VIEWER: 'Viewer',
};

export function dashboardRoleLabel(role) {
  if (!role) {
    return '';
  }
  return ROLE_LABELS[role] || String(role).replace(/_/g, ' ');
}

export function dashboardOfficeLabel(user) {
  if (!user) {
    return '';
  }
  const raw = user.office?.name;
  if (raw && String(raw).trim()) {
    return String(raw).trim();
  }
  if (user.role === 'ADMIN') {
    return 'All offices';
  }
  return 'No office assigned';
}

export default function DashboardWelcomeHeader() {
  const user = usePage().props.auth?.user;
  const role = dashboardRoleLabel(user?.role);
  const office = dashboardOfficeLabel(user);

  return (
    <div className="min-w-0 flex-1">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
        Welcome{user?.name ? `, ${user.name}` : ''}{' '}
        <span className="hidden sm:inline" aria-hidden="true">
          👋
        </span>
      </h1>
      <p className="mt-0.5 text-sm text-gray-600 truncate">
        <span className="font-medium text-gray-800">{role || 'Signed in'}</span>
        {office ? (
          <>
            <span className="text-gray-400"> · </span>
            <span>{office}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
