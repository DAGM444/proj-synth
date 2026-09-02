import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Mic2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import QueuePanel from "@/components/QueuePanel";
import FullScreenLyrics from "@/components/FullScreenLyrics";
import { getStreamUrl } from "@/services/api";

export default function AudioPlayer({ currentTrack }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [progress, setProgress] = useState([0]);
  const [volume, setVolume] = useState([70]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const audioRef = useRef(null);

  // Update audio source when currentTrack changes
  useEffect(() => {
    if (currentTrack?.id && audioRef.current) {
      const streamUrl = getStreamUrl(currentTrack.id);
      audioRef.current.src = streamUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Playback error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  // Handle Play / Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => console.error("Play error:", err));
    }
  };

  // Time update listener
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime || 0;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(cur);
      if (dur > 0) {
        setDuration(dur);
        setProgress([(cur / dur) * 100]);
      }
    }
  };

  // Scrubber drag handler
  const handleProgressChange = (newVal) => {
    const val = newVal[0];
    setProgress([val]);
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (val / 100) * duration;
    }
  };

  // Volume slider handler
  const handleVolumeChange = (newVal) => {
    const val = newVal[0];
    setVolume([val]);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  const VolumeIcon =
    volume[0] === 0 ? VolumeX : volume[0] < 50 ? Volume1 : Volume2;

  const trackTitle = currentTrack?.title || "No track selected";
  const trackArtist = currentTrack?.artist || "Select a track to listen";
  const trackThumbnail = currentTrack?.thumbnail || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop";

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-[72px] md:h-20 bg-[#000000] border-t border-[#282828] px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[28%] min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-[#282828] shrink-0 overflow-hidden">
            <img
              src={trackThumbnail}
              alt={trackTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
              {trackTitle}
            </p>
            <p className="text-[#b3b3b3] text-xs truncate hover:underline cursor-pointer">
              {trackArtist}
            </p>
          </div>
          <button
            onClick={() => setIsFavorite((f) => !f)}
            aria-label="Toggle favorite"
            className={`p-1.5 transition-colors shrink-0 ${
              isFavorite
                ? "text-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={isFavorite ? "#1DB954" : "none"}
            />
          </button>
        </div>

        {/* Controls + scrubber */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 max-w-[44%] mx-auto">
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setShuffle((s) => !s)}
              aria-label="Shuffle"
              className={`hidden sm:block transition-colors ${
                shuffle
                  ? "text-[#1DB954]"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              aria-label="Previous"
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              aria-label="Play/Pause"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>
            <button
              aria-label="Next"
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={cycleRepeat}
              aria-label="Repeat"
              className={`hidden sm:block transition-colors ${
                repeat !== "off"
                  ? "text-[#1DB954]"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              {repeat === "one" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Scrubber */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-[#b3b3b3] tabular-nums w-8 text-right">
              {fmt(currentTime)}
            </span>
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="flex-1 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.range]:bg-[#1DB954] [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-[#4d4d4d]"
            />
            <span className="text-[10px] text-[#b3b3b3] tabular-nums w-8">
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* Utility section */}
        <div className="hidden md:flex items-center gap-3 w-[28%] justify-end">
          <button
            onClick={() => setLyricsOpen(true)}
            aria-label="Lyrics"
            className={`p-1.5 transition-colors ${
              lyricsOpen
                ? "text-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setQueueOpen(true)}
            aria-label="Queue"
            className={`p-1.5 transition-colors ${
              queueOpen
                ? "text-[#1DB954]"
                : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <VolumeIcon className="w-4 h-4 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer" />
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.range]:bg-[#1DB954] [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-[#4d4d4d]"
            />
          </div>
        </div>
      </footer>

      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
      <FullScreenLyrics open={lyricsOpen} onClose={() => setLyricsOpen(false)} />
    </>
  );
}