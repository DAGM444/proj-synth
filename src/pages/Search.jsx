import React, { useState } from "react";
import { Search as SearchIcon, Play, Link2, ArrowRight, Check } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import SongRow from "@/components/SongRow";

const filters = ["All", "Songs", "Playlists", "Channels"];

const categories = [
  "Pop", "Hip-Hop", "Focus", "Chill", "Podcasts",
  "Rock", "Electronic", "Indie", "Jazz", "Classical",
  "Workout", "Sleep",
];

const results = [
  { title: "Midnight Drive", artist: "Neon Waves", duration: "3:45", cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=120&h=120&fit=crop" },
  { title: "Solar Flare", artist: "Cosmos", duration: "3:12", cover: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=120&h=120&fit=crop" },
  { title: "Urban Echo", artist: "City Lights", duration: "4:05", cover: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=120&h=120&fit=crop" },
  { title: "Velvet Hour", artist: "Lounge Set", duration: "3:40", cover: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=120&h=120&fit=crop" },
  { title: "Cloud Nine", artist: "Dream Collective", duration: "2:58", cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=120&h=120&fit=crop" },
  { title: "Bass Culture", artist: "Heavy Rotation", duration: "5:21", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [ytLink, setYtLink] = useState("");
  const [imported, setImported] = useState(false);

  const hasQuery = query.trim().length > 0;

  const handleImport = (e) => {
    e.preventDefault();
    if (ytLink.trim()) setImported(true);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-white text-black text-base md:text-lg font-medium rounded-full pl-12 pr-4 py-3.5 placeholder:text-black/50 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 -mt-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f
                ? "bg-white text-black"
                : "bg-[#ffffff1a] text-white hover:bg-[#ffffff2a]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* YouTube import bar */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] rounded-xl p-5 border border-[#282828]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-heading font-bold text-sm">
              Import from YouTube
            </h3>
            <p className="text-[#b3b3b3] text-xs">
              Paste a video or playlist URL to play instantly
            </p>
          </div>
        </div>
        <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-2">
          <input
            value={ytLink}
            onChange={(e) => {
              setYtLink(e.target.value);
              setImported(false);
            }}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-[#000000] text-white text-sm rounded-md px-4 py-2.5 placeholder:text-[#727272] focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black text-sm font-bold rounded-md px-5 py-2.5 transition-colors"
          >
            {imported ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Import
              </>
            )}
          </button>
        </form>
      </div>

      {/* Browse categories OR search results */}
      {!hasQuery ? (
        <section>
          <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
            Browse all
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {categories.map((label, i) => (
              <CategoryCard key={label} label={label} index={i} />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          {/* Top result */}
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
              Top result
            </h2>
            <div className="group relative bg-[#181818] hover:bg-[#282828] rounded-xl p-5 w-full max-w-sm transition-colors cursor-pointer">
              <img
                src={results[0].cover}
                alt={results[0].title}
                className="w-20 h-20 rounded-lg shadow-2xl mb-4 object-cover"
              />
              <p className="text-white text-2xl font-heading font-bold truncate">
                {results[0].title}
              </p>
              <p className="text-[#b3b3b3] text-sm mt-1">
                Song · {results[0].artist}
              </p>
              <button className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105">
                <Play className="w-5 h-5 text-black ml-0.5" />
              </button>
            </div>
          </div>

          {/* Songs list */}
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
              Songs
            </h2>
            <div className="space-y-0.5">
              {results.map((r, i) => (
                <SongRow key={r.title} index={i + 1} {...r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}