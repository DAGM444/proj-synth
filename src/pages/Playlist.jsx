import React, { useState } from "react";
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Trash2,
  ListPlus,
  Youtube,
  Clock,
  Music2,
} from "lucide-react";
import Equalizer from "@/components/Equalizer";

const playlist = {
  title: "Synthwave Nights",
  creator: "Proj Synth",
  cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  badge: "Public Playlist",
};

const tracks = [
  { title: "Midnight Drive", artist: "Neon Waves", album: "Neon Waves EP", cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=120&h=120&fit=crop", dateAdded: "2 days ago", duration: "3:45" },
  { title: "Solar Flare", artist: "Cosmos", album: "Cosmic Origins", cover: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=120&h=120&fit=crop", dateAdded: "2 days ago", duration: "3:12" },
  { title: "Urban Echo", artist: "City Lights", album: "Urban Echoes", cover: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=120&h=120&fit=crop", dateAdded: "5 days ago", duration: "4:05" },
  { title: "Velvet Hour", artist: "Lounge Set", album: "Late Night", cover: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=120&h=120&fit=crop", dateAdded: "1 week ago", duration: "3:40" },
  { title: "Cloud Nine", artist: "Dream Collective", album: "Skylines", cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=120&h=120&fit=crop", dateAdded: "1 week ago", duration: "2:58" },
  { title: "Bass Culture", artist: "Heavy Rotation", album: "Subsonic", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop", dateAdded: "2 weeks ago", duration: "5:21" },
  { title: "Arctic Dawn", artist: "Polar Sound", album: "Frozen", cover: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=120&h=120&fit=crop", dateAdded: "3 weeks ago", duration: "4:30" },
  { title: "Electric Pulse", artist: "Voltage", album: "Surge", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120&h=120&fit=crop", dateAdded: "1 month ago", duration: "3:55" },
];

export default function Playlist() {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const totalTracks = tracks.length;
  const totalSeconds = tracks.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const totalMin = Math.round(totalSeconds / 60);

  const togglePlayTrack = (i) => {
    if (playingTrack === i && playing) {
      setPlaying(false);
    } else {
      setPlayingTrack(i);
      setPlaying(true);
    }
  };

  const playAll = () => {
    setPlaying((p) => !p);
    if (!playing && playingTrack === null) setPlayingTrack(0);
  };

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <header className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6">
        <img
          src={playlist.cover}
          alt={playlist.title}
          className="w-40 h-40 md:w-52 md:h-52 rounded-lg shadow-2xl object-cover"
        />
        <div className="text-center md:text-left flex-1">
          <span className="text-xs text-white font-medium">{playlist.badge}</span>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-heading font-bold text-white mt-2 mb-4 break-words">
            {playlist.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1 text-sm text-[#b3b3b3]">
            <span className="text-white font-medium">{playlist.creator}</span>
            <span className="mx-1">·</span>
            <span>{totalTracks} songs,</span>
            <span className="text-[#727272]">about {totalMin} min</span>
          </div>
        </div>
      </header>

      {/* Action bar */}
      <div className="flex items-center gap-5">
        <button
          onClick={playAll}
          className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] flex items-center justify-center shadow-xl hover:scale-105 transition-all"
        >
          {playing ? (
            <Pause className="w-6 h-6 text-black" />
          ) : (
            <Play className="w-6 h-6 text-black ml-1" />
          )}
        </button>
        <button
          onClick={() => setLiked((l) => !l)}
          className={`transition-colors ${
            liked ? "text-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
          }`}
        >
          <Heart className="w-8 h-8" fill={liked ? "#1DB954" : "none"} />
        </button>
        <button className="text-[#b3b3b3] hover:text-white transition-colors">
          <MoreHorizontal className="w-8 h-8" />
        </button>
      </div>

      {/* Tracklist */}
      <div className="-mx-1">
        {/* Header row */}
        <div className="grid grid-cols-[24px_1fr_auto] md:grid-cols-[24px_1fr_140px_60px] items-center gap-3 px-3 py-2 border-b border-[#ffffff1a] text-xs uppercase tracking-wider text-[#b3b3b3]">
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="hidden md:block">Date added</span>
          <span className="flex justify-end">
            <Clock className="w-4 h-4" />
          </span>
        </div>

        {/* Tracks */}
        <div className="space-y-0.5 mt-1">
          {tracks.map((t, i) => {
            const isCurrent = playingTrack === i && playing;
            return (
              <div
                key={i}
                className="group relative grid grid-cols-[24px_1fr_auto] md:grid-cols-[24px_1fr_140px_60px] items-center gap-3 px-3 py-2 rounded-md hover:bg-[#ffffff1a] transition-colors cursor-pointer"
              >
                {/* # / play / equalizer */}
                <div className="w-6 flex items-center justify-center">
                  {isCurrent ? (
                    <button onClick={() => setPlaying(false)}>
                      <Equalizer />
                    </button>
                  ) : (
                    <>
                      <span className="text-[#b3b3b3] text-sm tabular-nums group-hover:hidden">
                        {i + 1}
                      </span>
                      <button
                        onClick={() => togglePlayTrack(i)}
                        className="hidden group-hover:block"
                      >
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Title + thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={t.cover}
                    alt={t.title}
                    className="w-10 h-10 rounded shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCurrent ? "text-[#1DB954]" : "text-white"
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-[#b3b3b3] text-xs truncate">{t.artist}</p>
                  </div>
                </div>

                {/* Date added */}
                <span className="hidden md:block text-[#b3b3b3] text-sm truncate">
                  {t.dateAdded}
                </span>

                {/* Duration + menu */}
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[#b3b3b3] text-sm tabular-nums">
                    {t.duration}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === i ? null : i);
                    }}
                    className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors rounded-full opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Context menu */}
                {openMenu === i && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setOpenMenu(null)}
                    />
                    <div className="absolute right-8 top-10 z-40 w-52 bg-[#282828] rounded-md shadow-2xl border border-[#3a3a3a] py-1 text-sm">
                      <button className="flex items-center gap-3 w-full px-3 py-2 text-left text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete from playlist
                      </button>
                      <button className="flex items-center gap-3 w-full px-3 py-2 text-left text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white transition-colors">
                        <ListPlus className="w-4 h-4" /> Add to queue
                      </button>
                      <button className="flex items-center gap-3 w-full px-3 py-2 text-left text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white transition-colors">
                        <Youtube className="w-4 h-4" /> View on YouTube
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-[#727272] text-xs pt-2">
        <Music2 className="w-3.5 h-3.5" />
        {totalTracks} tracks · about {totalMin} minutes
      </div>
    </div>
  );
}