import React from "react";
import { ChevronRight } from "lucide-react";
import ContentCard from "@/components/ContentCard";
import QuickAccessCard from "@/components/QuickAccessCard";
import VideoTrackCard from "@/components/VideoTrackCard";

const quickAccess = [
  { image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop", title: "Synthwave Nights" },
  { image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=120&h=120&fit=crop", title: "Midnight Drive" },
  { image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop", title: "Late Night Vibes" },
  { image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=120&h=120&fit=crop", title: "Cloud Nine" },
  { image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop", title: "Deep Focus" },
  { image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=120&h=120&fit=crop", title: "Arctic Dawn" },
];

const featuredMixes = [
  { image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", title: "Synthwave Nights", subtitle: "Retro-futuristic beats" },
  { image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop", title: "Deep Focus", subtitle: "Ambient & minimal" },
  { image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop", title: "Late Night Vibes", subtitle: "Chill & dreamy" },
  { image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop", title: "Electric Pulse", subtitle: "High-energy electronic" },
  { image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop", title: "Bass Culture", subtitle: "Heavy bass drops" },
  { image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop", title: "Festival Season", subtitle: "Main stage anthems" },
  { image: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop", title: "Solar Flare", subtitle: "Cosmic energy" },
  { image: "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300&h=300&fit=crop", title: "Velvet Hour", subtitle: "Lounge set" },
];

const videoTracks = [
  { video: "https://cdn.coverr.co/videos/coverr-dj-mixing-music-2799/1080p.mp4", title: "Midnight Drive — Live Set", channel: "Neon Waves" },
  { video: "https://cdn.coverr.co/videos/coverr-a-studio-session-2564/1080p.mp4", title: "Cloud Nine Sessions", channel: "Dream Collective" },
  { video: "https://cdn.coverr.co/videos/coverr-playing-the-synth-2584/1080p.mp4", title: "Solar Flare Studio", channel: "Cosmos" },
  { video: "https://cdn.coverr.co/videos/coverr-a-guy-playing-guitar-1573/1080p.mp4", title: "Urban Echo Acoustic", channel: "City Lights" },
  { video: "https://cdn.coverr.co/videos/coverr-dj-at-work-2585/1080p.mp4", title: "Bass Culture Mix", channel: "Heavy Rotation" },
];

const recommended = [
  { image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop", title: "Lo-fi Beats to Study", subtitle: "Chillhop · 2.4M views" },
  { image: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop", title: "Synthwave Radio", subtitle: "Nightdrive · 1.1M views" },
  { image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop", title: "Festival Live 2026", subtitle: "Main Stage · 890K views" },
  { image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop", title: "Electric Pulse Mix", subtitle: "EDM Hub · 3.2M views" },
  { image: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=300&h=300&fit=crop", title: "Chill Vibes Radio", subtitle: "Relax FM · 1.7M views" },
  { image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop", title: "Arctic Ambient", subtitle: "Polar Sound · 540K views" },
];

function SectionHeader({ title }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl md:text-2xl font-heading font-bold text-white hover:underline cursor-pointer">
        {title}
      </h2>
      <button className="flex items-center gap-1 text-[#b3b3b3] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
        Show all <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Home() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 md:space-y-10 pt-2">
      {/* Greeting + Quick Access */}
      <section>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white mb-5">
          {greeting}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {quickAccess.map((item) => (
            <QuickAccessCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* Featured Mixes */}
      <section>
        <SectionHeader title="Featured mixes" />
        <div className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-thin pb-4 -mx-1 px-1">
          {featuredMixes.map((item) => (
            <div key={item.title} className="w-40 md:w-48 shrink-0">
              <ContentCard {...item} />
            </div>
          ))}
        </div>
      </section>

      {/* Recently Played (video tracks) */}
      <section>
        <SectionHeader title="Recently played" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {videoTracks.map((item) => (
            <VideoTrackCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* Recommended Videos as Audio */}
      <section>
        <SectionHeader title="Recommended videos as audio" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-5">
          {recommended.map((item) => (
            <ContentCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}