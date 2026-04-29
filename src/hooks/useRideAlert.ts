import { useEffect, useRef } from 'react';
import { useRideStore } from '../store/useRideStore';

// Generates a short alert tone using the Web Audio API — no asset file needed
function playAlertTone() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext not available
  }
}

export function useRideAlert() {
  const pendingRides = useRideStore((s) => s.pendingRides);
  const prevCountRef = useRef(pendingRides.length);

  useEffect(() => {
    if (pendingRides.length > prevCountRef.current) {
      playAlertTone();
    }
    prevCountRef.current = pendingRides.length;
  }, [pendingRides.length]);
}
