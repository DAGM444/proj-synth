const express = require('express');
const cors = require('cors');
const YouTube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// 1. YouTube Search Endpoint
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID parameter is required.' });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Get video details first to ensure format availability & headers
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

    if (!format) {
      return res.status(404).json({ error: 'No audio format found for this video.' });
    }

    // Set headers required by browser audio players
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    if (format.contentLength) {
      res.setHeader('Content-Length', format.contentLength);
    }

    // Pipe stream with client error handling
    const audioStream = ytdl.downloadFromInfo(info, {
      format: format,
      highWaterMark: 1 << 25 // 32MB buffer
    });

    audioStream.on('error', (err) => {
      console.error('ytdl-core stream piping error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Audio stream failed midway.' });
      }
    });

    audioStream.pipe(res);
  } catch (error) {
    console.error('Streaming API Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to initiate stream. Video may be age-restricted or unavailable.' });
    }
  }
});
// 2. Live Audio Streaming Endpoint
app.get('/api/stream/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID parameter is required.' });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Set streaming headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');

    // Pipe YouTube audio stream directly to client response
    const audioStream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25 // 32MB buffer to prevent playback buffering glitches
    });

    audioStream.on('error', (err) => {
      console.error('ytdl-core stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('Streaming error occurred.');
      }
    });

    audioStream.pipe(res);
  } catch (error) {
    console.error('Streaming API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to initiate stream.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});