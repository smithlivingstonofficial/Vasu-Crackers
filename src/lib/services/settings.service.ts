import { createClient } from '@/lib/supabase/client';
import { localCache } from '@/lib/utils/cache.utils';
import { compressImageFile } from '@/lib/utils/image-compress.utils';

export interface PhoneNumberEntry {
  display: string;
  cleanDigits: string;
  cleanTel: string;
  cleanWa: string;
  isPrimary: boolean;
  label: string;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  helpline_mobile: string;
  extra_helpline_mobiles?: string[];
  whatsapp_number: string;
  extra_whatsapp_numbers?: string[];
  gstin: string;
  announcement_banner: string;
  discount_percentage: number;
  store_address: string;
  max_order_limit_enabled: boolean;
  max_order_limit_amount: number;
  min_order_tamil_nadu: number;
  min_order_other_states: number;
  state_min_order_overrides: Record<string, number>;
  hero_banner_enabled: boolean;
  hero_banner_image_url: string;
  hero_banner_link_url: string;
  logo_url: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
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

export class SettingsService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Synchronous getter for instant 0ms setting retrieval.
   */
  static getCachedSettings(): StoreSettings | null {
    const cached = localCache.getSync<StoreSettings>('store_settings');
    if (cached) {
      if (!cached.store_name || /vail[iy]/i.test(cached.store_name)) {
        cached.store_name = 'Vasu Crackers';
      }
      return cached;
    }
    return null;
  }

  /**
   * Fetch all store settings with 10-minute caching & SWR.
   * Prevents repeated Supabase DB queries on every navigation.
   */
  static async getAllSettings(options?: { forceFresh?: boolean }): Promise<StoreSettings> {
    const status = localCache.getWithStatus<StoreSettings>('store_settings');

    if (!options?.forceFresh) {
      if (status.isFresh && status.data) {
        return status.data;
      }
      if (status.isStale && status.data) {
        this.revalidateSettings();
        return status.data;
      }
    }

    return this.fetchSettingsFromDb();
  }

