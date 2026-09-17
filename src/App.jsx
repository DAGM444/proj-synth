import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/context/AuthContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { PlayerProvider } from "@/context/PlayerContext";
import ScrollToTop from "./components/ScrollToTop";
import AppShell from "@/components/AppShell";
import AuthModal from "@/components/AuthModal";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Playlist from "@/pages/Playlist";
import { useState } from "react";

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);

  const handlePlayTrack = (track) => {
    setCurrentTrack(track);
  };

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <PlayerProvider>
          <PlaylistProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route element={<AppShell currentTrack={currentTrack} />}>
                  <Route path="/" element={<Home onPlayTrack={handlePlayTrack} />} />
                  <Route path="/search" element={<Search onPlayTrack={handlePlayTrack} />} />
                  <Route path="/playlist" element={<Playlist onPlayTrack={handlePlayTrack} />} />
                  <Route path="/playlist/:id" element={<Playlist onPlayTrack={handlePlayTrack} />} />
                  <Route path="/library" element={<Playlist onPlayTrack={handlePlayTrack} />} />
                </Route>
                <Route path="*" element={<PageNotFound />} />
              </Routes>
              <AuthModal />
            </Router>
            <Toaster richColors theme="dark" position="bottom-right" />
          </PlaylistProvider>
        </PlayerProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;