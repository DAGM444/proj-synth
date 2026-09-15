import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Play a single track, optionally setting the playlist/queue
  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return;
    const formattedTrack = {
      ...track,
      id: track.videoId || track.id,
      videoId: track.videoId || track.id,
    };
    setCurrentTrack(formattedTrack);
    setIsPlaying(true);

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const foundIdx = newQueue.findIndex((t) => (t.videoId || t.id) === formattedTrack.id);
      setQueueIndex(foundIdx >= 0 ? foundIdx : 0);
    }
  }, []);

  // Play all tracks in a playlist from the beginning
  const playPlaylist = useCallback((playlist) => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
    const tracks = playlist.tracks.map((t) => ({
      ...t,
      id: t.videoId || t.id,
      videoId: t.videoId || t.id,
    }));
    setQueue(tracks);
    setQueueIndex(0);
    setCurrentTrack(tracks[0]);
    setIsPlaying(true);
  }, []);

  // Advance to next track in the queue
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
    setIsPlaying(true);
  }, [queue, queueIndex]);

  // Go to previous track in the queue
  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
    setIsPlaying(true);
  }, [queue, queueIndex]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        queueIndex,
        playTrack,
        playPlaylist,
        nextTrack,
        prevTrack,
        togglePlay,
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
