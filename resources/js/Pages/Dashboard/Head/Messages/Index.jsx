import React, { useMemo, useState } from 'react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import HeadLayout from '../HeadLayout';

function deliveryLabel(type) {
  switch (type) {
    case 'office_broadcast':
      return 'Everyone in office';
    case 'direct_user':
      return 'Direct to user';
    case 'all_admins':
      return 'All administrators';
    default:
      return type;
  }
}

function senderLine(user) {
  if (!user) return '—';
  const role = user.role ? String(user.role).toLowerCase() : '';
  return `${user.name}${role ? ` · ${role}` : ''}`;
}

export default function Index({ officeUsers, inboxRoots, inboxDirectReplies, sent }) {
  const page = usePage();
  const flash = page.props.flash || {};
  const authUser = page.props.auth?.user;
  const [tab, setTab] = useState('compose');
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyBody, setReplyBody] = useState('');

  const form = useForm({
    subject: '',
    body: '',
    delivery_type: 'office_broadcast',
    recipient_user_id: '',
  });

  const canReplyToRoot = (root) => {
    if (!authUser) return false;
    if (root.delivery_type === 'all_admins') {
      return authUser.role === 'ADMIN' && root.sender_id !== authUser.id;
    }
    if (root.delivery_type === 'direct_user') {
      return root.sender_id === authUser.id || root.recipient_user_id === authUser.id;
    }
    if (root.delivery_type === 'office_broadcast' && authUser.office_id) {
      return String(root.recipient_office_id) === String(authUser.office_id);
    }
    if (root.delivery_type === 'office_heads_only' && authUser.role === 'HEAD' && authUser.office_id) {
      return String(root.recipient_office_id) === String(authUser.office_id);
    }
    return false;
  };

  const submitReply = (rootId) => {
    if (!replyBody.trim()) return;
    router.post(`/dashboard/messages/${rootId}/reply`, { body: replyBody.trim() }, {
      preserveScroll: true,
      onSuccess: () => {
        setReplyBody('');
        setReplyOpenId(null);
      },
    });
  };

  const userOptions = useMemo(() => {
    return (officeUsers || []).map((u) => (
      <option key={u.id} value={u.id}>
        {u.name} ({u.email})
      </option>
    ));
  }, [officeUsers]);

  return (
    <HeadLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My communications</h1>
            <p className="text-sm text-gray-600">
              Message your whole office, a colleague by name, or all administrators. For formal office-to-office
              documents, use{' '}
              <Link href="/dashboard/head/agendas" className="font-medium text-blue-600 hover:text-blue-800">
                Agendas
              </Link>
              .
            </p>
          </div>
        </div>

        {(flash.success || flash.error) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              flash.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {flash.error || flash.success}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {['compose', 'inbox', 'sent'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'compose' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">New message</h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.post('/dashboard/head/messages', { preserveScroll: true });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Send to</label>
                <select
                  value={form.data.delivery_type}
                  onChange={(e) => {
                    const v = e.target.value;
                    form.setData({
                      ...form.data,
                      delivery_type: v,
                      recipient_user_id: '',
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="office_broadcast">Everyone in my office</option>
                  <option value="direct_user">Specific user in my office</option>
                  <option value="all_admins">All administrators</option>
                </select>
              </div>

              {form.data.delivery_type === 'direct_user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient</label>
                  <select
                    value={form.data.recipient_user_id}
                    onChange={(e) => form.setData('recipient_user_id', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select user…</option>
                    {userOptions}
                  </select>
                  {form.errors.recipient_user_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.recipient_user_id}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject (optional)</label>
                <input
                  value={form.data.subject}
                  onChange={(e) => form.setData('subject', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Short title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={form.data.body}
                  onChange={(e) => form.setData('body', e.target.value)}
                  rows={6}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Write your message or request…"
                />
                {form.errors.body && <p className="mt-1 text-sm text-red-600">{form.errors.body}</p>}
              </div>

              <button
                type="submit"
                disabled={form.processing}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {form.processing ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
              <p className="text-sm text-gray-500">Threads and broadcasts addressed to you or your office.</p>
            </div>

            {(inboxDirectReplies || []).length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <h3 className="text-sm font-semibold text-amber-900">Direct replies</h3>
                <ul className="mt-2 space-y-3">
                  {inboxDirectReplies.map((m) => (
                    <li key={m.id} className="rounded-lg border border-amber-100 bg-white p-3 text-sm">
                      <p className="text-xs text-gray-500">
                        From {senderLine(m.sender)} · {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                      </p>
                      {m.category && (
                        <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                          {m.category}
                        </span>
                      )}
                      {m.parent?.sender && (
                        <p className="mt-1 text-xs text-gray-400">
                          Re: message from {m.parent.sender.name}
                        </p>
                      )}
                      <p className="mt-2 whitespace-pre-wrap text-gray-800">{m.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {(inboxRoots || []).length === 0 && (inboxDirectReplies || []).length === 0 && (
                <p className="text-sm text-gray-500">No messages yet.</p>
              )}
              {(inboxRoots || []).map((root) => (
                <article key={root.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">{deliveryLabel(root.delivery_type)}</p>
                      <p className="font-semibold text-gray-900">{root.subject || '(No subject)'}</p>
                      <p className="text-xs text-gray-500">
                        From {senderLine(root.sender)} · {root.created_at ? new Date(root.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{root.body}</p>
                  {(root.replies || []).length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                      {root.replies.map((r) => (
                        <li key={r.id} className="rounded-lg bg-gray-50 p-2 text-sm">
                          <span className="font-medium text-gray-800">{senderLine(r.sender)}</span>
                          {r.category && (
                            <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-900">
                              {r.category}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {' '}
                            · {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                          </span>
                          <p className="mt-1 whitespace-pre-wrap text-gray-700">{r.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {canReplyToRoot(root) && (
                    <div className="mt-4 border-t border-gray-100 pt-3">
                      {replyOpenId === root.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Your reply…"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => submitReply(root.id)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                            >
                              Send reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyOpenId(null);
                                setReplyBody('');
                              }}
                              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyOpenId(root.id);
                            setReplyBody('');
                          }}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === 'sent' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Sent</h2>
            {(sent || []).length === 0 && <p className="text-sm text-gray-500">Nothing sent yet.</p>}
            {(sent || []).map((m) => (
              <div key={m.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm">
                <p className="text-xs text-gray-500">{deliveryLabel(m.delivery_type)}</p>
                <p className="font-medium text-gray-900">{m.subject || '(No subject)'}</p>
                <p className="mt-1 line-clamp-3 text-gray-700">{m.body}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </HeadLayout>
  );
}
