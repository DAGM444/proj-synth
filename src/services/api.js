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

    const tracks = await response.json();
    return tracks;
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