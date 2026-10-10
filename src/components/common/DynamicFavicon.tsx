'use client';

import { useEffect } from 'react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

/**
 * DynamicFavicon
 * Dynamically updates browser tab favicons, shortcut icons, and apple-touch-icons
 * in real-time based on the store's configured logo in settings.
 */
export function DynamicFavicon() {
  const { settings } = useStoreSettings();
  const activeIcon = settings?.logo_url || '/Vasu Crackers Firework Emblem.png';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {

      // 1. Target all icon-related link tags
      const iconSelectors = [
        "link[rel='icon']",
        "link[rel='shortcut icon']",
        "link[rel='apple-touch-icon']",
      ];

      const existingIcons = document.querySelectorAll<HTMLLinkElement>(iconSelectors.join(', '));

      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          el.href = activeIcon;
        });
      }

      // 2. Ensure primary icon link tag exists and is freshly mounted
      let primaryIcon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!primaryIcon) {
        primaryIcon = document.createElement('link');
        primaryIcon.rel = 'icon';
        document.head.appendChild(primaryIcon);
      }
      primaryIcon.href = activeIcon;

      // 3. Ensure apple-touch-icon exists
      let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = activeIcon;
    } catch (err) {
      console.warn('Failed to dynamically update favicon:', err);
    }
  }, [activeIcon]);

  return null;
}
