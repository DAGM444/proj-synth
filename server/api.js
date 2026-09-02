const BASE_URL = 'http://localhost:5000/api';

// Search YouTube videos
export const searchTracks = async (query) => {
  if (!query) return [];
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error('API Search Error:', error);
    return [];
  }
};

// Returns direct audio stream URL for HTML5 <audio> tag
export const getStreamUrl = (videoId) => {
  return `${BASE_URL}/stream/${videoId}`;
};