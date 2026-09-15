import React, { useState } from 'react';
import { usePlaylist } from '@/context/PlaylistContext';
import { Plus, ListMusic, Trash2, Music } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PlaylistSidebar({ onSelectPlaylist, compact = false }) {
  const {
    playlists,
    selectedPlaylistId,
    setSelectedPlaylistId,
    createPlaylist,
    deletePlaylist,
    isCreateModalOpen,
    setIsCreateModalOpen,
  } = usePlaylist();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = (pl) => {
    setSelectedPlaylistId(pl.id);
    if (onSelectPlaylist) {
      onSelectPlaylist(pl);
    }
    if (location.pathname !== '/playlist' && location.pathname !== '/library') {
      navigate('/playlist');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createPlaylist(title, description);
      if (created) {
        setTitle('');
        setDescription('');
        setIsCreateModalOpen(false);
        if (location.pathname !== '/playlist' && location.pathname !== '/library') {
          navigate('/playlist');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, playlistId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(playlistId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#b3b3b3] flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#1DB954]" />
          Playlists ({playlists.length})
        </span>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="p-1.5 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors"
          title="Create Playlist"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Playlist List */}
      <div className="flex-1 overflow-y-auto space-y-0.5 px-2 py-1 scrollbar-thin">
        {playlists.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-[#b3b3b3] bg-[#181818]/60 rounded-lg mx-1 my-2 border border-[#282828]/50">
            <Music className="w-6 h-6 mx-auto mb-2 text-[#535353]" />
            <p className="font-medium text-white mb-1">No playlists yet</p>
            <p className="mb-3 text-[11px]">Create your first playlist</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full hover:scale-105 transition"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => handleSelect(pl)}
                className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#282828] text-white font-medium'
                    : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#1DB954] text-black' : 'bg-[#282828] text-[#b3b3b3]'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs truncate ${isSelected ? 'text-[#1DB954]' : ''}`}>
                      {pl.title}
                    </p>
                    <p className="text-[10px] text-[#727272] truncate">
                      {pl.tracks?.length || 0} {pl.tracks?.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </div>

                {/* Delete playlist button on hover */}
                <button
                  onClick={(e) => handleDelete(e, pl.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#727272] hover:text-red-400 hover:bg-[#333] rounded transition-all shrink-0"
                  title="Delete playlist"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create Playlist Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-[#242424] p-6 rounded-2xl w-full max-w-md border border-[#383838] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333]">
              <h3 className="text-lg font-bold text-white font-heading">New Playlist</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#b3b3b3] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Title <span className="text-[#1DB954]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chill Synth Vibes"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] text-white text-sm border border-[#383838] focus:outline-none focus:border-[#1DB954] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b3b3b3] mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Give your playlist a memorable description"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#181818] text-white text-sm border border-[#383838] focus:outline-none focus:border-[#1DB954] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#b3b3b3] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-[#1DB954] text-black rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all font-heading"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
