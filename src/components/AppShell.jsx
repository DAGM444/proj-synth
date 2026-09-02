import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AudioPlayer from '@/components/Player';

export default function AppShell({ currentTrack }) {
  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 pb-28">
          <Outlet />
        </main>
      </div>

      {/* Persistent Bottom Audio Player */}
      <AudioPlayer currentTrack={currentTrack} />
    </div>
  );
}