"use client";

import { SPOTIFY_PLAYLIST_EMBED_SRC } from "@/lib/spotifyEmbed";

export default function SpotifyPlaylistWindow() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#121212] p-3">
      <iframe
        title="Spotify playlist"
        data-testid="embed-iframe"
        src={SPOTIFY_PLAYLIST_EMBED_SRC}
        className="w-full flex-1 rounded-[12px] border-0"
        style={{ borderRadius: 12, height: 352, minHeight: 352 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
