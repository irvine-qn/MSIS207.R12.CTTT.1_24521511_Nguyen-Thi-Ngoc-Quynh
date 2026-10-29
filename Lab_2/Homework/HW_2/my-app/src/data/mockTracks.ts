import type { TrackMetadata } from "@/types/audio";

/**
 * Sample tracks from SoundHelix (royalty-free test audio).
 * URLs go through the `/audio` rewrite in next.config.ts.
 */
export const mockTracks: TrackMetadata[] = [
  {
    id: "track-1",
    title: "Neon Drift",
    artist: "SoundHelix",
    url: "/audio/SoundHelix-Song-1.mp3",
    duration: 372,
    coverUrl: "https://picsum.photos/seed/neon-drift/300",
  },
  {
    id: "track-2",
    title: "Midnight Circuit",
    artist: "SoundHelix",
    url: "/audio/SoundHelix-Song-2.mp3",
    duration: 426,
    coverUrl: "https://picsum.photos/seed/midnight-circuit/300",
  },
  {
    id: "track-3",
    title: "Glass Horizon",
    artist: "SoundHelix",
    url: "/audio/SoundHelix-Song-3.mp3",
    duration: 344,
    coverUrl: "https://picsum.photos/seed/glass-horizon/300",
  },
  {
    id: "track-4",
    title: "Static Bloom",
    artist: "SoundHelix",
    url: "/audio/SoundHelix-Song-4.mp3",
    duration: 302,
    coverUrl: "https://picsum.photos/seed/static-bloom/300",
  },
  {
    id: "track-5",
    title: "Low Orbit",
    artist: "SoundHelix",
    url: "/audio/SoundHelix-Song-5.mp3",
    duration: 354,
    coverUrl: "https://picsum.photos/seed/low-orbit/300",
  },
  {
    id: "track-6",
    title: "Copper Rain",
    artist: "SoundHelix",
    url: "/audio/SoundHelix-Song-6.mp3",
    duration: 279,
    coverUrl: "https://picsum.photos/seed/copper-rain/300",
  },
];
