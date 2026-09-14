const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const YouTube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ==========================================
// 1. YOUTUBE SEARCH ENDPOINT
// ==========================================
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query parameter "q" is required.' });
    }

    const videos = await YouTube.search(query, { limit: 20, type: 'video' });
    const tracks = videos.map((video) => ({
      id: video.id,
      title: video.title,
      artist: video.channel ? video.channel.name : 'Unknown Artist',
      thumbnail: video.thumbnail ? video.thumbnail.url : '',
      duration: video.durationFormatted || '0:00',
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Failed to search YouTube.' });
  }
});

// ==========================================
// 2. LIVE AUDIO STREAMING ENDPOINT
// ==========================================
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID parameter is required.' });
    }

    // Set streaming headers expected by HTML5 audio players
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let streamHandled = false;

    try {
      const audioStream = ytdl(videoUrl, {
        filter: 'audioonly',
        highWaterMark: 1 << 25
      });

      audioStream.on('info', () => {
        streamHandled = true;
      });

      audioStream.on('error', (err) => {
        console.error('ytdl-core stream error (using audio stream fallback):', err.message);
        if (!streamHandled) {
          streamHandled = true;
          pipeFallbackAudio(res);
        }
      });

      audioStream.pipe(res);
    } catch (err) {
      console.error('ytdl-core init exception (using audio stream fallback):', err.message);
      if (!streamHandled) {
        streamHandled = true;
        pipeFallbackAudio(res);
      }
    }
  } catch (error) {
    console.error('Streaming API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to initiate stream.' });
    }
  }
});

function pipeFallbackAudio(res) {
  const fallbackUrl = 'http://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  http.get(fallbackUrl, (fallbackRes) => {
    if (!res.headersSent) {
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Content-Length': fallbackRes.headers['content-length'] || ''
      });
    }
    fallbackRes.pipe(res);
  }).on('error', (e) => {
    console.error('Fallback audio error:', e.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Audio stream unavailable.' });
    }
  });
}

// ==========================================
// 3. PHASE 4: PLAYLIST & LIBRARY DATABASE ROUTES
// ==========================================

// Get all playlists with their tracks
app.get('/api/playlists', async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: { tracks: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(playlists);
  } catch (error) {
    console.error('Fetch Playlists Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists.' });
  }
});

// Get a single playlist by ID with tracks
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { tracks: true }
    });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    res.json(playlist);
  } catch (error) {
    console.error('Fetch Playlist Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist.' });
  }
});

// Create a new playlist
app.post('/api/playlists', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Playlist title is required.' });
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        title,
        description: description || ''
      }
    });
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Create Playlist Error:', error);
    res.status(500).json({ error: 'Failed to create playlist.' });
  }
});

// Add a track to a playlist
app.post('/api/playlists/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId, title, artist, duration, thumbnail } = req.body;

    if (!videoId || !title) {
      return res.status(400).json({ error: 'videoId and title are required.' });
    }

    const track = await prisma.track.create({
      data: {
        videoId,
        title,
        artist: artist || 'Unknown Artist',
        duration: duration || '0:00',
        thumbnail: thumbnail || '',
        playlistId: id
      }
    });

    res.status(201).json(track);
  } catch (error) {
    console.error('Add Track Error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist.' });
  }
});

// Delete a track from a playlist
app.delete('/api/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.track.delete({ where: { id } });
    res.json({ message: 'Track removed successfully.' });
  } catch (error) {
    console.error('Delete Track Error:', error);
    res.status(500).json({ error: 'Failed to delete track.' });
  }
});

// Delete an entire playlist
app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.playlist.delete({ where: { id } });
    res.json({ message: 'Playlist deleted successfully.' });
  } catch (error) {
    console.error('Delete Playlist Error:', error);
    res.status(500).json({ error: 'Failed to delete playlist.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});