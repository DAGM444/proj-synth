import React, { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  Play,
  Pause,
  ListPlus,
  Music,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { searchTracks } from '@/services/api';
import { useAudioPlayer } from '@/context/PlayerContext';
import AddToPlaylistDropdown from '@/components/AddToPlaylistDropdown';

const BROWSE_GENRES = [
  { name: 'Pop', color: 'from-pink-600 to-rose-700', query: 'Pop Hits 2026' },
  { name: 'Hip-Hop', color: 'from-orange-600 to-amber-700', query: 'Hip Hop Classics' },
  { name: 'Electronic', color: 'from-purple-600 to-indigo-800', query: 'Electronic Dance Music' },
  { name: 'Rock', color: 'from-red-700 to-rose-950', query: 'Classic Rock' },
  { name: 'R&B', color: 'from-cyan-600 to-blue-800', query: 'R&B Chill Vibes' },
  { name: 'Chill & Lofi', color: 'from-teal-600 to-emerald-800', query: 'Lofi Hip Hop Beats' },
  { name: 'Jazz & Soul', color: 'from-amber-600 to-orange-800', query: 'Smooth Jazz' },
  { name: 'Gaming', color: 'from-violet-600 to-purple-900', query: 'Gaming Beats' },
];

export default function Search({ onPlayTrack }) {
  const [inputVal, setInputVal] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'tracks' | 'artists' | 'playlists'
  const [loading, setLoading] = useState(false);

  // Results state
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = useAudioPlayer();

  // Debounced search effect (300ms)
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setTracks([]);
      setArtists([]);
      setPlaylists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        if (activeTab === 'all') {
          // Fetch categorized results in parallel
          const [tracksRes, artistsRes, playlistsRes] = await Promise.all([
            searchTracks(trimmed, { type: 'track', limit: 6 }),
            searchTracks(trimmed, { type: 'artist', limit: 5 }),
            searchTracks(trimmed, { type: 'playlist', limit: 6 }),
          ]);

          setTracks(tracksRes || []);
          setArtists(artistsRes || []);
          setPlaylists(playlistsRes || []);
        } else if (activeTab === 'tracks') {
          const res = await searchTracks(trimmed, { type: 'track', limit: 25 });
          setTracks(res || []);
        } else if (activeTab === 'artists') {
          const res = await searchTracks(trimmed, { type: 'artist', limit: 20 });
          setArtists(res || []);
        } else if (activeTab === 'playlists') {
          const res = await searchTracks(trimmed, { type: 'playlist', limit: 20 });
          setPlaylists(res || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputVal, activeTab]);

  const handleTrackClick = (track, trackList = tracks) => {
    const isCurrent =
      currentTrack && (track.videoId || track.id) === (currentTrack.videoId || currentTrack.id);

    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, trackList);
      if (onPlayTrack) {
        onPlayTrack(track);
      }
    }
  };

  const handleAddToQueue = (e, track) => {
    e.stopPropagation();
    addToQueue(track);
    toast.success(`Added "${track.title}" to queue`);
  };

  const clearInput = () => {
    setInputVal('');
    setTracks([]);
    setArtists([]);
    setPlaylists([]);
  };

  const hasAnyResults = tracks.length > 0 || artists.length > 0 || playlists.length > 0;
  const topResult = tracks[0] || artists[0] || playlists[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Search Bar Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-full bg-[#242424] text-white text-sm placeholder-[#727272] border border-transparent focus:border-[#1DB954] focus:bg-[#2a2a2a] outline-none transition-all shadow-inner"
            autoFocus
          />
          {inputVal && (
            <button
              onClick={clearInput}
              aria-label="Clear search input"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Selection Filter */}
        {inputVal.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'tracks', label: 'Tracks' },
              { id: 'artists', label: 'Artists' },
              { id: 'playlists', label: 'Playlists' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#242424] text-white hover:bg-[#2e2e2e]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="flex items-center gap-3 text-sm text-[#b3b3b3] py-4 px-2">
          <div className="w-4 h-4 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          <span>Searching YouTube...</span>
        </div>
      )}

      {/* Browsing Categories (when no search query entered) */}
      {!inputVal.trim() && (
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-bold text-white font-heading">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BROWSE_GENRES.map((genre) => (
              <div
                key={genre.name}
                onClick={() => setInputVal(genre.query)}
                className={`h-28 rounded-xl bg-gradient-to-br ${genre.color} p-4 flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-lg relative overflow-hidden group`}
              >
                <span className="font-bold text-lg text-white font-heading">{genre.name}</span>
                <span className="text-xs text-white/80 flex items-center gap-1 group-hover:text-white">
                  <Sparkles className="w-3 h-3" /> Explore
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {!loading && inputVal.trim() && (
        <div className="space-y-8">
          {/* ======================================= */}
          {/* VIEW: ALL (Categorized layout) */}
          {/* ======================================= */}
          {activeTab === 'all' && hasAnyResults && (
            <>
              {/* Top Result + Top Songs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Hero Top Result Card */}
                {topResult && (
                  <div className="lg:col-span-5 space-y-2">
                    <h2 className="text-xl font-bold text-white font-heading">Top Result</h2>
                    <div
                      onClick={() => handleTrackClick(topResult)}
                      className="group relative bg-[#181818] hover:bg-[#282828] p-5 rounded-2xl transition-all cursor-pointer border border-[#282828] hover:border-[#383838] shadow-xl flex flex-col justify-between h-[230px]"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            topResult.thumbnail ||
                            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'
                          }
                          alt={topResult.title}
                          className={`w-24 h-24 object-cover shadow-lg ${
                            topResult.type === 'artist' ? 'rounded-full' : 'rounded-lg'
                          }`}
                        />
                        <div className="min-w-0 flex-1 pt-1">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-[#1DB954] mb-2">
                            {topResult.type || 'Track'}
                          </span>
                          <h3 className="text-xl font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                            {topResult.title}
                          </h3>
                          <p className="text-sm text-[#b3b3b3] truncate mt-1">
                            {topResult.artist || topResult.channel?.name}
                          </p>
                        </div>
                      </div>

                      {/* Play Button */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-[#727272] font-mono">
                          {topResult.duration}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Songs section */}
                {tracks.length > 0 && (
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white font-heading">Songs</h2>
                      <button
                        onClick={() => setActiveTab('tracks')}
                        className="text-xs font-semibold text-[#b3b3b3] hover:text-white hover:underline"
                      >
                        See all
                      </button>
                    </div>

                    <div className="space-y-1">
                      {tracks.slice(0, 4).map((track) => {
                        const isCurrent =
                          currentTrack &&
                          (track.videoId || track.id) === (currentTrack.videoId || currentTrack.id);

                        return (
                          <div
                            key={track.id}
                            onClick={() => handleTrackClick(track)}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              isCurrent
                                ? 'bg-[#282828] text-[#1DB954]'
                                : 'hover:bg-[#1e1e1e] text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                              <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-[#282828]">
                                <img
                                  src={track.thumbnail}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  {isCurrent && isPlaying ? (
                                    <Pause className="w-4 h-4 text-white fill-white" />
                                  ) : (
                                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                  )}
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
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

                            {/* Inline Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => handleAddToQueue(e, track)}
                                aria-label="Add to queue"
                                title="Add to queue"
                                className="p-1.5 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-full transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <ListPlus className="w-4 h-4" />
                              </button>
                              <AddToPlaylistDropdown track={track} />
                              <span className="text-xs text-[#727272] font-mono tabular-nums w-10 text-right hidden sm:block">
                                {track.duration}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Artists Section */}
              {artists.length > 0 && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white font-heading">Artists</h2>
                    <button
                      onClick={() => setActiveTab('artists')}
                      className="text-xs font-semibold text-[#b3b3b3] hover:text-white hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {artists.slice(0, 5).map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => handleTrackClick(artist)}
                        className="group p-3.5 rounded-xl bg-[#181818] hover:bg-[#222222] transition-all cursor-pointer flex flex-col items-center text-center border border-transparent hover:border-[#333333]"
                      >
                        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 shadow-lg bg-[#282828]">
                          <img
                            src={artist.thumbnail}
                            alt={artist.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-sm font-semibold text-white truncate w-full group-hover:text-[#1DB954] transition-colors">
                          {artist.title}
                        </p>
                        <span className="text-xs text-[#727272] mt-0.5">Artist</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlists & Compilations Section */}
              {playlists.length > 0 && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white font-heading">Playlists & Albums</h2>
                    <button
                      onClick={() => setActiveTab('playlists')}
                      className="text-xs font-semibold text-[#b3b3b3] hover:text-white hover:underline"
                    >
                      See all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {playlists.slice(0, 5).map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => handleTrackClick(pl)}
                        className="group p-3 rounded-xl bg-[#181818] hover:bg-[#222222] transition-all cursor-pointer border border-transparent hover:border-[#333333]"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-2.5 shadow-md bg-[#282828]">
                          <img
                            src={pl.thumbnail}
                            alt={pl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackClick(pl);
                            }}
                            className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all"
                          >
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-[#1DB954] transition-colors">
                          {pl.title}
                        </p>
                        <p className="text-[11px] text-[#727272] truncate mt-0.5">{pl.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ======================================= */}
          {/* VIEW: TRACKS TAB */}
          {/* ======================================= */}
          {activeTab === 'tracks' && (
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-heading">Tracks</h2>
              <div className="space-y-1">
                {tracks.map((track, index) => {
                  const isCurrent =
                    currentTrack &&
                    (track.videoId || track.id) === (currentTrack.videoId || currentTrack.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackClick(track, tracks)}
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
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-11 h-11 object-cover rounded shrink-0 bg-[#282828]"
                        />

                        <div className="min-w-0 flex-1">
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

                      {/* Inline Actions */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={(e) => handleAddToQueue(e, track)}
                          aria-label="Add to queue"
                          title="Add to queue"
                          className="p-1.5 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ListPlus className="w-4 h-4" />
                        </button>
                        <AddToPlaylistDropdown track={track} />
                        <span className="text-xs text-[#727272] font-mono tabular-nums hidden sm:block w-12 text-right">
                          {track.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: ARTISTS TAB */}
          {/* ======================================= */}
          {activeTab === 'artists' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white font-heading">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => handleTrackClick(artist)}
                    className="group p-4 rounded-xl bg-[#181818] hover:bg-[#222222] transition-all cursor-pointer flex flex-col items-center text-center border border-transparent hover:border-[#333333]"
                  >
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3.5 shadow-lg bg-[#282828]">
                      <img
                        src={artist.thumbnail}
                        alt={artist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white truncate w-full group-hover:text-[#1DB954] transition-colors">
                      {artist.title}
                    </p>
                    <span className="text-xs text-[#727272] mt-1">Artist</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: PLAYLISTS TAB */}
          {/* ======================================= */}
          {activeTab === 'playlists' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white font-heading">Playlists & Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => handleTrackClick(pl)}
                    className="group p-3.5 rounded-xl bg-[#181818] hover:bg-[#222222] transition-all cursor-pointer border border-transparent hover:border-[#333333]"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-3 shadow-md bg-[#282828]">
                      <img
                        src={pl.thumbnail}
                        alt={pl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackClick(pl);
                        }}
                        className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all"
                      >
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#1DB954] transition-colors">
                      {pl.title}
                    </p>
                    <p className="text-xs text-[#727272] truncate mt-1">{pl.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results fallback */}
          {!hasAnyResults && (
            <div className="py-20 text-center text-[#727272]">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-semibold text-white">No results found for "{inputVal}"</p>
              <p className="text-xs mt-1">Check spelling or try a different search keyword.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
