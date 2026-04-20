import React from 'react';
import "./global.css";

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 bg-white">
      <header className="bg-arsiBlue text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center">
          <img src="/logo.png" alt="Arsi University" className="h-8 w-auto mr-3" />
          <span className="font-bold text-lg">ARU - IOCS</span>
        </div>
      </header>
      <main className="px-4 py-6">{children}</main>
    </div>
  );
}