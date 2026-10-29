import { MEDIA_PATHS } from "@/config/audio";
import type { TrackMetadata } from "@/types/audio";

/**
 * Builds a track whose audio and cover live in /public, both named after `slug`:
 * public/audio/mock/<slug>.wav and public/images/covers/<slug>.svg
 */
function createTrack(slug: string, title: string, artist: string): TrackMetadata {
  return {
    id: slug,
    title,
    artist,
    url: `${MEDIA_PATHS.audioDir}/${slug}.${MEDIA_PATHS.audioExt}`,
    coverUrl: `${MEDIA_PATHS.coverDir}/${slug}.${MEDIA_PATHS.coverExt}`,
  };
}

/** Synthesized, royalty-free demo tracks (30 s each). */
export const mockTracks: TrackMetadata[] = [
  createTrack("neon-pulse", "Neon Pulse", "Synth Collective"),
  createTrack("midnight-drive", "Midnight Drive", "Night Circuit"),
  createTrack("crystal-echoes", "Crystal Echoes", "Aurora Waves"),
  createTrack("solar-flare", "Solar Flare", "Synth Collective"),
  createTrack("deep-current", "Deep Current", "Low Tide"),
  createTrack("city-lights", "City Lights", "Night Circuit"),
];
