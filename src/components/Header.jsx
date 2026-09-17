import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();

  return (
    <header className="h-16 bg-[#101010] border-b border-[#222222] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-gray-300 hover:text-white transition"
          title="Go Back"
        >
          ‹
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-gray-300 hover:text-white transition"
          title="Go Forward"
        >
          ›
        </button>
      </div>

      {/* Center/App Title Badge */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm font-semibold tracking-wide text-gray-300 uppercase">
          Proj Synth
        </span>
      </div>

      {/* Auth Controls */}
      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div className="flex items-center gap-2 bg-[#1f1f1f] border border-[#2a2a2a] pl-2 pr-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-[#1DB954] text-black font-bold flex items-center justify-center text-xs">
                {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-medium text-white max-w-[120px] truncate">
                {user.username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-[#b3b3b3] hover:text-white hover:bg-[#242424] px-3 py-1.5 rounded-full border border-transparent hover:border-[#333] transition-all"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={openRegisterModal}
              className="text-xs font-semibold text-[#b3b3b3] hover:text-white transition-colors px-2 py-1.5"
            >
              Sign up
            </button>
            <button
              onClick={openLoginModal}
              className="bg-white hover:bg-gray-200 text-black text-xs font-bold px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-all font-heading shadow"
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </header>
  );
}