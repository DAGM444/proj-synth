import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useAudioPlayer } from "@/context/PlayerContext";

const STORAGE_KEY_VOLUME = "synth_player_volume";
const STORAGE_KEY_MUTED = "synth_player_muted";

export default function AudioPlayer({ currentTrack: propCurrentTrack }) {
  const playerContext = useAudioPlayer();
  const currentTrack = playerContext?.currentTrack || propCurrentTrack;
  const isPlaying = playerContext?.isPlaying ?? false;
  const setIsPlaying = playerContext?.setIsPlaying;
  const nextTrack = playerContext?.nextTrack;
  const prevTrack = playerContext?.prevTrack;
  const togglePlayContext = playerContext?.togglePlay;
  const shuffle = playerContext?.shuffle ?? false;
  const toggleShuffle = playerContext?.toggleShuffle;
  const repeatMode = playerContext?.repeatMode ?? "off";
  const cycleRepeat = playerContext?.cycleRepeat;

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState([0]);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  // Volume & Mute state with localStorage persistence
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return [parsed];
      }
    } catch {
      // ignore
    }
    return [70];
  });

  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_MUTED) === "true";
    } catch {
      return false;
    }
  });

  const [lastNonZeroVolume, setLastNonZeroVolume] = useState(() => {
    return volume[0] > 0 ? volume[0] : 70;
  });

  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  const audioRef = useRef(null);

  // Sync volume with <audio> element and localStorage
  useEffect(() => {
    const vol = isMuted ? 0 : volume[0] / 100;
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, volume[0].toString());
      localStorage.setItem(STORAGE_KEY_MUTED, isMuted ? "true" : "false");
    } catch {
      // ignore storage errors
    }
  }, [volume, isMuted]);

  // Update audio source when currentTrack changes
  useEffect(() => {
    const videoId = currentTrack?.videoId || currentTrack?.id;
    if (videoId && audioRef.current) {
      const streamUrl = getStreamUrl(videoId);
      audioRef.current.src = streamUrl;
      const vol = isMuted ? 0 : volume[0] / 100;
      audioRef.current.volume = Math.max(0, Math.min(1, vol));

      audioRef.current
        .play()
        .then(() => {
          if (setIsPlaying) setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback error:", err);
          if (setIsPlaying) setIsPlaying(false);
        });

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title || "Track",
          artist: currentTrack.artist || "Artist",
          artwork: currentTrack.thumbnail ? [{ src: currentTrack.thumbnail }] : [],
        });
      }
    }
  }, [currentTrack, setIsPlaying]);

  // Sync isPlaying state with audio element
  useEffect(() => {
    if (!audioRef.current || !audioRef.current.src) return;
    if (isPlaying && audioRef.current.paused) {
      audioRef.current.play().catch((err) => console.error("Play error:", err));
    } else if (!isPlaying && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (togglePlayContext) {
      togglePlayContext();
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        if (setIsPlaying) setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            if (setIsPlaying) setIsPlaying(true);
          })
          .catch((err) => console.error("Play error:", err));
      }
    }
  }, [togglePlayContext, isPlaying, setIsPlaying]);

  // Track ended handler
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === "track" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.error("Replay error:", err));
    } else if (nextTrack) {
      nextTrack();
    } else if (setIsPlaying) {
      setIsPlaying(false);
    }
  }, [repeatMode, nextTrack, setIsPlaying]);

  // Time update listener
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime || 0;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(cur);
      if (dur > 0) {
        setDuration(dur);
        if (!isDraggingProgress) {
          setProgress([(cur / dur) * 100]);
        }
      }
    }
  };

  // Progress slider change (seeking)
  const handleProgressChange = (newVal) => {
    setIsDraggingProgress(true);
    const val = newVal[0];
    setProgress([val]);
    if (audioRef.current && duration > 0) {
      const targetTime = (val / 100) * duration;
      setCurrentTime(targetTime);
    }
  };

  // Commit seek when dragging finishes
  const handleProgressCommit = (newVal) => {
    setIsDraggingProgress(false);
    const val = newVal[0];
    if (audioRef.current && duration > 0) {
      const targetTime = (val / 100) * duration;
      audioRef.current.currentTime = targetTime;
    }
  };

  // Volume slider change
  const handleVolumeChange = (newVal) => {
    const val = newVal[0];
    setVolume([val]);
    if (val > 0) {
      setLastNonZeroVolume(val);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  // Mute / Unmute toggle
  const toggleMute = () => {
    if (isMuted || volume[0] === 0) {
      const restored = lastNonZeroVolume > 0 ? lastNonZeroVolume : 70;
      setIsMuted(false);
      setVolume([restored]);
    } else {
      setLastNonZeroVolume(volume[0]);
      setIsMuted(true);
    }
  };

  // Keyboard shortcuts handler: Space (Play/Pause), ArrowLeft/Right (Seek), ArrowUp/Down (Volume)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not intercept keystrokes if focused inside an editable input/textarea
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable);

      if (isInput) return;

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (audioRef.current) {
          const newTime = Math.min(
            duration || Infinity,
            (audioRef.current.currentTime || 0) + 5
          );
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          if (duration > 0) setProgress([(newTime / duration) * 100]);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (audioRef.current) {
          const newTime = Math.max(0, (audioRef.current.currentTime || 0) - 5);
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          if (duration > 0) setProgress([(newTime / duration) * 100]);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setVolume(([prevVol]) => {
          const nextVol = Math.min(100, Math.round(prevVol + 5));
          if (nextVol > 0) {
            setLastNonZeroVolume(nextVol);
            setIsMuted(false);
          }
          return [nextVol];
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setVolume(([prevVol]) => {
          const nextVol = Math.max(0, Math.round(prevVol - 5));
          if (nextVol === 0) {
            setIsMuted(true);
          }
          return [nextVol];
        });
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, duration, lastNonZeroVolume, volume, isMuted]);

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const effectiveVolume = isMuted ? 0 : volume[0];
  const VolumeIcon =
    effectiveVolume === 0 ? VolumeX : effectiveVolume < 50 ? Volume1 : Volume2;

  const trackTitle = currentTrack?.title || "No track selected";
  const trackArtist = currentTrack?.artist || "Select a track to listen";
  const trackThumbnail =
    currentTrack?.thumbnail ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop";

  if (!currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-[72px] md:h-20 bg-[#000000] border-t border-[#282828] px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4 select-none">
        {/* Track info */}
        <div className="flex items-center gap-3 w-[28%] min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-md bg-[#282828] shrink-0 overflow-hidden shadow-md">
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

        {/* Controls + Scrubber */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1 max-w-[44%] mx-auto">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Shuffle toggle */}
            <button
              onClick={toggleShuffle}
              aria-label="Toggle Shuffle"
              title={shuffle ? "Shuffle: On" : "Shuffle: Off"}
              className={`hidden sm:block transition-colors p-1 rounded-full ${
                shuffle
                  ? "text-[#1DB954]"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={prevTrack}
              aria-label="Previous Track"
              title="Previous Track"
              className="text-[#b3b3b3] hover:text-white transition-colors p-1"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              aria-label="Next Track"
              title="Next Track"
              className="text-[#b3b3b3] hover:text-white transition-colors p-1"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat Mode toggle */}
            <button
              onClick={cycleRepeat}
              aria-label={`Repeat mode: ${repeatMode}`}
              title={`Repeat: ${
                repeatMode === "track"
                  ? "Single Track"
                  : repeatMode === "queue"
                  ? "Repeat Queue"
                  : "Off"
              }`}
              className={`hidden sm:block transition-colors p-1 rounded-full ${
                repeatMode !== "off"
                  ? "text-[#1DB954]"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              {repeatMode === "track" ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Scrubber / Progress Bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-[#b3b3b3] tabular-nums w-8 text-right font-mono">
              {fmt(currentTime)}
            </span>
            <Slider
              value={progress}
              onValueChange={handleProgressChange}
              onValueCommit={handleProgressCommit}
              max={100}
              step={0.1}
              className="flex-1 cursor-pointer [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.range]:bg-[#1DB954] [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-[#4d4d4d]"
            />
            <span className="text-[10px] text-[#b3b3b3] tabular-nums w-8 font-mono">
              {fmt(duration)}
            </span>
          </div>
        </div>

        {/* Utility section: Lyrics, Queue, Volume */}
        <div className="hidden md:flex items-center gap-3 w-[28%] justify-end">
          <button
            onClick={() => setLyricsOpen(true)}
            aria-label="Lyrics"
            title="Lyrics"
            className={`p-1.5 transition-colors ${
              lyricsOpen ? "text-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setQueueOpen(true)}
            aria-label="Queue"
            title="Queue"
            className={`p-1.5 transition-colors ${
              queueOpen ? "text-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume control with mute toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute (M)" : "Mute (M)"}
              title={isMuted ? "Unmute (M)" : "Mute (M)"}
              className="text-[#b3b3b3] hover:text-white transition-colors focus:outline-none"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24 cursor-pointer [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&_.range]:bg-[#1DB954] [&_[data-orientation=horizontal]]:h-1 [&_[data-orientation=horizontal]]:bg-[#4d4d4d]"
            />
          </div>
        </div>
      </footer>

      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />
      <FullScreenLyrics open={lyricsOpen} onClose={() => setLyricsOpen(false)} />
    </>
  );
}