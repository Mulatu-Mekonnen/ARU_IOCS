import ViewerLayout from '../ViewerLayout';
import { AlertCircle } from 'lucide-react';

export default function Announcements({ announcements = [] }) {
  return (
    <ViewerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Important announcements and updates</p>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No announcements available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((announcement) => {
              const isImportant =
                announcement.title.toLowerCase().includes('important') ||
                announcement.content?.toLowerCase().includes('important');

              return (
                <div
                  key={announcement.id}
                  className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                    isImportant
                      ? 'border-l-4 border-red-500 bg-red-50'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {isImportant && (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-700 text-sm leading-relaxed">
                    {announcement.content}
                  </p>

                  {announcement.createdBy && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Posted by <span className="font-medium">{announcement.createdBy.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ViewerLayout>
  );
}
