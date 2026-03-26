import { useState, useEffect } from 'react';
import ViewerLayout from '../ViewerLayout';
import { X } from 'lucide-react';

export default function Inbox({ agendas = [] }) {
  const [messages, setMessages] = useState(agendas);
  const [selected, setSelected] = useState(null);
  const [readMessages, setReadMessages] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewer_read_messages') || '[]');
    setReadMessages(stored);
  }, []);

  function isRead(id) {
    return readMessages.includes(id);
  }

  function markRead(id) {
    if (!isRead(id)) {
      const updated = [...readMessages, id];
      setReadMessages(updated);
      localStorage.setItem('viewer_read_messages', JSON.stringify(updated));
    }
  }

  function openMessage(msg) {
    setSelected(msg);
    markRead(msg.id);
  }

  function closeModal() {
    setSelected(null);
  }

  return (
    <ViewerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600 mt-1">View office communications sent to you</p>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No messages in your inbox</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Office</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{msg.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{msg.createdBy?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {msg.senderOffice?.name || msg.receiverOffice?.name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            isRead(msg.id)
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isRead(msg.id) ? 'READ' : 'UNREAD'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openMessage(msg)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          View
                        </button>
                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-600 hover:text-gray-800 hover:underline"
                          >
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">From</p>
                  <p className="text-gray-900 font-medium">{selected.createdBy?.name || 'Unknown'}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Office</p>
                  <p className="text-gray-900 font-medium">
                    {selected.senderOffice?.name || selected.receiverOffice?.name || '—'}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selected.description || 'No description provided'}
                  </p>
                </div>

                {selected.attachmentUrl && (
                  <div className="pt-2">
                    <a
                      href={selected.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Download Attachment
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ViewerLayout>
  );
}
