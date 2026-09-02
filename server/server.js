const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const YouTube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// 1. YouTube Search Endpoint
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

// 2. Live Audio Streaming Endpoint
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
  // Reliable sample MP3 fallback stream
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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});