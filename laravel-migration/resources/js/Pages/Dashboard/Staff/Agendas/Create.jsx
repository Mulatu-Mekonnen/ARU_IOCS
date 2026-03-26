import { useForm } from '@inertiajs/react';
import StaffLayout from '../StaffLayout';

export default function Create({ offices }) {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    description: "",
    receiver_office_id: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/dashboard/staff/agendas');
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Communication</h1>
          <p className="text-gray-600 mt-1">Send a new agenda to another office</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Enter communication title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Enter detailed description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Office</label>
              <select
                value={data.receiver_office_id}
                onChange={(e) => setData('receiver_office_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Choose office</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              {errors.receiver_office_id && <p className="text-red-500 text-xs mt-1">{errors.receiver_office_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="mt-2 text-sm text-gray-600">File upload feature coming soon</p>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium disabled:opacity-50"
              >
                Send Communication
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}