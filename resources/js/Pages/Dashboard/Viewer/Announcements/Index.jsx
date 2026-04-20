import React from 'react';
import ViewerLayout from '../ViewerLayout';
import AnnouncementList from '../../../component/Announcements/AnnouncementList';

export default function Announcements({ announcements = [] }) {
  return (
    <ViewerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Important announcements and updates</p>
        </div>

        <AnnouncementList announcements={announcements} />
      </div>
    </ViewerLayout>
  );
}
