import React, { useState, useEffect } from 'react';
import { searchTracks, getStreamUrl } from '../services/api';

export default function SearchPage({ onPlayTrack }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const tracks = await searchTracks(query);
        setResults(tracks);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 400); // 400ms debounce to avoid spamming the backend

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-white">
      {/* Search Input */}
      <input
        type="text"
        placeholder="What do you want to listen to?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-md p-3 rounded-full bg-[#242424] text-white border-none outline-none focus:ring-2 focus:ring-green-500"
      />

      {loading && <p className="mt-4 text-gray-400">Searching YouTube...</p>}

      {/* Results Table */}
      <div className="mt-6">
        {results.map((track, index) => (
          <div
            key={track.id}
            onClick={() => onPlayTrack(track)}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-[#2a2a2a] cursor-pointer group transition"
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-400 w-4">{index + 1}</span>
              <img src={track.thumbnail} alt={track.title} className="w-12 h-12 object-cover rounded" />
              <div>
                <p className="font-semibold text-white group-hover:text-green-500">{track.title}</p>
                <p className="text-sm text-gray-400">{track.artist}</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">{track.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}