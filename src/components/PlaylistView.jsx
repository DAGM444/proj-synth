import React from 'react';
import { usePlaylist } from '@/context/PlaylistContext';
import { useAudioPlayer } from '@/context/PlayerContext';
import { Play, Pause, Trash2, Clock, Music, Disc3, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlaylistView({ playlist: propPlaylist, onPlayTrack: propOnPlayTrack }) {
  const {
    selectedPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
    setIsCreateModalOpen,
  } = usePlaylist();

  const {
    currentTrack,
    isPlaying,
    playTrack,
    playPlaylist,
    togglePlay,
  } = useAudioPlayer();

  const navigate = useNavigate();

  // Use provided prop playlist or fallback to selected playlist in context
  const playlist = propPlaylist || selectedPlaylist;

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-center mb-4 text-[#535353]">
          <Music className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-heading">No playlist selected</h2>
        <p className="text-sm text-[#b3b3b3] max-w-sm mb-6">
          Choose a playlist from your library or create a new one to start listening.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#1DB954] text-black font-semibold px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-heading text-sm"
        >
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>
    );
  }

  const tracks = playlist.tracks || [];

  // Check if this playlist is currently playing
  const isPlaylistActive =
    tracks.length > 0 &&
    currentTrack &&
    tracks.some((t) => (t.videoId || t.id) === (currentTrack.videoId || currentTrack.id));

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (isPlaylistActive) {
      togglePlay();
    } else {
      playPlaylist(playlist);
      if (propOnPlayTrack && tracks[0]) {
        propOnPlayTrack(tracks[0]);
      }
    }
  };

  const handlePlayTrack = (track) => {
    playTrack(track, tracks);
    if (propOnPlayTrack) {
      propOnPlayTrack(track);
    }
  };

  const handleRemoveTrack = async (e, trackId) => {
    e.stopPropagation();
    await removeTrackFromPlaylist(playlist.id, trackId);
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      await deletePlaylist(playlist.id);
    }
  };

  // Artwork collage or fallback
  const firstFourCovers = tracks
    .map((t) => t.thumbnail)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Playlist Hero Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 pb-6 border-b border-[#282828]">
        {/* Cover Art */}
        <div className="w-44 h-44 md:w-52 md:h-52 rounded-xl bg-gradient-to-br from-[#282828] to-[#121212] border border-[#333] shadow-2xl overflow-hidden shrink-0 flex items-center justify-center relative group">
          {firstFourCovers.length >= 4 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {firstFourCovers.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Artwork ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          ) : firstFourCovers.length > 0 ? (
            <img
              src={firstFourCovers[0]}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#535353]">
              <Disc3 className="w-16 h-16 animate-pulse mb-2 text-[#1DB954]" />
              <span className="text-xs font-semibold text-[#888]">Empty Playlist</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-1 rounded-full inline-block">
            Playlist
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white font-heading truncate tracking-tight">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-sm text-[#b3b3b3] line-clamp-2 leading-relaxed">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-[#727272] pt-1">
            <span className="font-semibold text-white">Your Library</span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Play All Button */}
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#1DB954] text-black font-bold rounded-full hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-lg shadow-[#1DB954]/20 font-heading text-sm"
            title={tracks.length === 0 ? 'Add songs first' : 'Play all songs'}
          >
            {isPlaylistActive && isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-black" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black ml-0.5" />
                <span>Play All</span>
              </>
            )}
          </button>
        </div>

        {/* Playlist actions */}
        <button
          onClick={handleDeletePlaylist}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#b3b3b3] hover:text-red-400 hover:bg-[#282828] rounded-md transition-colors"
          title="Delete Playlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Tracks Table */}
      {tracks.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#181818]/60 border border-[#282828] space-y-4">
          <Music className="w-12 h-12 mx-auto text-[#535353]" />
          <div>
            <h3 className="text-base font-bold text-white font-heading">This playlist is empty</h3>
            <p className="text-xs text-[#b3b3b3] mt-1">
              Find songs in Search and add them to this playlist.
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2 bg-[#282828] hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#1DB954]" /> Go to Search
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-[32px_1fr_120px_48px] md:grid-cols-[32px_1fr_1fr_100px_48px] items-center gap-4 px-3 py-2 text-xs font-semibold text-[#727272] uppercase tracking-wider border-b border-[#282828]">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="hidden md:block">Artist</span>
            <span className="flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="text-center"></span>
          </div>

          {/* Track Rows */}
          {tracks.map((track, index) => {
            const isCurrent =
              currentTrack &&
              (track.videoId || track.id) === (currentTrack.videoId || currentTrack.id);

            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className={`group grid grid-cols-[32px_1fr_120px_48px] md:grid-cols-[32px_1fr_1fr_100px_48px] items-center gap-4 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-[#282828] text-[#1DB954]'
                    : 'hover:bg-[#1f1f1f] text-white'
                }`}
              >
                {/* Index / Play icon */}
                <div className="flex items-center justify-center text-xs text-[#727272]">
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

                {/* Title + Thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={track.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'}
                    alt={track.title}
                    className="w-10 h-10 object-cover rounded shrink-0 bg-[#282828]"
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-[#1DB954]' : 'text-white group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-[#727272] truncate md:hidden">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Artist (Desktop) */}
                <span className="hidden md:block text-xs text-[#b3b3b3] truncate">
                  {track.artist}
                </span>

                {/* Duration */}
                <span className="text-xs text-[#727272] text-right tabular-nums">
                  {track.duration || '0:00'}
                </span>

                {/* Actions: Remove Track */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => handleRemoveTrack(e, track.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#727272] hover:text-red-400 hover:bg-[#282828] rounded transition-all"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
