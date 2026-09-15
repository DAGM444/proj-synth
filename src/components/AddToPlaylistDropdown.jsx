import React, { useState, useRef, useEffect } from 'react';
import { usePlaylist } from '@/context/PlaylistContext';
import { Plus, Check, ListPlus, FolderPlus } from 'lucide-react';

export default function AddToPlaylistDropdown({ track }) {
  const { playlists, addTrackToPlaylist, setIsCreateModalOpen } = usePlaylist();
  const [isOpen, setIsOpen] = useState(false);
  const [addedMap, setAddedMap] = useState({});
  const [justAdded, setJustAdded] = useState(null);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAddToPlaylist = async (e, playlist) => {
    e.stopPropagation();
    try {
      await addTrackToPlaylist(playlist.id, track);
      setAddedMap((prev) => ({ ...prev, [playlist.id]: true }));
      setJustAdded(playlist.title);
      setTimeout(() => {
        setJustAdded(null);
        setIsOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to add track to playlist:', err);
    }
  };

  const handleOpenCreateModal = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`p-1.5 rounded-full transition-all ${
          isOpen
            ? 'bg-[#1DB954] text-black scale-110'
            : 'text-[#b3b3b3] hover:text-white hover:bg-[#282828]'
        }`}
        title="Add to playlist"
        aria-label="Add to playlist"
      >
        <ListPlus className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-8 z-50 w-56 bg-[#242424] border border-[#383838] rounded-xl shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {justAdded ? (
            <div className="px-3 py-3 text-center text-[#1DB954] font-medium flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Added to {justAdded}!
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#727272] border-b border-[#333]">
                Add to playlist
              </div>

              {/* Create new playlist shortcut */}
              <button
                onClick={handleOpenCreateModal}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-white hover:bg-[#2e2e2e] transition-colors border-b border-[#333]"
              >
                <FolderPlus className="w-4 h-4 text-[#1DB954]" />
                <span className="font-semibold text-[#1DB954]">New Playlist</span>
              </button>

              {/* Playlists list */}
              <div className="max-h-48 overflow-y-auto scrollbar-thin py-1">
                {playlists.length === 0 ? (
                  <div className="px-3 py-3 text-center text-[#727272]">
                    No playlists yet
                  </div>
                ) : (
                  playlists.map((pl) => {
                    const isAdded =
                      addedMap[pl.id] ||
                      pl.tracks?.some(
                        (t) => (t.videoId || t.id) === (track.videoId || track.id)
                      );

                    return (
                      <button
                        key={pl.id}
                        onClick={(e) => handleAddToPlaylist(e, pl)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-[#b3b3b3] hover:text-white hover:bg-[#2e2e2e] transition-colors"
                      >
                        <span className="truncate pr-2">{pl.title}</span>
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 text-[#1DB954] shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
