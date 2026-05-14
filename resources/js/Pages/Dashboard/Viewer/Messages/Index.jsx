import React, { useMemo, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import ViewerLayout from '../ViewerLayout';

function deliveryLabel(type) {
  switch (type) {
    case 'office_broadcast':
      return 'Office message';
    case 'direct_user':
      return 'Direct message';
    case 'all_admins':
      return 'To administrators';
    default:
      return type;
  }
}

function senderLine(user) {
  if (!user) return '—';
  const role = user.role ? String(user.role).toLowerCase() : '';
  return `${user.name}${role ? ` · ${role}` : ''}`;
}

export default function Index({ inboxRoots, inboxDirectReplies, sent, eligibleRecipients, categories }) {
  const page = usePage();
  const flash = page.props.flash || {};
  const authUser = page.props.auth?.user;
  const [tab, setTab] = useState('inbox');
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyCategory, setReplyCategory] = useState('FEEDBACK');

  const form = useForm({
    recipient_user_id: '',
    body: '',
    category: 'FEEDBACK',
    parent_id: null,
  });

  const groupedRecipients = useMemo(() => {
    const list = eligibleRecipients || [];
    return {
      admins: list.filter((u) => u.role === 'ADMIN'),
      office: list.filter((u) => u.role !== 'ADMIN'),
    };
  }, [eligibleRecipients]);

  const canReplyToRoot = (root) => {
    if (!authUser) return false;
    if (root.delivery_type === 'office_broadcast' && authUser.office_id) {
      return String(root.recipient_office_id) === String(authUser.office_id);
    }
    if (root.delivery_type === 'direct_user') {
      return root.sender_id === authUser.id || root.recipient_user_id === authUser.id;
    }
    return false;
  };

  const submitReply = (rootId) => {
    if (!replyBody.trim()) return;
    router.post(
      `/dashboard/messages/${rootId}/reply`,
      { body: replyBody.trim(), category: replyCategory },
      {
        preserveScroll: true,
        onSuccess: () => {
          setReplyBody('');
          setReplyCategory('FEEDBACK');
          setReplyOpenId(null);
        },
      }
    );
  };

  return (
    <ViewerLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My communications</h1>
          <p className="text-sm text-gray-600">
            Send typed notes (feedback, requests, comments, and similar) to your office head or staff, or to an
            administrator. Official office-to-office records stay under <span className="font-medium">Inbox</span>{' '}
            for agendas — viewers do not create those here.
          </p>
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
          {['inbox', 'compose', 'sent'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                tab === t ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                form.post('/dashboard/viewer/messages', {
                  preserveScroll: true,
                  onSuccess: () => form.reset(),
                });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.data.category}
                  onChange={(e) => form.setData('category', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {(categories || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {form.errors.category && <p className="mt-1 text-sm text-red-600">{form.errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">To</label>
                <select
                  value={form.data.recipient_user_id}
                  onChange={(e) => form.setData('recipient_user_id', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select recipient…</option>
                  {groupedRecipients.admins.length > 0 && (
                    <optgroup label="Administrators">
                      {groupedRecipients.admins.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {groupedRecipients.office.length > 0 && (
                    <optgroup label="My office">
                      {groupedRecipients.office.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role} ({u.email})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {form.errors.recipient_user_id && (
                  <p className="mt-1 text-sm text-red-600">{form.errors.recipient_user_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Related thread (optional)</label>
                <select
                  value={form.data.parent_id ?? ''}
                  onChange={(e) => form.setData('parent_id', e.target.value || null)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">None — new conversation</option>
                  {(inboxRoots || []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.subject || deliveryLabel(r.delivery_type)} — {r.sender?.name}
                    </option>
                  ))}
                </select>
                {form.errors.parent_id && <p className="mt-1 text-sm text-red-600">{form.errors.parent_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={form.data.body}
                  onChange={(e) => form.setData('body', e.target.value)}
                  rows={6}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Write your message…"
                />
                {form.errors.body && <p className="mt-1 text-sm text-red-600">{form.errors.body}</p>}
              </div>

              <button
                type="submit"
                disabled={form.processing}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {form.processing ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="space-y-6">
            {(inboxDirectReplies || []).length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <h2 className="text-sm font-semibold text-amber-900">Direct messages for you</h2>
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
                        <p className="mt-1 text-xs text-gray-400">Re: thread from {m.parent.sender.name}</p>
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
                  <p className="text-xs font-medium uppercase text-gray-500">{deliveryLabel(root.delivery_type)}</p>
                  <p className="font-semibold text-gray-900">{root.subject || '(No subject)'}</p>
                  <p className="text-xs text-gray-500">
                    From {senderLine(root.sender)} · {root.created_at ? new Date(root.created_at).toLocaleString() : ''}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{root.body}</p>
                  {(root.replies || []).length > 0 && (
                    <ul className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      {root.replies.map((r) => (
                        <li key={r.id} className="rounded-lg bg-gray-50 p-2 text-sm">
                          <span className="font-medium text-gray-800">{senderLine(r.sender)}</span>
                          {r.category && (
                            <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-900">
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
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      {replyOpenId === root.id ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600">Type</label>
                            <select
                              value={replyCategory}
                              onChange={(e) => setReplyCategory(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                              {(categories || []).map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Reply…"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => submitReply(root.id)}
                              className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm text-white hover:bg-orange-700"
                            >
                              Send
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyOpenId(null);
                                setReplyBody('');
                                setReplyCategory('FEEDBACK');
                              }}
                              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm"
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
                            setReplyCategory('FEEDBACK');
                          }}
                          className="text-sm font-medium text-orange-600 hover:text-orange-800"
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
            {(sent || []).length === 0 && <p className="text-sm text-gray-500">You have not sent any messages yet.</p>}
            {(sent || []).map((m) => (
              <article key={m.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {m.category && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {m.category}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  To {m.recipient_user?.name || '—'}
                  {m.recipient_user?.role ? ` · ${String(m.recipient_user.role).toLowerCase()}` : ''}
                </p>
                {m.parent?.sender && (
                  <p className="mt-1 text-xs text-gray-400">In thread with {m.parent.sender.name}</p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-gray-800">{m.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </ViewerLayout>
  );
}
