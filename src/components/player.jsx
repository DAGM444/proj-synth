import React, { useRef, useEffect, useState } from 'react';
import { getStreamUrl } from '@/services/api';

export default function AudioPlayer({ currentTrack }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = getStreamUrl(currentTrack.id);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err));

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          artwork: [{ src: currentTrack.thumbnail }]
        });
      }
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between text-white z-50">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)} 
      />

      {/* Track Details */}
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        <img 
          src={currentTrack.thumbnail} 
          alt={currentTrack.title} 
          className="w-12 h-12 object-cover rounded shrink-0" 
        />
        <div className="min-w-0">
          <p className="font-medium text-sm text-white truncate">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-md">
        <button
          onClick={togglePlay}
          className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="w-full bg-[#3e3e3e] h-1 rounded-full mt-2 overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-200" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <div className="w-1/4"></div>
    </div>
  );
}