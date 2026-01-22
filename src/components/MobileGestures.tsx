import { useEffect } from 'react';
import { toast } from 'sonner';

export function MobileGestures() {
  useEffect(() => {
    let touchStartY = 0;

    // Disable pull-to-refresh on the entire app
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        // Allow pinch-to-zoom
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop === 0 && e.touches[0].clientY > touchStartY) {
        // At top of page and pulling down
        e.preventDefault();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };



    // Add haptic feedback on certain interactions
    const addHapticFeedback = (element: Element) => {
      if ('vibrate' in navigator && element.matches('button, a, [role="button"]')) {
        navigator.vibrate(10); // Subtle vibration
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        addHapticFeedback(e.target);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('click', handleClick);

    // Detect when app comes back online/offline
    const handleOnline = () => {
      toast.success('Sei di nuovo online! 🌐', {
        description: 'I tuoi progressi verranno sincronizzati'
      });
    };

    const handleOffline = () => {
      toast.info('Sei offline 📵', {
        description: 'I progressi verranno salvati localmente'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Prevent context menu on long press (more native feel)
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', preventContextMenu);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);

      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  return null;
}