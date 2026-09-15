import React from "react";
import { X, Music } from "lucide-react";
import { useAudioPlayer } from "@/context/PlayerContext";

export default function QueuePanel({ open, onClose }) {
  const { currentTrack, queue, playTrack } = useAudioPlayer();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm h-full bg-[#181818] border-l border-[#282828] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282828]">
          <h2 className="text-white font-heading font-bold text-lg">Playback Queue</h2>
          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Now Playing section */}
        <div className="px-5 py-3 border-b border-[#282828] bg-[#141414]">
          <p className="text-[10px] uppercase tracking-wider text-[#1DB954] font-bold mb-1.5">
            Now Playing
          </p>
          {currentTrack ? (
            <div className="flex items-center gap-3">
              <img
                src={currentTrack.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'}
                alt={currentTrack.title}
                className="w-10 h-10 object-cover rounded bg-[#282828] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-[#b3b3b3] text-xs truncate">{currentTrack.artist}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#727272]">No track currently playing</p>
          )}
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
          <p className="text-[10px] uppercase tracking-wider text-[#b3b3b3] px-3 py-2">
            Next Up ({queue.length})
          </p>

          {queue.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[#727272]">
              <Music className="w-6 h-6 mx-auto mb-2 opacity-40" />
              Queue is empty
            </div>
          ) : (
            queue.map((t, idx) => {
              const isCurrent =
                currentTrack &&
                (t.videoId || t.id) === (currentTrack.videoId || currentTrack.id);

              return (
                <div
                  key={t.id || idx}
                  onClick={() => playTrack(t, queue)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-[#282828] text-[#1DB954]"
                      : "hover:bg-[#222] text-white"
                  }`}
                >
                  <img
                    src={t.thumbnail || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'}
                    alt={t.title}
                    className="w-8 h-8 object-cover rounded bg-[#282828] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs truncate font-medium ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                      {t.title}
                    </p>
                    <p className="text-[#727272] text-[11px] truncate">{t.artist}</p>
                  </div>
                  <span className="text-[#727272] text-xs tabular-nums shrink-0">
                    {t.duration || '0:00'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}