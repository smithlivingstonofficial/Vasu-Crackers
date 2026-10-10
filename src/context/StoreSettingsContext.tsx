'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SettingsService, StoreSettings } from '@/lib/services/settings.service';
import { createClient } from '@/lib/supabase/client';

const SETTINGS_STORAGE_KEY = 'sfw_store_settings_cache_v2';

function sanitizeStoreSettings(s: StoreSettings): StoreSettings {
  if (!s) return DEFAULT_STORE_SETTINGS;
  const clean = { ...s };
  if (!clean.store_name || /vail[iy]/i.test(clean.store_name)) {
    clean.store_name = 'Vasu Crackers';
  }
  if (!clean.hero_banner_image_url || clean.hero_banner_image_url === '/hero-banner.webp') {
    clean.hero_banner_image_url = '';
    clean.hero_banner_enabled = false;
  }
  if (!clean.logo_url || clean.logo_url === '/logo.png' || clean.logo_url === '/vasu-crackers-logo.png') {
    clean.logo_url = '/Vasu Crackers Firework Emblem.png';
  }
  if (!Array.isArray(clean.extra_helpline_mobiles)) {
    clean.extra_helpline_mobiles = [];
  }
  if (!Array.isArray(clean.extra_whatsapp_numbers)) {
    clean.extra_whatsapp_numbers = [];
  }
  return clean;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'Vasu Crackers',
  tagline: 'Vasu Crackers Sivakasi Direct Fireworks Outlet',
  helpline_mobile: '',
  extra_helpline_mobiles: [],
  whatsapp_number: '',
  extra_whatsapp_numbers: [],
  gstin: '',
  announcement_banner: '⚡ DIWALI PRE-BOOKING OPEN: Get up to 90% OFF Factory Direct Rates!',
  discount_percentage: 90,
  store_address: '',
  max_order_limit_enabled: false,
  max_order_limit_amount: 50000,
  min_order_tamil_nadu: 3000,
  min_order_other_states: 5000,
  state_min_order_overrides: {},
  hero_banner_enabled: false,
  hero_banner_image_url: '',
  hero_banner_link_url: '#catalog',
  logo_url: '/Vasu Crackers Firework Emblem.png',
};

interface StoreSettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: (force?: boolean) => Promise<StoreSettings>;
  updateSettingsState: (newSettings: StoreSettings) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with cached settings if available for instant 0ms first render
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vpp_store_settings_cache_v1');
      } catch {}
      const cached = SettingsService.getCachedSettings();
      if (cached) return sanitizeStoreSettings(cached);
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) return sanitizeStoreSettings({ ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) });
      } catch {}
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async (force = false): Promise<StoreSettings> => {
    try {
      const fresh = sanitizeStoreSettings(await SettingsService.getAllSettings({ forceFresh: force }));
      setSettings(fresh);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(fresh));
      } catch (err) {
        console.warn('Failed to cache settings in localStorage:', err);
      }
      return fresh;
    } catch (e) {
      console.warn('Failed to refresh store settings:', e);
      return DEFAULT_STORE_SETTINGS;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettingsState = useCallback((newSettings: StoreSettings) => {
    const clean = sanitizeStoreSettings(newSettings);
    setSettings(clean);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(clean));
    } catch (err) {
      console.warn('Failed to cache settings in localStorage:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Fetch 100% fresh settings on mount directly from database (bypassing any stale cache)
    refreshSettings(true);

    // 2. Listen for cross-component update events dispatched when settings are saved
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail) {
        setSettings(sanitizeStoreSettings(customEvent.detail));
      } else {
        refreshSettings(true);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        (e.key === SETTINGS_STORAGE_KEY || e.key === 'sfw_cache_store_settings') &&
        e.newValue
      ) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(sanitizeStoreSettings(parsed));
        } catch {
          refreshSettings(true);
        }
      }
    };

    window.addEventListener('sfw_store_settings_updated', handleSettingsUpdated);
    window.addEventListener('vpp_store_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorageChange);

    // 3. Supabase Realtime listener on store_settings for instant cross-tab / cross-device updates
    const supabase = createClient();
    const settingsChannel = supabase
      .channel('store_settings_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        () => {
          refreshSettings(true);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('sfw_store_settings_updated', handleSettingsUpdated);
      window.removeEventListener('vpp_store_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorageChange);
      supabase.removeChannel(settingsChannel);
    };
  }, [refreshSettings]);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        updateSettingsState,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_STORE_SETTINGS,
      loading: false,
      refreshSettings: async () => DEFAULT_STORE_SETTINGS,
      updateSettingsState: () => {},
    };
  }
  return context;
};
