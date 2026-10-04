# proj-synth 
proj-synth is a full-stack, web-based music streaming and playlist management application built with React, Express, Prisma, and YouTube audio streaming capabilities.
It features real-time audio playback, dynamic queue controls, user authentication, user-owned playlists, and LRC-synchronized lyrics.

## Key Features

- **Audio Streaming & Extraction:** Low-latency YouTube audio streaming powered by `yt-dlp` and `ffmpeg` with backpressure-managed streams and in-memory URL caching.
- **Debounced Search:** Fast search for tracks, artists, and playlists with automatic input debouncing.
- **User Authentication:** Secure JWT-based authentication (`bcryptjs` password hashing) with user-scoped playlist management.
- **Dynamic Queue Engine:** Reorderable queue with shuffle, repeat modes (off, queue, track), continuous auto-play recommendations, and persistent volume controls.
- **Synced Lyrics Engine:** LRC format lyrics parsing with real-time active line highlighting, smooth auto-scrolling, and tap-to-seek track sync.
- **Spotify Dark Theme UI:** Sleek UI built with Tailwind CSS, Framer Motion animations, audio equalizer visualizers, and blurred dynamic album art backdrops.

##  Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, Framer Motion
- **State Management:** React Context API (`AuthContext`, `PlayerContext`, `PlaylistContext`)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (Express)
- **Database & ORM:** PostgreSQL / SQLite with Prisma ORM
- **Media Tools:** `yt-dlp`, `ffmpeg`
- **Authentication:** JSON Web Tokens (JWT) & `bcryptjs`

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose (Multi-stage builds)
- **Web Server / Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions & GitHub Container Registry (GHCR)

---
