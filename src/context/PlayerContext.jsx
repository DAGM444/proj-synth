import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getRelatedTracks } from '@/services/api';

const PlayerContext = createContext(null);

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalQueue, setOriginalQueue] = useState([]);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'queue' | 'track'
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // Ref to always access latest state in async callbacks without stale closures
  const stateRef = useRef({
    currentTrack,
    queue,
    originalQueue,
    queueIndex,
    isShuffled,
    repeatMode,
    isPlaying,
  });
  stateRef.current = {
    currentTrack,
    queue,
    originalQueue,
    queueIndex,
    isShuffled,
    repeatMode,
    isPlaying,
  };

  // Play a single track, optionally setting the entire queue
  const playTrack = useCallback(
    (track, newQueue = null) => {
      if (!track) return;
      const formattedTrack = {
        ...track,
        id: track.videoId || track.id,
        videoId: track.videoId || track.id,
      };

      if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
        const formattedQueue = newQueue.map((t) => ({
          ...t,
          id: t.videoId || t.id,
          videoId: t.videoId || t.id,
        }));

        setOriginalQueue(formattedQueue);

        if (stateRef.current.isShuffled) {
          const others = formattedQueue.filter(
            (t) => (t.videoId || t.id) !== formattedTrack.id
          );
          const shuffledQueue = [formattedTrack, ...shuffleArray(others)];
          setQueue(shuffledQueue);
          setQueueIndex(0);
        } else {
          setQueue(formattedQueue);
          const foundIdx = formattedQueue.findIndex(
            (t) => (t.videoId || t.id) === formattedTrack.id
          );
          setQueueIndex(foundIdx >= 0 ? foundIdx : 0);
        }
      } else {
        // No new queue provided: if queue is empty, set track as only queue item
        setQueue((prevQueue) => {
          if (prevQueue.length === 0) {
            setOriginalQueue([formattedTrack]);
            setQueueIndex(0);
            return [formattedTrack];
          }
          const foundIdx = prevQueue.findIndex(
            (t) => (t.videoId || t.id) === formattedTrack.id
          );
          if (foundIdx >= 0) {
            setQueueIndex(foundIdx);
            return prevQueue;
          }
          // Not in queue, append right after current track
          const curIdx = stateRef.current.queueIndex;
          const nextIdx = curIdx + 1;
          const updated = [...prevQueue];
          updated.splice(nextIdx, 0, formattedTrack);
          setQueueIndex(nextIdx);

          setOriginalQueue((prevOrig) => {
            const origCopy = [...prevOrig];
            origCopy.splice(curIdx + 1, 0, formattedTrack);
            return origCopy;
          });

          return updated;
        });
      }

      setCurrentTrack(formattedTrack);
      setIsPlaying(true);
    },
    []
  );

  // Play all tracks in a playlist from the beginning
  const playPlaylist = useCallback(
    (playlist) => {
      if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
      playTrack(playlist.tracks[0], playlist.tracks);
    },
    [playTrack]
  );

  // Fetch and append related YouTube audio streams when queue finishes
  const fetchAndAppendRelated = useCallback(async (trackToRecommendFrom) => {
    const track = trackToRecommendFrom || stateRef.current.currentTrack;
    const videoId = track?.videoId || track?.id;
    if (!videoId) {
      setIsPlaying(false);
      return;
    }

    setIsLoadingRelated(true);
    try {
      const related = await getRelatedTracks(videoId);
      if (related && related.length > 0) {
        const currentQ = stateRef.current.queue;
        const existingIds = new Set(currentQ.map((t) => t.videoId || t.id));
        const filtered = related.filter((t) => !existingIds.has(t.videoId || t.id));
        const tracksToAdd = filtered.length > 0 ? filtered : related;

        const newStartIndex = currentQ.length;
        const updatedQueue = [...currentQ, ...tracksToAdd];

        setQueue(updatedQueue);
        setOriginalQueue((prev) => [...prev, ...tracksToAdd]);
        setQueueIndex(newStartIndex);
        setCurrentTrack(updatedQueue[newStartIndex]);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Failed to fetch related tracks:', err);
      setIsPlaying(false);
    } finally {
      setIsLoadingRelated(false);
    }
  }, []);

  // Advance to next track in queue with repeat mode and auto-recommendation handling
  const nextTrack = useCallback(() => {
    const { queue: currentQ, queueIndex: curIdx, repeatMode: repMode, currentTrack: curTrack } = stateRef.current;
    if (currentQ.length === 0) return;

    if (curIdx < currentQ.length - 1) {
      const nextIdx = curIdx + 1;
      setQueueIndex(nextIdx);
      setCurrentTrack(currentQ[nextIdx]);
      setIsPlaying(true);
    } else {
      // Reached end of current queue
      if (repMode === 'queue' || repMode === 'all') {
        setQueueIndex(0);
        setCurrentTrack(currentQ[0]);
        setIsPlaying(true);
      } else if (repMode === 'track' || repMode === 'one') {
        // Replay current track
        setIsPlaying(true);
      } else {
        // Repeat mode is 'off': Auto-recommendation continuation
        fetchAndAppendRelated(curTrack);
      }
    }
  }, [fetchAndAppendRelated]);

  // Go to previous track in queue
  const prevTrack = useCallback(() => {
    const { queue: currentQ, queueIndex: curIdx, repeatMode: repMode } = stateRef.current;
    if (currentQ.length === 0) return;

    if (curIdx > 0) {
      const prevIdx = curIdx - 1;
      setQueueIndex(prevIdx);
      setCurrentTrack(currentQ[prevIdx]);
      setIsPlaying(true);
    } else {
      // At beginning of queue
      if (repMode === 'queue' || repMode === 'all') {
        const lastIdx = currentQ.length - 1;
        setQueueIndex(lastIdx);
        setCurrentTrack(currentQ[lastIdx]);
        setIsPlaying(true);
      } else {
        // Replay track 0
        setCurrentTrack(currentQ[0]);
        setIsPlaying(true);
      }
    }
  }, []);

  // Toggle shuffle mode without mutating the original queue array
  const toggleShuffle = useCallback(() => {
    setIsShuffled((prevShuffled) => {
      const nextShuffled = !prevShuffled;
      const { queue: curQ, queueIndex: curIdx, originalQueue: origQ, currentTrack: curTrack } = stateRef.current;

      if (nextShuffled) {
        if (curQ.length <= 1) return nextShuffled;
        const current = curQ[curIdx] || curTrack;
        const remaining = curQ.filter((_, idx) => idx !== curIdx);
        const shuffledQueue = current ? [current, ...shuffleArray(remaining)] : shuffleArray(remaining);
        setQueue(shuffledQueue);
        setQueueIndex(0);
      } else {
        // Restore originalQueue without mutation
        const restored = [...origQ];
        setQueue(restored);
        if (curTrack) {
          const foundIdx = restored.findIndex(
            (t) => (t.videoId || t.id) === (curTrack.videoId || curTrack.id)
          );
          setQueueIndex(foundIdx >= 0 ? foundIdx : 0);
        }
      }
      return nextShuffled;
    });
  }, []);

  // Cycle repeat modes: 'off' -> 'queue' -> 'track' -> 'off'
  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'queue';
      if (prev === 'queue' || prev === 'all') return 'track';
      return 'off';
    });
  }, []);

  // Add track to end of queue
  const addToQueue = useCallback((track) => {
    if (!track) return;
    const formattedTrack = {
      ...track,
      id: track.videoId || track.id,
      videoId: track.videoId || track.id,
    };

    setQueue((prev) => {
      if (prev.length === 0 && !stateRef.current.currentTrack) {
        setCurrentTrack(formattedTrack);
        setIsPlaying(true);
        setQueueIndex(0);
        setOriginalQueue([formattedTrack]);
        return [formattedTrack];
      }
      return [...prev, formattedTrack];
    });

    setOriginalQueue((prev) => [...prev, formattedTrack]);
  }, []);

  // Insert track immediately after the currently playing track
  const playNext = useCallback(
    (track) => {
      if (!track) return;
      const formattedTrack = {
        ...track,
        id: track.videoId || track.id,
        videoId: track.videoId || track.id,
      };

      if (!stateRef.current.currentTrack) {
        playTrack(formattedTrack);
        return;
      }

      setQueue((prev) => {
        const nextIdx = stateRef.current.queueIndex + 1;
        const updated = [...prev];
        updated.splice(nextIdx, 0, formattedTrack);
        return updated;
      });

      setOriginalQueue((prev) => {
        const nextIdx = stateRef.current.queueIndex + 1;
        const updated = [...prev];
        updated.splice(nextIdx, 0, formattedTrack);
        return updated;
      });
    },
    [playTrack]
  );

  // Remove a track from queue by its index
  const removeFromQueue = useCallback((indexToRemove) => {
    setQueue((prevQueue) => {
      if (indexToRemove < 0 || indexToRemove >= prevQueue.length) return prevQueue;
      const removedItem = prevQueue[indexToRemove];
      const newQueue = prevQueue.filter((_, idx) => idx !== indexToRemove);

      setOriginalQueue((prevOrig) =>
        prevOrig.filter((t) => (t.videoId || t.id) !== (removedItem.videoId || removedItem.id))
      );

      setQueueIndex((prevIndex) => {
        if (indexToRemove < prevIndex) {
          return prevIndex - 1;
        } else if (indexToRemove === prevIndex) {
          if (newQueue.length === 0) {
            setCurrentTrack(null);
            setIsPlaying(false);
            return 0;
          }
          const nextIdx = Math.min(prevIndex, newQueue.length - 1);
          setCurrentTrack(newQueue[nextIdx]);
          return nextIdx;
        }
        return prevIndex;
      });

      return newQueue;
    });
  }, []);

  // Reorder queue (drag and drop / move)
  const reorderQueue = useCallback((startIndex, endIndex) => {
    if (startIndex === endIndex) return;
    setQueue((prevQueue) => {
      if (
        startIndex < 0 ||
        startIndex >= prevQueue.length ||
        endIndex < 0 ||
        endIndex >= prevQueue.length
      ) {
        return prevQueue;
      }
      const result = Array.from(prevQueue);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      setQueueIndex((prevIndex) => {
        if (prevIndex === startIndex) return endIndex;
        if (startIndex < prevIndex && endIndex >= prevIndex) return prevIndex - 1;
        if (startIndex > prevIndex && endIndex <= prevIndex) return prevIndex + 1;
        return prevIndex;
      });

      return result;
    });
  }, []);

  // Clear upcoming tracks in queue
  const clearQueue = useCallback(() => {
    const cur = stateRef.current.currentTrack;
    if (cur) {
      setQueue([cur]);
      setOriginalQueue([cur]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setOriginalQueue([]);
      setQueueIndex(0);
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Aliases for compatibility
  const shuffle = isShuffled;
  const setShuffle = useCallback((val) => {
    setIsShuffled((prev) => {
      const nextVal = typeof val === 'function' ? val(prev) : Boolean(val);
      if (nextVal !== prev) {
        toggleShuffle();
      }
      return prev;
    });
  }, [toggleShuffle]);

  const repeat = repeatMode === 'track' ? 'one' : repeatMode === 'queue' ? 'all' : 'off';
  const setRepeat = useCallback((val) => {
    if (val === 'one' || val === 'track') setRepeatMode('track');
    else if (val === 'all' || val === 'queue') setRepeatMode('queue');
    else setRepeatMode('off');
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        originalQueue,
        queueIndex,
        isShuffled,
        shuffle,
        toggleShuffle,
        setShuffle,
        repeatMode,
        repeat,
        cycleRepeat,
        setRepeatMode,
        setRepeat,
        isLoadingRelated,
        playTrack,
        playPlaylist,
        nextTrack,
        prevTrack,
        togglePlay,
        addToQueue,
        playNext,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        fetchAndAppendRelated,
        setIsPlaying,
        setCurrentTrack,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within a PlayerProvider');
  }
  return context;
}