  private static async fetchSettingsFromDb(): Promise<StoreSettings> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error || !data || data.length === 0) {
        console.warn('Settings fetch failed, using defaults:', error?.message);
        return { ...DEFAULT_SETTINGS };
      }

      const settingsMap: Record<string, string> = {};
      data.forEach((row: { key: string; value: string }) => {
        settingsMap[row.key] = row.value;
      });

      const parsedDiscount = settingsMap['discount_percentage']
        ? Number(settingsMap['discount_percentage'])
        : DEFAULT_SETTINGS.discount_percentage;

      const parsedMaxLimit = settingsMap['max_order_limit_amount']
        ? Number(settingsMap['max_order_limit_amount'])
        : DEFAULT_SETTINGS.max_order_limit_amount;

      const parsedMinTn = settingsMap['min_order_tamil_nadu']
        ? Number(settingsMap['min_order_tamil_nadu'])
        : DEFAULT_SETTINGS.min_order_tamil_nadu;

      const parsedMinOther = settingsMap['min_order_other_states']
        ? Number(settingsMap['min_order_other_states'])
        : DEFAULT_SETTINGS.min_order_other_states;

      let parsedStateOverrides: Record<string, number> = {};
      if (settingsMap['state_min_order_overrides']) {
        try {
          parsedStateOverrides = JSON.parse(settingsMap['state_min_order_overrides']);
        } catch {
          parsedStateOverrides = {};
        }
      }

      const rawBannerUrl = settingsMap['hero_banner_image_url'] || '';
      const bannerUrl = (rawBannerUrl && rawBannerUrl !== '/hero-banner.webp') ? rawBannerUrl : '';
      const heroBannerEnabled = bannerUrl ? (settingsMap['hero_banner_enabled'] === 'true') : false;

      let resolvedStoreName = settingsMap['store_name'] ?? DEFAULT_SETTINGS.store_name;
      if (!resolvedStoreName || /vail[iy]/i.test(resolvedStoreName)) {
        resolvedStoreName = 'Vasu Crackers';
        // Proactively auto-heal Supabase store_settings table in background
        supabase
          .from('store_settings')
          .upsert({ key: 'store_name', value: 'Vasu Crackers', updated_at: new Date().toISOString() }, { onConflict: 'key' })
          .then();
      }

      let extraHelplines: string[] = [];
      if (settingsMap['extra_helpline_mobiles']) {
        try {
          const parsed = JSON.parse(settingsMap['extra_helpline_mobiles']);
          if (Array.isArray(parsed)) {
            extraHelplines = parsed.map((s) => String(s).trim()).filter(Boolean);
          }
        } catch {
          extraHelplines = [];
        }
      }

      let extraWhatsapps: string[] = [];
      if (settingsMap['extra_whatsapp_numbers']) {
        try {
          const parsed = JSON.parse(settingsMap['extra_whatsapp_numbers']);
          if (Array.isArray(parsed)) {
            extraWhatsapps = parsed.map((s) => String(s).trim()).filter(Boolean);
          }
        } catch {
          extraWhatsapps = [];
        }
      }

      const settings: StoreSettings = {
        store_name: resolvedStoreName,
        tagline: settingsMap['tagline'] ?? DEFAULT_SETTINGS.tagline,
        helpline_mobile: settingsMap['helpline_mobile'] ?? DEFAULT_SETTINGS.helpline_mobile,
        extra_helpline_mobiles: extraHelplines,
        whatsapp_number: settingsMap['whatsapp_number'] ?? DEFAULT_SETTINGS.whatsapp_number,
        extra_whatsapp_numbers: extraWhatsapps,
        gstin: settingsMap['gstin'] !== undefined ? settingsMap['gstin'] : DEFAULT_SETTINGS.gstin,
        announcement_banner: settingsMap['announcement_banner'] ?? DEFAULT_SETTINGS.announcement_banner,
        discount_percentage: !isNaN(parsedDiscount) && parsedDiscount >= 0 ? parsedDiscount : DEFAULT_SETTINGS.discount_percentage,
        store_address: settingsMap['store_address'] ?? DEFAULT_SETTINGS.store_address,
        max_order_limit_enabled: settingsMap['max_order_limit_enabled'] === 'true',
        max_order_limit_amount: !isNaN(parsedMaxLimit) && parsedMaxLimit > 0 ? parsedMaxLimit : DEFAULT_SETTINGS.max_order_limit_amount,
        min_order_tamil_nadu: !isNaN(parsedMinTn) && parsedMinTn > 0 ? parsedMinTn : DEFAULT_SETTINGS.min_order_tamil_nadu,
        min_order_other_states: !isNaN(parsedMinOther) && parsedMinOther > 0 ? parsedMinOther : DEFAULT_SETTINGS.min_order_other_states,
        state_min_order_overrides: parsedStateOverrides,
        hero_banner_enabled: heroBannerEnabled,
        hero_banner_image_url: bannerUrl,
        hero_banner_link_url: settingsMap['hero_banner_link_url'] || DEFAULT_SETTINGS.hero_banner_link_url,
        logo_url:
          settingsMap['logo_url'] &&
          settingsMap['logo_url'] !== '/logo.png' &&
          settingsMap['logo_url'] !== '/vasu-crackers-logo.png'
            ? settingsMap['logo_url']
            : '/Vasu Crackers Firework Emblem.png',
      };

      localCache.set('store_settings', settings, 2 * 60 * 1000); // 2 min TTL for live settings sync
      return settings;
    } catch (e) {
      console.warn('Settings fetch exception, using defaults:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  private static async revalidateSettings(): Promise<void> {
    try {
      const fresh = await this.fetchSettingsFromDb();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sfw_store_settings_updated', { detail: fresh }));
        window.dispatchEvent(new CustomEvent('vpp_store_settings_updated', { detail: fresh }));
      }
    } catch {}
  }

  /**
   * Upload hero banner image to Supabase Storage with client-side compression & 1-year cache.
   */
  static async uploadHeroBannerImage(file: File): Promise<string> {
    const compressedFile = await compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 900,
      quality: 0.85,
    });

    const supabase = this.getSupabase();
    const fileExt = compressedFile.name.split('.').pop() || 'webp';
    const fileName = `hero-banner-${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, {
          cacheControl: '31536000',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err: any) {
      console.warn('Supabase banner upload failed, using Data URL fallback:', err?.message || err);
    }

    // Fallback to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '/hero-banner.webp');
      };
      reader.onerror = () => resolve('/hero-banner.webp');
      reader.readAsDataURL(compressedFile);
    });
  }

  /**
   * Upload site logo image to Supabase Storage with client-side compression/preservation & 1-year cache.
   */
  static async uploadLogoImage(file: File): Promise<string> {
    const isSvg = file.type === 'image/svg+xml';
    const isPng = file.type === 'image/png';

    const compressedFile = isSvg
      ? file
      : await compressImageFile(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.92,
          mimeType: isPng ? 'image/png' : 'image/webp',
        });

    const supabase = this.getSupabase();
    const fileExt = compressedFile.name.split('.').pop() || (isPng ? 'png' : 'webp');
    const fileName = `site-logo-${Date.now()}.${fileExt}`;
    const filePath = `brand/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, {
          cacheControl: '31536000',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err: any) {
      console.warn('Supabase logo upload failed, using Data URL fallback:', err?.message || err);
    }

    // Fallback to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : '');
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(compressedFile);
    });
  }

  /**
   * Update site logo URL directly and broadcast update across the entire app.
   */
  static async updateLogoUrl(logoUrl: string): Promise<boolean> {
    return this.saveSetting('logo_url', logoUrl || DEFAULT_SETTINGS.logo_url);
  }

  /**
   * Get active global discount percentage directly.
   */
  static async getDiscountPercentage(): Promise<number> {
    const settings = await this.getAllSettings();
    return settings.discount_percentage ?? 80;
  }

  /**
   * Save active global discount percentage directly.
   * Instantly clears both settings and product catalog caches so new prices reflect immediately.
   */
  static async updateDiscountPercentage(percent: number): Promise<boolean> {
    const res = await this.saveSetting('discount_percentage', String(percent));
    localCache.clear('products_all');
    localCache.clear('store_settings');
    localCache.broadcastCatalogUpdate('discount_updated');
    return res;
  }

  /**
   * Save all store settings to the database using upsert.
   * Each key-value pair is upserted atomically.
   */
  static async saveAllSettings(settings: StoreSettings): Promise<boolean> {
    const supabase = this.getSupabase();
    const rows = [
      { key: 'store_name', value: settings.store_name },
      { key: 'tagline', value: settings.tagline },
      { key: 'helpline_mobile', value: settings.helpline_mobile || '' },
      { key: 'extra_helpline_mobiles', value: JSON.stringify(settings.extra_helpline_mobiles || []) },
      { key: 'whatsapp_number', value: settings.whatsapp_number || '' },
      { key: 'extra_whatsapp_numbers', value: JSON.stringify(settings.extra_whatsapp_numbers || []) },
      { key: 'gstin', value: settings.gstin },
      { key: 'announcement_banner', value: settings.announcement_banner },
      { key: 'discount_percentage', value: String(settings.discount_percentage) },
      { key: 'store_address', value: settings.store_address },
      { key: 'max_order_limit_enabled', value: String(settings.max_order_limit_enabled) },
      { key: 'max_order_limit_amount', value: String(settings.max_order_limit_amount) },
      { key: 'min_order_tamil_nadu', value: String(settings.min_order_tamil_nadu) },
      { key: 'min_order_other_states', value: String(settings.min_order_other_states) },
      { key: 'state_min_order_overrides', value: JSON.stringify(settings.state_min_order_overrides || {}) },
      { key: 'hero_banner_enabled', value: String(settings.hero_banner_enabled) },
      { key: 'hero_banner_image_url', value: settings.hero_banner_image_url || '' },
      { key: 'hero_banner_link_url', value: settings.hero_banner_link_url || '#catalog' },
      { key: 'logo_url', value: settings.logo_url || '/Vasu Crackers Firework Emblem.png' },
    ].map((r) => ({ ...r, updated_at: new Date().toISOString() }));

    const { error } = await supabase
      .from('store_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      console.error('Failed to save settings:', error);
      throw new Error(error.message || 'Failed to save store settings.');
    }

    localCache.clear('store_settings');
    localCache.clear('products_all');
    localCache.broadcastCatalogUpdate('settings_updated');

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vpp_store_settings_cache_v1');
        localStorage.setItem('sfw_store_settings_cache_v2', JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('sfw_store_settings_updated', { detail: settings }));
        window.dispatchEvent(new CustomEvent('vpp_store_settings_updated', { detail: settings }));
        window.dispatchEvent(new CustomEvent('vpp_catalog_updated'));
      } catch (err) {
        console.warn('Failed to dispatch settings update event:', err);
      }
    }

    return true;
  }

  /**
   * Update a single setting value.
   */
  static async saveSetting(key: keyof StoreSettings, value: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error(`Failed to save setting [${key}]:`, error);
      throw new Error(error.message);
    }

    localCache.clear('store_settings');
    if (key === 'discount_percentage') {
      localCache.clear('products_all');
      localCache.broadcastCatalogUpdate('discount_percentage_updated');
    }

    if (typeof window !== 'undefined') {
      try {
        const fresh = await this.getAllSettings({ forceFresh: true });
        localStorage.removeItem('vpp_store_settings_cache_v1');
        localStorage.setItem('sfw_store_settings_cache_v2', JSON.stringify(fresh));
        window.dispatchEvent(new CustomEvent('sfw_store_settings_updated', { detail: fresh }));
        window.dispatchEvent(new CustomEvent('vpp_store_settings_updated', { detail: fresh }));
        if (key === 'discount_percentage') {
          window.dispatchEvent(new CustomEvent('vpp_catalog_updated'));
        }
      } catch (err) {
        console.warn('Failed to broadcast single setting update:', err);
      }
    }

    return true;
  }

  /**
   * Parse primary and extra phone numbers, splitting any comma/slash/semicolon/newline separated entries.
   * Returns a normalized list of PhoneNumberEntry items without duplicates.
   */
  static parsePhoneNumbers(
    primary?: string,
    extras?: string[],
    type: 'tel' | 'wa' = 'tel'
  ): PhoneNumberEntry[] {
    const rawTokens: { text: string; isPrimary: boolean }[] = [];

    // 1. Process primary
    if (primary && primary.trim()) {
      const parts = primary.split(/[,;\n/]+/).map((p) => p.trim()).filter(Boolean);
      parts.forEach((p, idx) => {
        rawTokens.push({ text: p, isPrimary: idx === 0 });
      });
    }

    // 2. Process extras
    if (Array.isArray(extras)) {
      extras.forEach((ext) => {
        if (!ext || !ext.trim()) return;
        const parts = ext.split(/[,;\n/]+/).map((p) => p.trim()).filter(Boolean);
        parts.forEach((p) => {
          rawTokens.push({ text: p, isPrimary: false });
        });
      });
    }

    const seenDigits = new Set<string>();
    const results: PhoneNumberEntry[] = [];

    rawTokens.forEach(({ text, isPrimary }) => {
      const digits = text.replace(/\D/g, '');
      if (!digits) return;

      // Deduplicate on last 10 digits for Indian mobiles, or full digits if shorter
      const dedupKey = digits.length >= 10 ? digits.slice(-10) : digits;
      if (seenDigits.has(dedupKey)) return;
      seenDigits.add(dedupKey);

      let cleanDigits = digits;
      let cleanTel = '';
      let cleanWa = '';
      let display = text.trim();

      if (digits.length === 10) {
        cleanDigits = `91${digits}`;
        cleanTel = `+91${digits}`;
        cleanWa = `91${digits}`;
        display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      } else if (digits.length === 12 && digits.startsWith('91')) {
        cleanDigits = digits;
        cleanTel = `+${digits}`;
        cleanWa = digits;
        display = `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
      } else if (text.startsWith('+')) {
        cleanTel = `+${digits}`;
        cleanWa = digits;
        display = text;
      } else {
        cleanTel = `+${digits}`;
        cleanWa = digits;
        display = text;
      }

      const idx = results.length;
      let label = '';
      if (type === 'tel') {
        label = idx === 0 ? 'Helpline (Line 1)' : `Helpline Line ${idx + 1} (Alternate)`;
      } else {
        label = idx === 0 ? 'WhatsApp Desk 1' : `WhatsApp Desk ${idx + 1} (Alternate)`;
      }

      results.push({
        display,
        cleanDigits,
        cleanTel,
        cleanWa,
        isPrimary,
        label,
      });
    });

    return results;
  }

  /**
   * Get all configured helpline numbers with formatting and metadata.
   */
  static getHelplineNumbers(settings?: StoreSettings | null): PhoneNumberEntry[] {
    if (!settings) return [];
    return this.parsePhoneNumbers(settings.helpline_mobile, settings.extra_helpline_mobiles, 'tel');
  }

  /**
   * Get all configured WhatsApp support numbers with formatting and metadata.
   */
  static getWhatsAppNumbers(settings?: StoreSettings | null): PhoneNumberEntry[] {
    if (!settings) return [];
    return this.parsePhoneNumbers(settings.whatsapp_number, settings.extra_whatsapp_numbers, 'wa');
  }

  /**
   * Combined string of all helpline numbers for printing (e.g. Packing Slip).
   */
  static getCombinedHelplineString(settings?: StoreSettings | null): string {
    const list = this.getHelplineNumbers(settings);
    if (list.length === 0) return settings?.helpline_mobile?.trim() || '';
    return list.map((item) => item.display).join(' / ');
  }
}

