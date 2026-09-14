import React, { useState, useEffect } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, removeTrackFromPlaylist } from '@/services/api';

export default function Playlist({ onPlayTrack }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch all playlists on load
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    const data = await getPlaylists();
    setPlaylists(data);
    if (data.length > 0 && !selectedPlaylist) {
      setSelectedPlaylist(data[0]);
    } else if (selectedPlaylist) {
      const updated = data.find((p) => p.id === selectedPlaylist.id);
      setSelectedPlaylist(updated || data[0] || null);
    }
    setLoading(false);
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlaylist = await createPlaylist(title, description);
    if (newPlaylist) {
      setTitle('');
      setDescription('');
      setShowModal(false);
      await fetchPlaylists();
      setSelectedPlaylist(newPlaylist);
    }
  };

  const handleDeletePlaylist = async (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      const success = await deletePlaylist(id);
      if (success) {
        if (selectedPlaylist?.id === id) {
          setSelectedPlaylist(null);
        }
        await fetchPlaylists();
      }
    }
  };

  const handleRemoveTrack = async (trackId, e) => {
    e.stopPropagation();
    const success = await removeTrackFromPlaylist(trackId);
    if (success) {
      await fetchPlaylists();
    }
  };

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 text-black px-4 py-2 rounded-full font-semibold hover:bg-green-400 transition"
        >
          + Create Playlist
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading playlists...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar: Playlists List */}
          <div className="md:col-span-1 space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
              Playlists ({playlists.length})
            </h2>
            {playlists.length === 0 ? (
              <p className="text-sm text-gray-500">No playlists yet. Create one!</p>
            ) : (
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition ${
                    selectedPlaylist?.id === pl.id
                      ? 'bg-[#282828] text-green-500 font-semibold'
                      : 'hover:bg-[#1f1f1f] text-gray-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate">{pl.title}</p>
                    <p className="text-xs text-gray-500">{pl.tracks?.length || 0} tracks</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(pl.id);
                    }}
                    className="text-gray-500 hover:text-red-400 text-sm px-2 py-1"
                    title="Delete Playlist"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Main Area: Selected Playlist Track Details */}
          <div className="md:col-span-3 bg-[#181818] p-6 rounded-xl border border-[#282828]">
            {selectedPlaylist ? (
              <div>
                <div className="border-b border-[#282828] pb-4 mb-4">
                  <h2 className="text-2xl font-bold">{selectedPlaylist.title}</h2>
                  {selectedPlaylist.description && (
                    <p className="text-sm text-gray-400 mt-1">{selectedPlaylist.description}</p>
                  )}
                </div>

                {selectedPlaylist.tracks?.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    This playlist is empty. Search for tracks to add them here!
                  </p>
                ) : (
                  <div className="space-y-1">
                    {selectedPlaylist.tracks?.map((track, index) => (
                      <div
                        key={track.id}
                        onClick={() =>
                          onPlayTrack?.({
                            id: track.videoId,
                            title: track.title,
                            artist: track.artist,
                            duration: track.duration,
                            thumbnail: track.thumbnail,
                          })
                        }
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[#282828] cursor-pointer group transition"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-gray-400 w-4 text-center shrink-0">{index + 1}</span>
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-10 h-10 object-cover rounded shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-white group-hover:text-green-500 truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-sm text-gray-400">{track.duration}</span>
                          <button
                            onClick={(e) => handleRemoveTrack(track.id, e)}
                            className="text-gray-500 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition"
                            title="Remove from playlist"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-12">Select a playlist to view its tracks</p>
            )}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242424] p-6 rounded-2xl w-full max-w-md border border-[#333]">
            <h3 className="text-xl font-bold mb-4">Create Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Chill Vibes"
                  className="w-full p-3 rounded-lg bg-[#181818] text-white border border-[#383838] focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Songs for late night coding sessions"
                  className="w-full p-3 rounded-lg bg-[#181818] text-white border border-[#383838] focus:outline-none focus:border-green-500 h-24 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-green-500 text-black rounded-full hover:bg-green-400 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}