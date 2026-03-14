import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Page({ params }) {
  const user = await getSessionUser();
  if (!user) {
    return <div className="p-6">Unauthorized</div>;
  }

  const agenda = await prisma.agenda.findUnique({
    where: { id: params.id },
    include: {
      createdBy: true,
      senderOffice: true,
      receiverOffice: true,
      currentOffice: true,
      approvalHistories: { include: { actionBy: true } },
      routes: { include: { fromOffice: true, toOffice: true, routedBy: true } },
    },
  });

  if (!agenda) {
    return <div className="p-6">Agenda not found.</div>;
  }

  // access rules mirror API
  if (user.role === 'HEAD') {
    if (agenda.senderOfficeId !== user.officeId && agenda.receiverOfficeId !== user.officeId) {
      return <div className="p-6">Forbidden</div>;
    }
  }
  if (user.role === 'STAFF') {
    if (agenda.createdById !== user.id) {
      return <div className="p-6">Forbidden</div>;
    }
  }
  if (user.role === 'VIEWER') {
    if (agenda.status !== 'APPROVED') {
      return <div className="p-6">Forbidden</div>;
    }
  }

  const attachmentUrl = agenda.attachmentUrl || agenda.attachment;
  const isPdf = attachmentUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Agenda details</h1>
          <p className="text-sm text-gray-600">ID: {agenda.id}</p>
        </div>
        <Link href={user.role === 'STAFF' ? '/dashboard/staff' : user.role === 'HEAD' ? '/dashboard/head' : '/dashboard/viewer'} className="text-arsiBlue underline">
          Back
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Basic info</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <dt className="text-sm text-gray-500">Title</dt>
              <dd className="mt-1 text-gray-900">{agenda.title}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="mt-1 text-gray-900">{agenda.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created by</dt>
              <dd className="mt-1 text-gray-900">{agenda.createdBy?.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created at</dt>
              <dd className="mt-1 text-gray-900">{new Date(agenda.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Sender office</dt>
              <dd className="mt-1 text-gray-900">{agenda.senderOffice?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Receiver office</dt>
              <dd className="mt-1 text-gray-900">{agenda.receiverOffice?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Current office</dt>
              <dd className="mt-1 text-gray-900">{agenda.currentOffice?.name || '-'}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-2 text-gray-700">{agenda.description || 'No description provided.'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Attachment</h2>
          {attachmentUrl ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={attachmentUrl}
                className="text-arsiBlue underline"
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
              {isPdf && (
                <iframe
                  src={attachmentUrl}
                  className="w-full h-[60vh] border mt-4"
                  title="Attachment preview"
                />
              )}
            </div>
          ) : (
            <p className="text-gray-600">No attachment uploaded.</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Timeline</h2>
          <ul className="mt-3 space-y-2">
            {agenda.approvalHistories
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((item) => (
                <li key={item.id} className="border rounded p-3">
                  <div className="text-sm text-gray-600">{new Date(item.createdAt).toLocaleString()}</div>
                  <div className="font-semibold">{item.action}</div>
                  <div className="text-sm text-gray-700">By: {item.actionBy?.name || 'Unknown'}</div>
                  {item.comment && <div className="text-sm text-gray-600">{item.comment}</div>}
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Routing history</h2>
          <ul className="mt-3 space-y-2">
            {agenda.routes.length ? (
              agenda.routes.map((route) => (
                <li key={route.id} className="border rounded p-3">
                  <div className="text-sm text-gray-600">{new Date(route.routedAt).toLocaleString()}</div>
                  <div className="font-semibold">
                    {route.fromOffice?.name || 'Unknown'} → {route.toOffice?.name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-700">By: {route.routedBy?.name || 'Unknown'}</div>
                </li>
              ))
            ) : (
              <div className="text-gray-600">No routing data available.</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
