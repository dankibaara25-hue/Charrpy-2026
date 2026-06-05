// Shared alarm audio + alarm-loading hook. Used by every challenge screen
// (math / barcode / photo) so the ringtone keeps blaring while the user
// completes the dismissal task. On unmount we stop + release the player so
// audio doesn't leak when the user beats the challenge.

import { useEffect, useMemo, useRef, useState } from "react";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";

import { Alarm, defaultAlarm, getAlarm } from "@/src/lib/alarms";
import { findRingtone } from "@/src/onboarding/ringtones";

export interface UseAlarmReturn {
  alarm: Alarm | null;
  stop: () => void;
}

export function useAlarmAudio(id?: string): UseAlarmReturn {
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const stoppedRef = useRef(false);

  const stop = useMemo(
    () => () => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      try {
        playerRef.current?.pause();
        playerRef.current?.remove();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    },
    [],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const a = id ? await getAlarm(id) : undefined;
      const target = a ?? defaultAlarm();
      if (!alive) return;
      setAlarm(target);

      const ring = findRingtone(target.ringtoneId);
      if (!ring) return;
      try {
        const p = createAudioPlayer(ring.source);
        p.loop = true;
        p.volume = target.crescendo ? 0.15 : target.volume;
        p.play();
        playerRef.current = p;
      } catch (e) {
        console.warn("[alarm-audio] start failed", e);
      }
    })();
    return () => {
      alive = false;
      stop();
    };
  }, [id, stop]);

  // Crescendo ramp
  useEffect(() => {
    if (!alarm?.crescendo) return;
    const start = Date.now();
    const peak = Math.max(0.2, Math.min(1, alarm.volume));
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const elapsed = (Date.now() - start) / 1000;
      const next = Math.min(peak, 0.15 + elapsed * 0.05);
      try {
        p.volume = next;
      } catch {
        /* noop */
      }
      if (next >= peak) clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  }, [alarm?.crescendo, alarm?.volume]);

  return { alarm, stop };
}
