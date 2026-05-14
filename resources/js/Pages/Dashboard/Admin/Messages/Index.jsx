import React, { useMemo, useState } from 'react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';

function deliveryLabel(type) {
  switch (type) {
    case 'office_broadcast':
      return 'Everyone in office';
    case 'direct_user':
      return 'Direct to user';
    case 'all_admins':
      return 'All administrators';
    case 'office_heads_only':
      return 'Heads of office only';
    default:
      return type;
  }
}

function senderLine(user) {
  if (!user) return '—';
  const role = user.role ? String(user.role).toLowerCase() : '';
  return `${user.name}${role ? ` · ${role}` : ''}`;
}

export default function Index({ inboxRoots, inboxDirectReplies, fromHeads, heads, offices, usersForPicker, sent }) {
  const page = usePage();
  const flash = page.props.flash || {};
  const authUser = page.props.auth?.user;
  const [tab, setTab] = useState('inbox');
  const [userQuery, setUserQuery] = useState('');
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyBody, setReplyBody] = useState('');

  const form = useForm({
    subject: '',
    body: '',
    delivery_type: 'direct_user',
    recipient_user_id: '',
    recipient_office_id: '',
  });

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    const list = usersForPicker || [];
    if (!q) return list.slice(0, 80);
    return list
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.office?.name && u.office.name.toLowerCase().includes(q))
      )
      .slice(0, 80);
  }, [usersForPicker, userQuery]);

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

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-sm text-gray-600">
            Read messages from heads of offices, reply, and send to a specific user, an entire office, or only the
            heads of an office. Formal agendas remain under{' '}
            <Link href="/dashboard/admin/agendas" className="font-medium text-blue-600 hover:text-blue-800">
              Agendas
            </Link>
            .
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
          {['inbox', 'from_heads', 'compose', 'sent'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t === 'from_heads' ? 'From heads' : t}
            </button>
          ))}
        </div>

        {tab === 'from_heads' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">From heads of offices</h2>
            {(fromHeads || []).length === 0 && (
              <p className="text-sm text-gray-500">No messages from heads in your main inbox yet.</p>
            )}
            {(fromHeads || []).map((root) => (
              <article key={root.id} className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                <p className="text-xs font-medium uppercase text-indigo-700">{deliveryLabel(root.delivery_type)}</p>
                <p className="font-semibold text-gray-900">{root.subject || '(No subject)'}</p>
                <p className="text-xs text-gray-600">
                  From {senderLine(root.sender)} ({root.sender?.office?.name || '—'}) ·{' '}
                  {root.created_at ? new Date(root.created_at).toLocaleString() : ''}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{root.body}</p>
                {root.delivery_type === 'all_admins' && root.sender_id !== authUser?.id && (
                  <div className="mt-3">
                    {replyOpenId === root.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          placeholder="Reply to this head…"
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
                        }}
                        className="text-sm font-medium text-blue-700 hover:text-blue-900"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {tab === 'inbox' && (
          <div className="space-y-6">
            {(inboxDirectReplies || []).length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <h3 className="text-sm font-semibold text-amber-900">Direct replies to you</h3>
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
                      <p className="mt-2 whitespace-pre-wrap text-gray-800">{m.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {(inboxRoots || []).length === 0 && (inboxDirectReplies || []).length === 0 && (
                <p className="text-sm text-gray-500">Inbox is empty.</p>
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
                          <span className="font-medium">{senderLine(r.sender)}</span>
                          {r.category && (
                            <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-900">
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
                          <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

        {tab === 'compose' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">New communication</h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.post('/dashboard/admin/messages', { preserveScroll: true });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Send as</label>
                <select
                  value={form.data.delivery_type}
                  onChange={(e) => {
                    const v = e.target.value;
                    form.setData({
                      ...form.data,
                      delivery_type: v,
                      recipient_user_id: '',
                      recipient_office_id: '',
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="direct_user">Specific user (search by name / email)</option>
                  <option value="office_broadcast">Everyone in an office</option>
                  <option value="office_heads_only">Only heads of an office</option>
                </select>
              </div>

              {form.data.delivery_type === 'direct_user' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Search users</label>
                    <input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Type name, email, or office…"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient</label>
                    <select
                      value={form.data.recipient_user_id}
                      onChange={(e) => form.setData('recipient_user_id', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select user…</option>
                      {filteredUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.email} ({u.role}
                          {u.office?.name ? ` · ${u.office.name}` : ''})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Quick pick heads:{' '}
                      {(heads || []).map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          className="mr-2 text-blue-600 hover:underline"
                          onClick={() => {
                            form.setData('recipient_user_id', h.id);
                            setUserQuery(h.name);
                          }}
                        >
                          {h.name}
                        </button>
                      ))}
                    </p>
                    {form.errors.recipient_user_id && (
                      <p className="mt-1 text-sm text-red-600">{form.errors.recipient_user_id}</p>
                    )}
                  </div>
                </>
              )}

              {(form.data.delivery_type === 'office_broadcast' || form.data.delivery_type === 'office_heads_only') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Office</label>
                  <select
                    value={form.data.recipient_office_id}
                    onChange={(e) => form.setData('recipient_office_id', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select office…</option>
                    {(offices || []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  {form.errors.recipient_office_id && (
                    <p className="mt-1 text-sm text-red-600">{form.errors.recipient_office_id}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject (optional)</label>
                <input
                  value={form.data.subject}
                  onChange={(e) => form.setData('subject', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
    </AdminLayout>
  );
}
