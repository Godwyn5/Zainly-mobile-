import { useEffect, useRef, useCallback, useState } from 'react';
import { Audio } from 'expo-av';

// ─── URL builder ──────────────────────────────────────────────────────────────
export function buildAudioUrl(globalNum: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNum}.mp3`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type AyatAudioStatus = 'idle' | 'loading' | 'playing' | 'error';
export type AyatAudioHook = { status: AyatAudioStatus; toggle: () => void };

// ─── One-time audio mode setup ────────────────────────────────────────────────
let audioModeSet = false;
async function ensureAudioMode() {
  if (audioModeSet) return;
  audioModeSet = true;
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAyatAudio(globalNum: number, onEnded?: () => void): AyatAudioHook {
  const [status, setStatus] = useState<AyatAudioStatus>('idle');
  const soundRef  = useRef<Audio.Sound | null>(null);
  const busyRef   = useRef(false); // prevents double-tap during load

  // ── Cleanup on unmount or globalNum change
  const unload = useCallback(async () => {
    const snd = soundRef.current;
    if (!snd) return;
    soundRef.current = null;
    try { await snd.unloadAsync(); } catch {}
  }, []);

  useEffect(() => {
    return () => { unload(); };
  }, [globalNum, unload]);

  const toggle = useCallback(async () => {
    // ── If playing → stop and unload (allows replay on next tap)
    if (status === 'playing') {
      console.log('[audio] stop →', globalNum);
      setStatus('idle');
      await unload();
      return;
    }

    // ── Prevent double-tap during load
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus('loading');

    const url = buildAudioUrl(globalNum);
    console.log('[audio] load →', url);

    try {
      await ensureAudioMode();
      await unload(); // unload any previous sound first

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (playbackStatus) => {
          if (!playbackStatus.isLoaded) return;
          if (playbackStatus.isPlaying) {
            setStatus('playing');
            busyRef.current = false;
          }
          if (playbackStatus.didJustFinish) {
            console.log('[audio] finished →', globalNum);
            setStatus('idle');
            soundRef.current = null;
            sound.unloadAsync().catch(() => {});
            onEnded?.();
          }
        },
      );

      soundRef.current = sound;
      console.log('[audio] playing →', globalNum);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log('[audio] ERROR →', globalNum, msg);
      setStatus('idle');
      busyRef.current = false;
      await unload();
    }
  }, [status, globalNum, onEnded, unload]);

  return { status, toggle };
}
