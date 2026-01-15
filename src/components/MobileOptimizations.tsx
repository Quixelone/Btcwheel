import { useEffect } from 'react';

export function MobileOptimizations() {
  useEffect(() => {
    // Prevent zoom on input focus (iOS)
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      );
    }

    // Add iOS specific meta tags
    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'BTC Wheel' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#3b82f6' },
    ];

    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', tag.name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', tag.content);
    });

    // Add iOS splash screens
    const splashScreens = [
      { media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/iphone5_splash.png' },
      { media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/iphone6_splash.png' },
      { media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphoneplus_splash.png' },
      { media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphonex_splash.png' },
      { media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/iphonexr_splash.png' },
      { media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)', href: '/splash/iphonexsmax_splash.png' },
      { media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipad_splash.png' },
      { media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipadpro1_splash.png' },
      { media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)', href: '/splash/ipadpro3_splash.png' },
    ];

    splashScreens.forEach(splash => {
      let link = document.querySelector(`link[media="${splash.media}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'apple-touch-startup-image');
        link.setAttribute('media', splash.media);
        document.head.appendChild(link);
      }
      link.setAttribute('href', splash.href);
    });

    // Add apple touch icons
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
    appleTouchIcon.setAttribute('href', '/icons/icon-192x192.png');
    document.head.appendChild(appleTouchIcon);

    // Disable pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';

    // Add haptic feedback support
    if ('vibrate' in navigator) {
      window.addEventListener('touchstart', () => {
        // Subtle vibration on touch
      });
    }

    // Service Worker registration is now handled by vite-plugin-pwa
    // and AppUpdatePrompt component handles the updates.

    // Handle online/offline status
    const handleOnline = () => {
      console.log('App is online');
      // Could show a toast notification
    };

    const handleOffline = () => {
      console.log('App is offline');
      // Could show a toast notification
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}