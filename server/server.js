const express = require('express');
const ytdl = require('@distube/ytdl-core');
const YouTube = require('youtube-sr').default;
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Search YouTube Videos Endpoint
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query required' });

    const results = await YouTube.search(query, { limit: 10, type: 'video' });
    
    // Map response to match your frontend props
    const formattedResults = results.map(video => ({
      id: video.id,
      title: video.title,
      artist: video.channel ? video.channel.name : 'Unknown Artist',
      duration: video.durationFormatted,
      thumbnail: video.thumbnail ? video.thumbnail.url : ''
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search YouTube' });
  }
});

// 2. Stream Audio Endpoint
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    res.setHeader('Content-Type', 'audio/mpeg');
    
    // Stream live audio directly to the browser
    ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    }).pipe(res);

  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));