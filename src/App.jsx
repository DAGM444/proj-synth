import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import AppShell from "@/components/AppShell";
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
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<AppShell currentTrack={currentTrack} />}>
              <Route path="/" element={<Home onPlayTrack={handlePlayTrack} />} />
              <Route path="/search" element={<Search onPlayTrack={handlePlayTrack} />} />
              <Route path="/playlist" element={<Playlist onPlayTrack={handlePlayTrack} />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;