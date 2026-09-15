import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchPlaylists as apiFetchPlaylists,
  createPlaylist as apiCreatePlaylist,
  addTrackToPlaylist as apiAddTrackToPlaylist,
  deletePlaylist as apiDeletePlaylist,
  removeTrackFromPlaylist as apiRemoveTrackFromPlaylist,
} from '@/services/api';

const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all playlists
  const refreshPlaylists = useCallback(async () => {
    try {
      const data = await apiFetchPlaylists();
      setPlaylists(data || []);
      return data || [];
    } catch (err) {
      console.error('Failed to load playlists:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPlaylists().then((data) => {
      if (data.length > 0 && !selectedPlaylistId) {
        setSelectedPlaylistId(data[0].id);
      }
    });
  }, [refreshPlaylists]);

  // Derived selected playlist object
  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  // Create a new playlist
  const createPlaylist = async (title, description = '') => {
    if (!title || !title.trim()) return null;
    const newPlaylist = await apiCreatePlaylist(title.trim(), description.trim());
    if (newPlaylist) {
      const created = { ...newPlaylist, tracks: [] };
      setPlaylists((prev) => [created, ...prev]);
      setSelectedPlaylistId(newPlaylist.id);
      setIsCreateModalOpen(false);
      // Re-fetch to ensure sync with server
      refreshPlaylists();
      return created;
    }
    return null;
  };

  // Delete an entire playlist
  const deletePlaylist = async (playlistId) => {
    // Optimistic update
    setPlaylists((prev) => {
      const filtered = prev.filter((p) => p.id !== playlistId);
      if (selectedPlaylistId === playlistId) {
        setSelectedPlaylistId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    const success = await apiDeletePlaylist(playlistId);
    if (!success) {
      // Rollback on failure
      refreshPlaylists();
    }
    return success;
  };

  // Add a track to a playlist
  const addTrackToPlaylist = async (playlistId, track) => {
    const targetTrack = {
      videoId: track.videoId || track.id,
      title: track.title,
      artist: track.artist || 'Unknown Artist',
      duration: track.duration || '0:00',
      thumbnail: track.thumbnail || '',
    };

    // Optimistic update
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const currentTracks = pl.tracks || [];
          return {
            ...pl,
            tracks: [...currentTracks, { ...targetTrack, id: `temp-${Date.now()}` }],
          };
        }
        return pl;
      })
    );

    const savedTrack = await apiAddTrackToPlaylist(playlistId, targetTrack);
    // Refresh to get server generated IDs & order
    await refreshPlaylists();
    return savedTrack;
  };

  // Remove a track from a playlist
  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    const actualTrackId = trackId || playlistId;
    const actualPlaylistId = trackId ? playlistId : selectedPlaylistId;

    // Optimistic update
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (!actualPlaylistId || pl.id === actualPlaylistId) {
          return {
            ...pl,
            tracks: (pl.tracks || []).filter((t) => t.id !== actualTrackId),
          };
        }
        return pl;
      })
    );

    const success = await apiRemoveTrackFromPlaylist(actualPlaylistId, actualTrackId);
    if (!success) {
      refreshPlaylists();
    }
    return success;
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        selectedPlaylist,
        selectedPlaylistId,
        setSelectedPlaylistId,
        loading,
        fetchPlaylists: refreshPlaylists,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        isCreateModalOpen,
        setIsCreateModalOpen,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}
