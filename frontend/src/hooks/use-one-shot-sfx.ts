// One-shot sound-effect hook. Plays a bundled mp3 once when the screen
// mounts (e.g. fanfare on the streak/XP reveal). Properly tears down on
// unmount so audio doesn't leak across navigations.

import { useEffect, useRef } from "react";
import {
  createAudioPlayer,
  type AudioPlayer,
  type AudioSource,
} from "expo-audio";

export function useOneShotSfx(source: AudioSource, volume = 0.9): void {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    let alive = true;
    try {
      const p = createAudioPlayer(source);
      if (!alive) {
        try {
          p.remove();
        } catch {
          /* noop */
        }
        return;
      }
      p.volume = volume;
      const r = p.play();
      if (r && typeof (r as Promise<unknown>).catch === "function") {
        (r as Promise<unknown>).catch(() => {});
      }
      playerRef.current = p;
    } catch (e) {
      console.warn("[sfx] start failed", e);
    }
    return () => {
      alive = false;
      const p = playerRef.current;
      playerRef.current = null;
      if (!p) return;
      try {
        p.pause();
      } catch {
        /* noop */
      }
      try {
        p.remove();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
