import React from 'react';
import {
  X,
  Music,
  Trash2,
  GripVertical,
  Play,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAudioPlayer } from '@/context/PlayerContext';

export default function QueuePanel({ open, onClose }) {
  const {
    currentTrack,
    queue,
    queueIndex,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    isLoadingRelated,
    repeatMode,
    isShuffled,
  } = useAudioPlayer();

  if (!open) return null;

  // Upcoming tracks in the queue after the current track
  const nextUpTracks = queue.slice(queueIndex + 1);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    if (fromIndex === toIndex) return;

    // Convert from nextUp relative indices to actual queue indices
    const actualFrom = queueIndex + 1 + fromIndex;
    const actualTo = queueIndex + 1 + toIndex;
    reorderQueue(actualFrom, actualTo);
  };

  const handleMoveUp = (idx) => {
    if (idx <= 0) return;
    const actualCurrent = queueIndex + 1 + idx;
    const actualTarget = queueIndex + 1 + (idx - 1);
    reorderQueue(actualCurrent, actualTarget);
  };

  const handleMoveDown = (idx) => {
    if (idx >= nextUpTracks.length - 1) return;
    const actualCurrent = queueIndex + 1 + idx;
    const actualTarget = queueIndex + 1 + (idx + 1);
    reorderQueue(actualCurrent, actualTarget);
  };

  const handleRemove = (idx, e) => {
    e.stopPropagation();
    const actualIndex = queueIndex + 1 + idx;
    removeFromQueue(actualIndex);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-[#121212] border-l border-[#282828] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282828] bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-white font-heading font-bold text-lg">Playback Queue</h2>
            <span className="text-xs bg-[#282828] text-[#b3b3b3] px-2 py-0.5 rounded-full font-mono">
              {queue.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {nextUpTracks.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-[#b3b3b3] hover:text-[#e91429] transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-[#282828]"
                title="Clear upcoming queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#b3b3b3] hover:text-white transition-colors p-1 rounded-full hover:bg-[#282828]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Now Playing section */}
        <div className="px-5 py-3.5 border-b border-[#282828] bg-[#161616]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-[#1DB954] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
              Now Playing
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#727272]">
              {isShuffled && <span className="text-[#1DB954]">Shuffle On</span>}
              {repeatMode !== 'off' && (
                <span className="text-[#1DB954]">
                  Repeat: {repeatMode === 'track' ? 'Track' : 'Queue'}
                </span>
              )}
            </div>
          </div>

          {currentTrack ? (
            <div className="flex items-center gap-3 bg-[#1f1f1f] p-2.5 rounded-lg border border-[#2e2e2e]">
              <img
                src={
                  currentTrack.thumbnail ||
                  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'
                }
                alt={currentTrack.title}
                className="w-12 h-12 object-cover rounded bg-[#282828] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">
                  {currentTrack.title}
                </p>
                <p className="text-[#b3b3b3] text-xs truncate">{currentTrack.artist}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-xs text-[#1DB954] font-mono">
                {currentTrack.duration || '0:00'}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#727272]">No track currently playing</p>
          )}
        </div>

        {/* Up Next List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs uppercase font-bold tracking-wider text-[#b3b3b3]">
                Next In Queue ({nextUpTracks.length})
              </p>
              <span className="text-[11px] text-[#727272]">Drag or use arrows to reorder</span>
            </div>

            {nextUpTracks.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-[#727272] border border-dashed border-[#282828] rounded-xl my-2">
                <Music className="w-8 h-8 mx-auto mb-2 text-[#4d4d4d]" />
                <p className="font-medium text-[#b3b3b3]">Queue is empty</p>
                <p className="text-[11px] mt-1 text-[#727272]">
                  Add songs from search or browse to keep listening.
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="queue-list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1.5"
                    >
                      {nextUpTracks.map((track, idx) => {
                        const actualIdx = queueIndex + 1 + idx;
                        const draggableId = `track-${track.id || track.videoId || actualIdx}-${actualIdx}`;

                        return (
                          <Draggable
                            key={draggableId}
                            draggableId={draggableId}
                            index={idx}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                className={`group flex items-center gap-2.5 p-2 rounded-lg transition-all border ${
                                  dragSnapshot.isDragging
                                    ? 'bg-[#2a2a2a] border-[#1DB954] shadow-2xl scale-[1.02] z-50'
                                    : 'bg-[#181818] border-transparent hover:bg-[#222222] hover:border-[#333333]'
                                }`}
                              >
                                {/* Drag handle */}
                                <div
                                  {...dragProvided.dragHandleProps}
                                  className="text-[#4d4d4d] group-hover:text-[#b3b3b3] transition-colors cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Reorder buttons (Move Up / Down) */}
                                <div className="flex flex-col shrink-0">
                                  <button
                                    onClick={() => handleMoveUp(idx)}
                                    disabled={idx === 0}
                                    title="Move up"
                                    className="text-[#4d4d4d] hover:text-white disabled:opacity-20 disabled:hover:text-[#4d4d4d] p-0.5"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveDown(idx)}
                                    disabled={idx === nextUpTracks.length - 1}
                                    title="Move down"
                                    className="text-[#4d4d4d] hover:text-white disabled:opacity-20 disabled:hover:text-[#4d4d4d] p-0.5"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Thumbnail + Play button on hover */}
                                <div
                                  onClick={() => playTrack(track, queue)}
                                  className="relative w-9 h-9 rounded bg-[#282828] shrink-0 overflow-hidden cursor-pointer"
                                >
                                  <img
                                    src={
                                      track.thumbnail ||
                                      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop'
                                    }
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                                  </div>
                                </div>

                                {/* Title & Artist */}
                                <div
                                  onClick={() => playTrack(track, queue)}
                                  className="min-w-0 flex-1 cursor-pointer"
                                >
                                  <p className="text-xs font-medium text-white truncate group-hover:text-[#1DB954] transition-colors">
                                    {track.title}
                                  </p>
                                  <p className="text-[11px] text-[#727272] truncate">
                                    {track.artist}
                                  </p>
                                </div>

                                {/* Duration */}
                                <span className="text-[11px] text-[#727272] font-mono shrink-0">
                                  {track.duration || '0:00'}
                                </span>

                                {/* Remove button */}
                                <button
                                  onClick={(e) => handleRemove(idx, e)}
                                  aria-label="Remove from queue"
                                  title="Remove from queue"
                                  className="opacity-0 group-hover:opacity-100 text-[#727272] hover:text-[#e91429] p-1.5 rounded transition-all shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Auto-Recommendations Notice */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#181818] to-[#1f2920] border border-[#282828] text-xs">
            <div className="flex items-center gap-2 text-[#1DB954] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autoplay Recommendations</span>
            </div>
            <p className="text-[11px] text-[#b3b3b3] leading-relaxed">
              When your queue finishes, Synth automatically fetches and queues related tracks based
              on your recent playback to keep the music flowing.
            </p>
            {isLoadingRelated && (
              <div className="flex items-center gap-2 mt-2.5 text-[#1DB954] text-[11px] font-medium">
                <div className="w-3 h-3 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                <span>Finding recommended tracks...</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}