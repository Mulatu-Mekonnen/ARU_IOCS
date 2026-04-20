import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AnnouncementList({ announcements = [] }) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
        No announcements available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {announcements.map((announcement) => {
        const isImportant =
          announcement.title?.toLowerCase().includes('important') ||
          announcement.content?.toLowerCase().includes('important');

        const createdByName =
          announcement.author?.name ||
          announcement.createdBy?.name ||
          (announcement.created_by ? announcement.created_by.name : null);

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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(announcement.created_at || announcement.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {isImportant && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
            </div>

            <p className="mt-4 text-gray-700 text-sm leading-relaxed">{announcement.content}</p>

            {createdByName && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Posted by <span className="font-medium">{createdByName}</span>
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
