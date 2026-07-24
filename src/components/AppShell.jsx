import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AudioPlayer from "@/components/AudioPlayer";
import MobileNav from "@/components/MobileNav";

export default function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-[#121212] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TopBar />
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-36 md:pb-28 scrollbar-thin">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <AudioPlayer />
    </div>
  );
}