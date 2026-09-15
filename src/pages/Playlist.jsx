import React from 'react';
import { usePlaylist } from '@/context/PlaylistContext';
import PlaylistSidebar from '@/components/PlaylistSidebar';
import PlaylistView from '@/components/PlaylistView';

export default function PlaylistPage({ onPlayTrack }) {
  const { loading, selectedPlaylist, setSelectedPlaylistId } = usePlaylist();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#b3b3b3]">
          <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading your library...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left panel for library navigation */}
          <div className="lg:col-span-1 bg-[#181818] border border-[#282828] rounded-2xl p-3 h-[calc(100vh-210px)] min-h-[450px] flex flex-col">
            <PlaylistSidebar
              onSelectPlaylist={(pl) => setSelectedPlaylistId(pl.id)}
            />
          </div>

          {/* Right main view: Selected playlist details & tracks */}
          <div className="lg:col-span-3 bg-[#181818] border border-[#282828] rounded-2xl p-6 overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin">
            <PlaylistView
              playlist={selectedPlaylist}
              onPlayTrack={onPlayTrack}
            />
          </div>
        </div>
      )}
    </div>
  );
}