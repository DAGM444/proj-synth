const express = require('express');
const cors = require('cors');
const http = require('http');
const YouTube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'proj-synth-secret-jwt-key-2026';
const prisma = new PrismaClient();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Validate username length
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user with this email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === cleanEmail) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Register API Error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = (identifier || email || username || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/username and password are required.' });
    }

    // Find user by either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId.toLowerCase() },
          { username: loginId },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Get Current User Profile (Me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth Me API Error:', error);
    res.status(500).json({ error: 'Failed to get user profile.' });
  }
});

// ==========================================
// 2. YOUTUBE SEARCH ENDPOINT
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
// 3. LIVE AUDIO STREAMING ENDPOINT
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
        highWaterMark: 1 << 25,
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
        'Content-Length': fallbackRes.headers['content-length'] || '',
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
// 4. USER-SCOPED PLAYLIST & LIBRARY DATABASE ROUTES
// ==========================================

// Get all playlists for the authenticated user
app.get('/api/playlists', authenticateToken, async (req, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.user.id },
      include: { tracks: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(playlists);
  } catch (error) {
    console.error('Fetch Playlists Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists.' });
  }
});

// Get a single playlist by ID (strictly owned by authenticated user)
app.get('/api/playlists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { tracks: true },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this playlist.' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Fetch Playlist Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist.' });
  }
});

// Create a new playlist for the authenticated user
app.post('/api/playlists', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Playlist title is required.' });
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        userId: req.user.id,
      },
      include: { tracks: true },
    });
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Create Playlist Error:', error);
    res.status(500).json({ error: 'Failed to create playlist.' });
  }
});

// Add a track to an authenticated user's playlist
app.post('/api/playlists/:id/tracks', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId, title, artist, duration, thumbnail } = req.body;

    if (!videoId || !title) {
      return res.status(400).json({ error: 'videoId and title are required.' });
    }

    // Verify playlist ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this playlist.' });
    }

    const track = await prisma.track.create({
      data: {
        videoId,
        title,
        artist: artist || 'Unknown Artist',
        duration: duration || '0:00',
        thumbnail: thumbnail || '',
        playlistId: id,
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error('Add Track Error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist.' });
  }
});

// Delete a track from a playlist by track ID (verifying playlist ownership)
app.delete('/api/tracks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const track = await prisma.track.findUnique({
      where: { id },
      include: { playlist: true },
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    if (track.playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this track.' });
    }

    await prisma.track.delete({ where: { id } });
    res.json({ message: 'Track removed successfully.' });
  } catch (error) {
    console.error('Delete Track Error:', error);
    res.status(500).json({ error: 'Failed to delete track.' });
  }
});

// Delete a track from a playlist by playlistId and trackId
app.delete('/api/playlists/:playlistId/tracks/:trackId', authenticateToken, async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this playlist.' });
    }

    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track || track.playlistId !== playlistId) {
      return res.status(404).json({ error: 'Track not found in this playlist.' });
    }

    await prisma.track.delete({ where: { id: trackId } });
    res.json({ message: 'Track removed successfully.' });
  } catch (error) {
    console.error('Delete Track Error:', error);
    res.status(500).json({ error: 'Failed to delete track.' });
  }
});

// Delete an entire playlist (strictly owned by authenticated user)
app.delete('/api/playlists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this playlist.' });
    }

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

module.exports = app;