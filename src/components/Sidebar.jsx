import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Library, Plus, Music2, Music, Trash2, LogIn } from "lucide-react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Library, label: "Your Library", path: "/playlist" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    playlists,
    selectedPlaylistId,
    setSelectedPlaylistId,
    openCreateModal,
    deletePlaylist,
  } = usePlaylist();
  const { isAuthenticated, openLoginModal } = useAuth();

  const handleSelectPlaylist = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    if (location.pathname !== "/playlist" && location.pathname !== "/library") {
      navigate("/playlist");
    }
  };

  const handleDelete = async (e, playlistId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      await deletePlaylist(playlistId);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-black h-full shrink-0 border-r border-[#181818]">
      {/* Logo */}
      <Link to="/" className="px-6 pt-6 pb-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#1DB954] flex items-center justify-center shadow-md shadow-[#1DB954]/20">
          <Music2 className="w-5 h-5 text-black" />
        </div>
        <span className="text-white font-heading font-bold text-lg tracking-tight">
          Proj Synth
        </span>
      </Link>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active =
            location.pathname === path ||
            (path === "/playlist" && location.pathname === "/library");
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                active
                  ? "text-white bg-[#1a1a1a]"
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 h-px bg-[#282828]" />

      {/* Create Playlist Button */}
      <div className="px-3">
        <button
          onClick={openCreateModal}
          className="group flex items-center gap-3.5 px-3 py-2 rounded-md text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a] transition-all text-sm font-medium w-full"
        >
          <div className="w-6 h-6 rounded-md bg-[#282828] group-hover:bg-[#1DB954] flex items-center justify-center shrink-0 transition-colors">
            <Plus className="w-4 h-4 text-white group-hover:text-black transition-colors" />
          </div>
          Create Playlist
        </button>
      </div>

      {/* Playlists List Header */}
      <div className="px-6 pt-4 pb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#727272]">
        <span>Playlists</span>
        <span>{isAuthenticated ? playlists.length : 0}</span>
      </div>

      {/* Scrollable Playlists List / Auth prompt */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-thin py-1">
        {!isAuthenticated ? (
          <div className="p-4 mx-1 my-2 rounded-xl bg-[#181818]/60 border border-[#282828]/50 text-center">
            <p className="text-xs font-semibold text-white mb-1 font-heading">
              Create your first playlist
            </p>
            <p className="text-[11px] text-[#b3b3b3] mb-3">
              It&apos;s easy, we&apos;ll help you.
            </p>
            <button
              onClick={openLoginModal}
              className="inline-flex items-center gap-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </button>
          </div>
        ) : playlists.length === 0 ? (
          <div className="p-4 mx-1 my-2 rounded-xl bg-[#181818]/40 border border-[#282828]/40 text-center">
            <p className="text-xs text-[#b3b3b3] mb-2">No playlists yet</p>
            <button
              onClick={openCreateModal}
              className="text-xs font-semibold text-[#1DB954] hover:underline"
            >
              + Create one now
            </button>
          </div>
        ) : (
          playlists.map((pl) => {
            const isSelected =
              selectedPlaylistId === pl.id &&
              (location.pathname === "/playlist" || location.pathname === "/library");

            return (
              <div
                key={pl.id}
                onClick={() => handleSelectPlaylist(pl.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-xs transition-colors ${
                  isSelected
                    ? "bg-[#1f1f1f] text-[#1DB954] font-medium"
                    : "text-[#b3b3b3] hover:text-white hover:bg-[#181818]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <Music className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                  <span className="truncate">{pl.title}</span>
                </div>

                <button
                  onClick={(e) => handleDelete(e, pl.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#555] hover:text-red-400 rounded transition-all shrink-0"
                  title="Delete playlist"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer copyright */}
      <div className="px-6 py-4 border-t border-[#181818]">
        <p className="text-[10px] text-[#535353] leading-relaxed">
          © 2026 Proj Synth
        </p>
      </div>
    </aside>
  );
}