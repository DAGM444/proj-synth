import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchPlaylists as apiFetchPlaylists,
  createPlaylist as apiCreatePlaylist,
  addTrackToPlaylist as apiAddTrackToPlaylist,
  deletePlaylist as apiDeletePlaylist,
  removeTrackFromPlaylist as apiRemoveTrackFromPlaylist,
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all playlists for authenticated user
  const refreshPlaylists = useCallback(async () => {
    if (!isAuthenticated) {
      setPlaylists([]);
      setSelectedPlaylistId(null);
      setLoading(false);
      return [];
    }

    setLoading(true);
    try {
      const data = await apiFetchPlaylists();
      const list = Array.isArray(data) ? data : [];
      setPlaylists(list);
      return list;
    } catch (err) {
      console.error('Failed to load playlists:', err);
      setPlaylists([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // React to auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshPlaylists().then((data) => {
        if (data && data.length > 0) {
          setSelectedPlaylistId((prev) =>
            prev && data.some((p) => p.id === prev) ? prev : data[0].id
          );
        } else {
          setSelectedPlaylistId(null);
        }
      });
    } else {
      setPlaylists([]);
      setSelectedPlaylistId(null);
      setLoading(false);
      setIsCreateModalOpen(false);
    }
  }, [isAuthenticated, refreshPlaylists]);

  // Derived selected playlist object
  const selectedPlaylist =
    playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  // Safe opener for create playlist modal
  const openCreateModal = useCallback(() => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsCreateModalOpen(true);
  }, [isAuthenticated, openLoginModal]);

  // Create a new playlist
  const createPlaylist = async (title, description = '') => {
    if (!isAuthenticated) {
      openLoginModal();
      return null;
    }
    if (!title || !title.trim()) return null;

    const newPlaylist = await apiCreatePlaylist(title.trim(), description.trim());
    if (newPlaylist) {
      const created = { ...newPlaylist, tracks: [] };
      setPlaylists((prev) => [created, ...prev]);
      setSelectedPlaylistId(newPlaylist.id);
      setIsCreateModalOpen(false);
      // Sync with server
      refreshPlaylists();
      return created;
    }
    return null;
  };

  // Delete an entire playlist
  const deletePlaylist = async (playlistId) => {
    if (!isAuthenticated) {
      openLoginModal();
      return false;
    }

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
      refreshPlaylists();
    }
    return success;
  };

  // Add a track to a playlist
  const addTrackToPlaylist = async (playlistId, track) => {
    if (!isAuthenticated) {
      openLoginModal();
      return null;
    }

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
    await refreshPlaylists();
    return savedTrack;
  };

  // Remove a track from a playlist
  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    if (!isAuthenticated) {
      openLoginModal();
      return false;
    }

    const actualTrackId = trackId || playlistId;
    const actualPlaylistId = trackId ? playlistId : selectedPlaylistId;

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
        openCreateModal,
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
