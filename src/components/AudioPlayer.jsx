import React, { useState } from "react";
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
import LyricsOverlay from "@/components/LyricsOverlay";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [progress, setProgress] = useState([38]);
  const [volume, setVolume] = useState([70]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const duration = 225; // 3:45 in seconds
  const current = Math.round((progress[0] / 100) * duration);
  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  const VolumeIcon =
    volume[0] === 0 ? VolumeX : volume[0] < 50 ? Volume1 : Volume2;

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-[72px] md:h-20 bg-[#000000] border-t border-[#282828] px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[28%] min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-[#282828] shrink-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop"
              alt="Album art"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate hover:underline cursor-pointer">
              Midnight Drive
            </p>
            <p className="text-[#b3b3b3] text-xs truncate hover:underline cursor-pointer">
              Neon Waves
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
              onClick={() => setIsPlaying((p) => !p)}
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
              {fmt(current)}
            </span>
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
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
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-24 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.range]:bg-[#1DB954] [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-[#4d4d4d]"
            />
          </div>
        </div>
      </footer>

      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
      <LyricsOverlay open={lyricsOpen} onClose={() => setLyricsOpen(false)} />
    </>
  );
}