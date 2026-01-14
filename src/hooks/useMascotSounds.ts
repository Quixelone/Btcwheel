import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for mascot sound effects using Web Audio API
 * Generates procedural sounds for different mascot interactions
 */
export function useMascotSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    // Initialize AudioContext on first user interaction (browser requirement)
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, []);

  const sounds = {
    // Mascot appears (ascending chirp)
    appear: () => {
      playSound(400, 0.1, 'sine', 0.2);
      setTimeout(() => playSound(600, 0.15, 'sine', 0.25), 80);
    },

    // Mascot clicked (friendly pop)
    click: () => {
      playSound(800, 0.08, 'sine', 0.3);
    },

    // Tip shown (gentle notification)
    tipShow: () => {
      playSound(600, 0.12, 'sine', 0.2);
      setTimeout(() => playSound(800, 0.12, 'sine', 0.2), 60);
    },

    // Tip dismissed (soft whoosh)
    tipDismiss: () => {
      playSound(500, 0.1, 'sine', 0.15);
    },

    // Excited mood (happy arpeggio)
    excited: () => {
      playSound(523, 0.1, 'sine', 0.25); // C
      setTimeout(() => playSound(659, 0.1, 'sine', 0.25), 80); // E
      setTimeout(() => playSound(784, 0.15, 'sine', 0.25), 160); // G
    },

    // Disappointed mood (sad descending)
    disappointed: () => {
      playSound(440, 0.15, 'sine', 0.2); // A
      setTimeout(() => playSound(349, 0.2, 'sine', 0.2), 120); // F
    },

    // Normal mood (neutral beep)
    normal: () => {
      playSound(600, 0.12, 'sine', 0.2);
    },

    // Hover (subtle feedback)
    hover: () => {
      playSound(700, 0.05, 'sine', 0.15);
    },

    // Success celebration (triumphant)
    success: () => {
      playSound(523, 0.08, 'square', 0.2); // C
      setTimeout(() => playSound(659, 0.08, 'square', 0.2), 70); // E
      setTimeout(() => playSound(784, 0.08, 'square', 0.2), 140); // G
      setTimeout(() => playSound(1047, 0.2, 'square', 0.25), 210); // C high
    },

    // Generic sound for positive/negative feedback (for useAnimations compatibility)
    playSound: (type: 'positive' | 'negative') => {
      if (type === 'positive') {
        sounds.success();
      } else {
        sounds.disappointed();
      }
    },

    // Toggle sound on/off
    toggleSound: (enabled: boolean) => {
      soundEnabledRef.current = enabled;
    },

    // Get current sound state
    isSoundEnabled: () => soundEnabledRef.current,
  };

  return sounds;
}
