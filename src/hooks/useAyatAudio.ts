import { useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

// ─── URL builder — identique web app ─────────────────────────────────────────
// https://cdn.islamic.network/quran/audio/128/ar.alafasy/{globalNum}.mp3
// globalNum = sum of verses in all preceding surahs + ayah id (1-based)

export function buildAudioUrl(globalNum: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalNum}.mp3`;
}

// ─── Audio state ──────────────────────────────────────────────────────────────

export type AyatAudioStatus = 'idle' | 'loading' | 'playing' | 'error';

export type AyatAudioHook = {
  status: AyatAudioStatus;
  toggle: () => void;
};

// ─── One-time audio mode setup ────────────────────────────────────────────────
// Called once at module level to configure iOS silent mode
let audioModeSet = false;
function ensureAudioMode() {
  if (audioModeSet) return;
  audioModeSet = true;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Uses a single AudioPlayer instance with replace() on globalNum change.
// useAudioPlayer manages lifecycle + disposal automatically on unmount.

export function useAyatAudio(
  globalNum: number,
  onEnded?: () => void,
): AyatAudioHook {
  // Create a single player instance for the lifetime of this component.
  // Pass null initially — we call replace() explicitly on first play.
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  // Track the last globalNum loaded into the player
  const loadedGlobalNumRef = useRef<number | null>(null);

  // Track whether onEnded has already fired for the current play session
  const endedFiredRef = useRef(false);

  // ── Stop + reset when globalNum changes — identique web app useEffect[globalNum]
  useEffect(() => {
    if (loadedGlobalNumRef.current !== null && loadedGlobalNumRef.current !== globalNum) {
      player.pause();
      loadedGlobalNumRef.current = null;
      endedFiredRef.current = false;
    }
  }, [globalNum, player]);

  // ── Detect natural end of playback — identique web app a.onended → onListen()
  useEffect(() => {
    if (status.didJustFinish && !endedFiredRef.current) {
      endedFiredRef.current = true;
      onEnded?.();
    }
  }, [status.didJustFinish, onEnded]);

  const toggle = useCallback(() => {
    ensureAudioMode();

    // ── Pause if playing — identique web app (if playing → pause)
    if (status.playing) {
      player.pause();
      return;
    }

    // ── Load source if not yet loaded for this globalNum
    if (loadedGlobalNumRef.current !== globalNum) {
      endedFiredRef.current = false;
      player.replace(buildAudioUrl(globalNum));
      loadedGlobalNumRef.current = globalNum;
    }

    player.play();
  }, [player, status.playing, globalNum]);

  // ── Map expo-audio status to our simplified AyatAudioStatus
  let derived: AyatAudioStatus = 'idle';
  if (status.playing)            derived = 'playing';
  else if (status.isBuffering)   derived = 'loading';

  return { status: derived, toggle };
}
