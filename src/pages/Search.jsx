import React, { useState, useEffect } from 'react';
import { searchTracks } from '@/services/api';
import { useAudioPlayer } from '@/context/PlayerContext';
import AddToPlaylistDropdown from '@/components/AddToPlaylistDropdown';
import { Search as SearchIcon, Play } from 'lucide-react';

export default function SearchPage({ onPlayTrack }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const tracks = await searchTracks(query);
        setResults(tracks || []);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleTrackClick = (track) => {
    const isCurrent =
      currentTrack && (track.videoId || track.id) === (currentTrack.videoId || currentTrack.id);

    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, results);
      if (onPlayTrack) {
        onPlayTrack(track);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="relative max-w-lg">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-full bg-[#242424] text-white text-sm placeholder-[#727272] border border-transparent focus:border-[#1DB954] outline-none transition-all shadow-inner"
          autoFocus
        />
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-sm text-[#b3b3b3] py-8">
          <div className="w-5 h-5 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          <span>Searching YouTube...</span>
        </div>
      )}

      {/* Results Header */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white font-heading">Search Results</h2>
          
          <div className="space-y-1">
            {results.map((track, index) => {
              const isCurrent =
                currentTrack &&
                (track.videoId || track.id) === (currentTrack.videoId || currentTrack.id);

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={`group flex items-center justify-between p-2.5 md:p-3 rounded-lg cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-[#282828] text-[#1DB954]'
                      : 'hover:bg-[#1f1f1f] text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                    {/* Index or Play icon */}
                    <div className="w-6 flex items-center justify-center text-xs text-[#727272] shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="w-3.5 h-3.5 flex items-end justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-[#1DB954] animate-pulse" />
                          <span className="w-0.5 h-2 bg-[#1DB954] animate-pulse delay-75" />
                          <span className="w-0.5 h-3.5 bg-[#1DB954] animate-pulse delay-150" />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="w-3.5 h-3.5 text-white hidden group-hover:block ml-0.5" />
                        </>
                      )}
                    </div>

                    <img
                      src={track.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'}
                      alt={track.title}
                      className="w-11 h-11 object-cover rounded shrink-0 bg-[#282828]"
                    />

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isCurrent ? 'text-[#1DB954]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-[#727272] truncate">{track.artist}</p>
                    </div>
                  </div>

                  {/* Actions: Duration + Add to Playlist dropdown */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#727272] tabular-nums hidden sm:block">
                      {track.duration || '0:00'}
                    </span>
                    <AddToPlaylistDropdown track={track} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="py-16 text-center text-[#727272]">
          <p className="text-base font-semibold text-white">No results found for "{query}"</p>
          <p className="text-xs mt-1">Check spelling or try a different search keyword.</p>
        </div>
      )}
    </div>
  );
}