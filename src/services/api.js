const BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches search results from the backend Express server.
 * @param {string} query - The search query string.
 * @returns {Promise<Array>} Array of track objects.
 */
export const searchTracks = async (query) => {
  if (!query || !query.trim()) return [];

  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API searchTracks Error:', error.message);
    return [];
  }
};

/**
 * Generates the full audio streaming URL for a given YouTube video ID.
 * @param {string} videoId - The YouTube video ID.
 * @returns {string} Stream URL for the HTML5 <audio> player.
 */
export const getStreamUrl = (videoId) => {
  if (!videoId) return '';
  return `${BASE_URL}/stream/${videoId}`;
};

// ==========================================
// PHASE 4: PLAYLIST & DATABASE API FUNCTIONS
// ==========================================

/**
 * Fetches all playlists with their associated tracks.
 * @returns {Promise<Array>} List of playlist objects.
 */
export const fetchPlaylists = async () => {
  try {
    const response = await fetch(`${BASE_URL}/playlists`);
    if (!response.ok) throw new Error('Failed to fetch playlists');
    return await response.json();
  } catch (error) {
    console.error('API fetchPlaylists Error:', error.message);
    return [];
  }
};
export const getPlaylists = fetchPlaylists;

/**
 * Fetches a single playlist by ID.
 * @param {string} playlistId
 * @returns {Promise<Object|null>} Playlist object or null.
 */
export const getPlaylistById = async (playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}`);
    if (!response.ok) throw new Error('Playlist not found');
    return await response.json();
  } catch (error) {
    console.error('API getPlaylistById Error:', error.message);
    return null;
  }
};

/**
 * Creates a new playlist in the database.
 * @param {string} title - Name of the playlist.
 * @param {string} [description] - Optional playlist description.
 * @returns {Promise<Object|null>} Created playlist object.
 */
export const createPlaylist = async (title, description = '') => {
  try {
    const response = await fetch(`${BASE_URL}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!response.ok) throw new Error('Failed to create playlist');
    return await response.json();
  } catch (error) {
    console.error('API createPlaylist Error:', error.message);
    return null;
  }
};

/**
 * Adds a track to a specific playlist.
 * @param {string} playlistId - ID of the target playlist.
 * @param {Object} track - Track object ({ videoId, title, artist, duration, thumbnail }).
 * @returns {Promise<Object|null>} Saved track record.
 */
export const addTrackToPlaylist = async (playlistId, track) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: track.videoId || track.id,
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        duration: track.duration || '0:00',
        thumbnail: track.thumbnail || '',
      }),
    });
    if (!response.ok) throw new Error('Failed to add track to playlist');
    return await response.json();
  } catch (error) {
    console.error('API addTrackToPlaylist Error:', error.message);
    return null;
  }
};

/**
 * Removes a track from a playlist.
 * Supports both removeTrackFromPlaylist(playlistId, trackId) and removeTrackFromPlaylist(trackId).
 * @param {string} playlistId - Playlist ID or Track ID if single param.
 * @param {string} [trackId] - Track database ID.
 * @returns {Promise<boolean>} Success status.
 */
export const removeTrackFromPlaylist = async (playlistId, trackId) => {
  try {
    const url = trackId
      ? `${BASE_URL}/playlists/${playlistId}/tracks/${trackId}`
      : `${BASE_URL}/tracks/${playlistId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('API removeTrackFromPlaylist Error:', error.message);
    return false;
  }
};

/**
 * Deletes an entire playlist.
 * @param {string} playlistId
 * @returns {Promise<boolean>} Success status.
 */
export const deletePlaylist = async (playlistId) => {
  try {
    const response = await fetch(`${BASE_URL}/playlists/${playlistId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('API deletePlaylist Error:', error.message);
    return false;
  }
};