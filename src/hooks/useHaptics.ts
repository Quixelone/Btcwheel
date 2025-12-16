import { useCallback } from 'react';

/**
 * Hook for haptic feedback on mobile devices
 * Uses Vibration API (supported on most modern mobile browsers)
 */
export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    // Check if haptic feedback is enabled in settings
    const hapticEnabled = localStorage.getItem('mascotHapticEnabled') !== 'false';
    if (!hapticEnabled) {
      return;
    }

    // Check if Vibration API is supported
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration not supported or failed:', error);
      }
    }
  }, []);

  const haptics = {
    // Light tap (button press)
    light: () => vibrate(10),
    
    // Medium tap (selection, toggle)
    medium: () => vibrate(20),
    
    // Heavy tap (important action, error)
    heavy: () => vibrate(40),
    
    // Success pattern (achievement, correct answer)
    success: () => vibrate([10, 50, 10, 50, 10]),
    
    // Error pattern (wrong answer, warning)
    error: () => vibrate([50, 100, 50]),
    
    // Notification (mascot appears, tip available)
    notification: () => vibrate([20, 40, 20]),
    
    // Selection (swipe, drag)
    selection: () => vibrate([5, 10, 5]),
    
    // Custom pattern
    custom: (pattern: number | number[]) => vibrate(pattern),
  };

  return haptics;
}
