'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Save,
  Building2,
  MapPin,
  Phone,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Truck,
  IndianRupee,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Image as ImageIcon,
  ChevronRight,
  Upload,
  RotateCcw,
  Sparkles,
  Globe,
  Link as LinkIcon,
  Plus,
  Trash2,
  Megaphone,
  ExternalLink,
  Percent,
  Check,
  FileText,
  Layers,
  Store,
  Receipt,
  Eye,
  SlidersHorizontal,
  Info,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { SettingsService, StoreSettings } from '@/lib/services/settings.service';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { ProductService } from '@/lib/services/product.service';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { DeliveryZone } from '@/types';

const ALL_INDIAN_STATES = [
  'Tamil Nadu',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

type SettingsTab = 'all' | 'brand' | 'support' | 'delivery' | 'announcements' | 'billing';

export default function AdminSettingsPage() {
  const { updateSettingsState } = useStoreSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isLogoUrlOpen, setIsLogoUrlOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<StoreSettings>({
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
  });

  const [initialSettings, setInitialSettings] = useState<StoreSettings | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isCustomStatesOpen, setIsCustomStatesOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload a valid image file (PNG, WebP, JPG, or SVG).');
      return;
    }

    try {
      setUploadingLogo(true);
      const uploadedUrl = await SettingsService.uploadLogoImage(file);
      const updated = { ...settings, logo_url: uploadedUrl };
      setSettings(updated);
      showToast('success', 'Logo uploaded! Click "Save Changes" to apply across the store.');
    } catch (err: any) {
      console.error('Logo upload error:', err);
      showToast('error', err?.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logo_url: '/Vasu Crackers Firework Emblem.png' }));
    showToast('success', 'Reset to default Vasu Crackers logo. Click "Save Changes" to apply.');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedSettings, fetchedZones] = await Promise.all([
        SettingsService.getAllSettings(),
        ProductService.getDeliveryZones(),
      ]);

      if (!fetchedSettings.store_name || /vail[iy]/i.test(fetchedSettings.store_name)) {
        fetchedSettings.store_name = 'Vasu Crackers';
      }
      if (!fetchedSettings.logo_url || fetchedSettings.logo_url === '/logo.png' || fetchedSettings.logo_url === '/vasu-crackers-logo.png') {
        fetchedSettings.logo_url = '/Vasu Crackers Firework Emblem.png';
      }
      if (!Array.isArray(fetchedSettings.extra_helpline_mobiles)) {
        fetchedSettings.extra_helpline_mobiles = [];
      }
      if (!Array.isArray(fetchedSettings.extra_whatsapp_numbers)) {
        fetchedSettings.extra_whatsapp_numbers = [];
      }

      setSettings(fetchedSettings);
      setInitialSettings(fetchedSettings);
      setZones(fetchedZones);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      showToast('error', err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, zones]);

  // Dirty state detection
  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const handleReset = () => {
    if (initialSettings) {
      setSettings(initialSettings);
      showToast('success', 'Changes reverted back to saved settings.');
    }
  };

  const handleStateOverrideChange = (stateName: string, value: string) => {
    const numValue = value ? Number(value) : undefined;
    setSettings((prev) => {
      const updatedOverrides = { ...(prev.state_min_order_overrides || {}) };
      if (numValue && numValue > 0) {
        updatedOverrides[stateName] = numValue;
      } else {
        delete updatedOverrides[stateName];
      }
      return { ...prev, state_min_order_overrides: updatedOverrides };
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const cleanSettings: StoreSettings = {
        ...settings,
        store_name: settings.store_name.trim() || 'Vasu Crackers',
        tagline: settings.tagline.trim() || 'Vasu Crackers Sivakasi Direct Fireworks Outlet',
        extra_helpline_mobiles: (settings.extra_helpline_mobiles || []).map((s) => s.trim()).filter(Boolean),
        extra_whatsapp_numbers: (settings.extra_whatsapp_numbers || []).map((s) => s.trim()).filter(Boolean),
      };
      await SettingsService.saveAllSettings(cleanSettings);
      updateSettingsState(cleanSettings);
      setSettings(cleanSettings);
      setInitialSettings(cleanSettings);

      // Sync delivery_zones in DB safely without breaking store settings save
      try {
        const updatePromises = zones.map((zone) => {
          let minAmount = zone.min_order_amount;
          if (
            zone.id === 'zone-south' ||
            zone.id === '55555555-0000-0000-0000-000000000001' ||
            zone.zone_name.toLowerCase().includes('south')
          ) {
            minAmount = cleanSettings.min_order_tamil_nadu || 4000;
          } else if (
            zone.id === 'zone-rest' ||
            zone.id === '55555555-0000-0000-0000-000000000002' ||
            zone.zone_name.toLowerCase().includes('rest')
          ) {
            minAmount = cleanSettings.min_order_other_states;
          }
          return ProductService.updateDeliveryZone(zone.id, {
            min_order_amount: minAmount,
            delivery_fee: zone.delivery_fee,
          });
        });

        await Promise.allSettled(updatePromises);
      } catch (zoneErr) {
        console.warn('Delivery zones sync handled:', zoneErr);
      }

      showToast('success', 'All store settings and delivery rules updated successfully!');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showToast('error', err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const previewHelplines = useMemo(() => {
    return SettingsService.getHelplineNumbers(settings);
  }, [settings.helpline_mobile, settings.extra_helpline_mobiles]);

  const previewWhatsapps = useMemo(() => {
    return SettingsService.getWhatsAppNumbers(settings);
  }, [settings.whatsapp_number, settings.extra_whatsapp_numbers]);

  const customOverrideCount = Object.keys(settings.state_min_order_overrides || {}).length;
  const filteredStates = ALL_INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-xl animate-pulse">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-extrabold text-base text-slate-900">Loading Store Configuration</h3>
          <p className="text-xs text-slate-500 font-medium">Fetching brand assets, communication lines &amp; rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-28 sm:pb-20 font-sans px-1 sm:px-2 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 left-6 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4 duration-200 border ${
            toast.type === 'success'
              ? 'bg-slate-950/95 text-emerald-300 border-emerald-500/40 backdrop-blur-md shadow-emerald-950/20'
              : 'bg-slate-950/95 text-rose-300 border-rose-500/40 backdrop-blur-md shadow-rose-950/20'
          }`}
        >
          {toast.type === 'success' ? (
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          <span className="flex-1 text-white font-medium text-xs leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP COMMAND HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-7">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left Title & Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-500">Store Settings</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Storefront Synced
              </span>
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-bounce">
                  ● Unsaved Changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                <Store className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <span>Store Control Center</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Manage branding, multi-line helplines, WhatsApp support desks &amp; regional order limits.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
              title="Open Customer Storefront"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-rose-200"
                title="Discard unsaved changes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/25 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Save className="w-4 h-4 text-slate-950" />
              )}
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-600/30 text-amber-950 rounded">
                Ctrl+S
              </kbd>
            </button>
          </div>
        </div>

        {/* SECTION NAVIGATION PILLS */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Settings', icon: Layers },
            { id: 'brand', label: 'Brand & Visuals', icon: Sparkles },
            { id: 'support', label: 'Helpline & WhatsApp', icon: PhoneCall },
            { id: 'delivery', label: 'Delivery Limits', icon: Truck },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'billing', label: 'Invoicing & Bill Details', icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.id === 'support' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {previewHelplines.length + previewWhatsapps.length}
                  </span>
                )}
                {tab.id === 'delivery' && customOverrideCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {customOverrideCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FESTIVE HERO PROMOTION BANNER HIGHLIGHT STRIP */}
      {(activeTab === 'all' || activeTab === 'announcements') && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-100/40 p-5 sm:p-6 shadow-xs group transition-all hover:border-amber-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-black text-sm sm:text-base text-slate-950 tracking-tight truncate">
                    Festive Hero Promotion Banner
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      settings.hero_banner_enabled
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-200/80 text-slate-700 border-slate-300'
                    }`}
                  >
                    {settings.hero_banner_enabled ? '● Active on Storefront' : '○ Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Upload custom 1600x900 festive banner images, configure call-to-action offer links, or toggle visibility.
                </p>
              </div>
            </div>

            <Link
              href="/admin/banners"
              className="px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-950 border border-amber-300/80 rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 cursor-pointer active:scale-95 hover:border-amber-400"
            >
              <span>Manage Festive Banner</span>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ======================================================== */}
        {/* SECTION: BRAND IDENTITY & LOGO (ACTIVE WHEN ALL OR BRAND) */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'brand') && (
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
                    <span>Site Brand Identity &amp; Visual Logo</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                      Site-Wide
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Changes reflect instantly across storefront headers, footers, mobile drawers, admin sidebar &amp; browser tab favicon.
                  </p>
                </div>
              </div>
            </div>

            {/* Store Name & Tagline Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-800 font-extrabold text-xs">
                  Official Store Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={settings.store_name}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-slate-950 font-black text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                    placeholder="Vasu Crackers"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Displayed in page titles, invoices, metadata and header logos.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-800 font-extrabold text-xs">
                  Store Tagline / Subtitle
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-slate-950 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                    placeholder="Direct Factory Outlet • Sivakasi, Tamil Nadu"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  Shown beneath store name on invoices, footer &amp; SEO tags.
                </span>
              </div>
            </div>

            {/* LIVE SIMULATION VIEWPORTS */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Real-Time Viewport Simulators</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {settings.logo_url ? 'Custom Brand Logo Active' : 'Default Sivakasi Logo Active'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Light Mode / Storefront Header Preview */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      Light Header Simulator
                    </span>
                    <span className="text-[9px] bg-white text-slate-600 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                      Day Theme
                    </span>
                  </div>

                  <div className="w-full h-24 bg-white rounded-xl border border-slate-200/90 p-2 flex flex-col items-center justify-center shadow-2xs relative overflow-hidden">
                    {/* Simulated mini header navigation bar */}
                    <div className="w-full pb-1.5 border-b border-slate-100 flex items-center justify-between px-2 text-[9px] text-slate-400">
                      <span className="font-bold text-slate-700">{settings.store_name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Cart (0)</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-1">
                      {settings.logo_url ? (
                        <Image
                          src={settings.logo_url}
                          alt="Site Logo Preview"
                          width={140}
                          height={50}
                          unoptimized
                          className="max-h-12 w-auto object-contain transition-all duration-200"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-800 font-black text-xs">
                          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                          <span>{settings.store_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium text-center">
                    Rendered on Storefront Header, Footer &amp; Admin Sidebar
                  </span>
                </div>

                {/* 2. Dark Mode / Hero Festive Section Preview */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Dark Hero Simulator</span>
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                      Festive Night
                    </span>
                  </div>

                  <div className="w-full h-24 bg-slate-900 rounded-xl border border-slate-800 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial from-amber-500/20 via-orange-500/5 to-transparent pointer-events-none" />
                    <div className="flex-1 flex items-center justify-center p-1 relative z-10">
                      {settings.logo_url ? (
                        <Image
                          src={settings.logo_url}
                          alt="Site Logo Dark Preview"
                          width={140}
                          height={50}
                          unoptimized
                          className="max-h-12 w-auto object-contain drop-shadow-md"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-white font-black text-xs">
                          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                          <span className="text-amber-100">{settings.store_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="relative z-10 text-[9px] text-amber-400 font-bold">
                      ⭐ 2026 Festival Collection
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium text-center">
                    Rendered on Festive Hero Banners, Diwali Loaders &amp; Sliders
                  </span>
                </div>

                {/* 3. Browser Tab & Favicon Simulator */}
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      Browser Tab Simulator
                    </span>
                    <span className="text-[9px] bg-white text-slate-600 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                      Chrome Favicon
                    </span>
                  </div>

                  <div className="w-full h-24 bg-slate-200/70 rounded-xl border border-slate-300 p-2 flex flex-col justify-end">
                    <div className="bg-white rounded-t-xl px-3 py-2 border-t border-x border-slate-300 shadow-xs flex items-center gap-2 max-w-[210px] mx-auto truncate">
                      <div className="w-4 h-4 rounded-sm shrink-0 overflow-hidden flex items-center justify-center bg-slate-100">
                        {settings.logo_url ? (
                          <Image
                            src={settings.logo_url}
                            alt="Favicon"
                            width={16}
                            height={16}
                            unoptimized
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-black text-slate-800 truncate">
                        {settings.store_name} - Diwa...
                      </span>
                      <X className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium text-center">
                    Browser Tab Favicon &amp; Website Bookmarks
                  </span>
                </div>
              </div>
            </div>

            {/* Logo Action Toolbar */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/png, image/webp, image/jpeg, image/svg+xml"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoFileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Logo Image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogoUrlOpen(!isLogoUrlOpen)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isLogoUrlOpen ? 'Hide URL Input' : 'Paste Direct URL'}</span>
                </button>

                {settings.logo_url && settings.logo_url !== '/Vasu Crackers Firework Emblem.png' && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    title="Remove custom logo and revert to default"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Vasu Crackers Logo</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Supports <strong>PNG, WebP, SVG, JPG</strong> (Max 5MB)
              </div>
            </div>

            {/* Expandable Image URL Field */}
            {isLogoUrlOpen && (
              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 space-y-2 animate-in fade-in duration-150">
                <label className="block text-slate-800 font-bold text-xs">
                  Public Direct Image URL
                </label>
                <input
                  type="text"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="https://example.com/images/vasu-crackers-emblem.png"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 block font-medium">
                  Enter an absolute public HTTPS image link. Changes will show instantly in the simulators above.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: CUSTOMER COMMUNICATION HUB (HELPLINES & WHATSAPP) */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'support') && (
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
                    <span>Customer Communication &amp; Support Desks</span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider">
                      Multi-Line Calling &amp; WhatsApp
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure multiple direct calling numbers and WhatsApp support desks. Separately rendered across the storefront with 1-click calling &amp; chat links.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 1. HELPLINE CALLING LINES (AMBER THEME) */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50 rounded-3xl p-5 border border-amber-200/90 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                  <div className="flex items-center gap-2.5 text-amber-950 font-black text-sm">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>Helpline Voice Lines</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/90 text-amber-950 font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                    {(settings.helpline_mobile?.trim() ? 1 : 0) + (settings.extra_helpline_mobiles?.filter((s) => s.trim()).length || 0)} Calling Lines
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Direct calling numbers for customers needing phone consultation, order tracking or logistics support.
                </p>

                {/* Primary Helpline Line */}
                <div className="p-3.5 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span>Primary Helpline (Line 1)</span>
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        PRIMARY
                      </span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Printed on Bills</span>
                  </div>

                  <div className="relative">
                    <Phone className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.helpline_mobile}
                      onChange={(e) => setSettings({ ...settings, helpline_mobile: e.target.value })}
                      className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                      placeholder="e.g. +91 94932 39009"
                    />
                  </div>

                  {/* Auto-detect comma separated helper */}
                  {settings.helpline_mobile && /[,;/]/.test(settings.helpline_mobile) && (
                    <button
                      type="button"
                      onClick={() => {
                        const tokens = settings.helpline_mobile
                          .split(/[,;/]+/)
                          .map((s) => s.trim())
                          .filter(Boolean);
                        if (tokens.length > 1) {
                          const primary = tokens[0];
                          const extras = [...(settings.extra_helpline_mobiles || []), ...tokens.slice(1)];
                          setSettings({ ...settings, helpline_mobile: primary, extra_helpline_mobiles: extras });
                          showToast('success', `Splitted into ${tokens.length} distinct calling lines!`);
                        }
                      }}
                      className="w-full text-center text-[11px] text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-xl border border-amber-300 font-bold transition-colors cursor-pointer mt-1"
                    >
                      ✨ Multiple numbers detected: Click to split into individual lines
                    </button>
                  )}
                </div>

                {/* Extra Helplines */}
                {settings.extra_helpline_mobiles && settings.extra_helpline_mobiles.map((extraNum, idx) => (
                  <div
                    key={`extra-tel-${idx}`}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>Helpline Line #{idx + 2}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                          ALTERNATE
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(settings.extra_helpline_mobiles || [])];
                          updated.splice(idx, 1);
                          setSettings({ ...settings, extra_helpline_mobiles: updated });
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={extraNum}
                        onChange={(e) => {
                          const updated = [...(settings.extra_helpline_mobiles || [])];
                          updated[idx] = e.target.value;
                          setSettings({ ...settings, extra_helpline_mobiles: updated });
                        }}
                        className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                        placeholder="e.g. +91 91771 10026"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Helpline Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      extra_helpline_mobiles: [...(settings.extra_helpline_mobiles || []), ''],
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 hover:border-amber-500 text-amber-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-101 active:scale-99"
                >
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>+ Add Alternate Calling Line</span>
                </button>
              </div>

              {/* 2. WHATSAPP SUPPORT DESKS (EMERALD THEME) */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 rounded-3xl p-5 border border-emerald-200/90 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2.5 text-emerald-950 font-black text-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                    </div>
                    <span>WhatsApp Chat Desks</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/90 text-emerald-950 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {(settings.whatsapp_number?.trim() ? 1 : 0) + (settings.extra_whatsapp_numbers?.filter((s) => s.trim()).length || 0)} Chat Desks
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  Direct 1-click WhatsApp support chat links with prefilled templates for fast order assistance.
                </p>

                {/* Primary WhatsApp Desk */}
                <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <span>Primary WhatsApp (Desk 1)</span>
                      <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">
                        PRIMARY
                      </span>
                    </label>
                    {settings.whatsapp_number && (
                      <a
                        href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>Test Chat</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="relative">
                    <WhatsAppIcon className="w-4 h-4 fill-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                      placeholder="e.g. 919493239009 (digits with country code)"
                    />
                  </div>
                </div>

                {/* Extra WhatsApp Desks */}
                {settings.extra_whatsapp_numbers && settings.extra_whatsapp_numbers.map((extraWa, idx) => (
                  <div
                    key={`extra-wa-${idx}`}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>WhatsApp Desk #{idx + 2}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                          ALTERNATE
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(settings.extra_whatsapp_numbers || [])];
                          updated.splice(idx, 1);
                          setSettings({ ...settings, extra_whatsapp_numbers: updated });
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="relative">
                      <WhatsAppIcon className="w-4 h-4 fill-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={extraWa}
                        onChange={(e) => {
                          const updated = [...(settings.extra_whatsapp_numbers || [])];
                          updated[idx] = e.target.value.replace(/\D/g, '');
                          setSettings({ ...settings, extra_whatsapp_numbers: updated });
                        }}
                        className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                        placeholder="e.g. 919177110026"
                      />
                    </div>
                  </div>
                ))}

                {/* Add WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      extra_whatsapp_numbers: [...(settings.extra_whatsapp_numbers || []), ''],
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-white hover:bg-emerald-100/60 border border-dashed border-emerald-300 hover:border-emerald-500 text-emerald-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-101 active:scale-99"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>+ Add Alternate WhatsApp Desk</span>
                </button>
              </div>
            </div>

            {/* LIVE STOREFRONT CUSTOMER INTERACTION PREVIEW */}
            {(previewHelplines.length > 0 || previewWhatsapps.length > 0) && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span>Customer Storefront Live Support Preview</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    Separate Click-to-Action Pills
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {previewHelplines.map((entry, i) => (
                    <div
                      key={`prev-call-${i}`}
                      className="flex items-center gap-2 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900 shadow-2xs hover:border-amber-500 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] text-amber-900 font-bold">{entry.label}:</span>
                      <span className="font-mono text-xs font-bold text-slate-900">{entry.display}</span>
                    </div>
                  ))}

                  {previewWhatsapps.map((entry, i) => (
                    <div
                      key={`prev-wa-${i}`}
                      className="flex items-center gap-2 px-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-black text-slate-900 shadow-2xs hover:border-emerald-500 transition-colors"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                      <span className="text-[10px] text-emerald-800 font-bold">{entry.label}:</span>
                      <span className="font-mono text-xs font-bold text-emerald-950">{entry.display}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: DELIVERY THRESHOLDS & SAFETY LIMITS */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'delivery') && (
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
                    <span>Minimum Order Delivery Thresholds &amp; Safety Limits</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                      Regional Rules
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Enforce minimum cart values required for freight logistics viability and optional maximum cart caps.
                  </p>
                </div>
              </div>
            </div>

            {/* Minimum Order Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. South India Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-100/20 to-white border border-amber-300/90 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-950 text-sm block">
                      South India Minimum Order
                    </span>
                    <span className="text-[11px] text-amber-900 font-bold">
                      Tamil Nadu, Kerala, Karnataka, Andhra, Telangana, Puducherry
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-950 bg-amber-200/80 px-2.5 py-1 rounded-xl">
                    Zone: South
                  </span>
                </div>

                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    required
                    value={settings.min_order_tamil_nadu}
                    onChange={(e) =>
                      setSettings({ ...settings, min_order_tamil_nadu: Number(e.target.value) })
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-amber-300 rounded-2xl font-black text-slate-950 font-mono text-base focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none shadow-2xs"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Quick Set:</span>
                  {[2500, 3000, 4000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSettings({ ...settings, min_order_tamil_nadu: amt })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        settings.min_order_tamil_nadu === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                          : 'bg-white hover:bg-amber-50 text-slate-700 border-amber-200'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Rest of India Card */}
              <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-950 text-sm block">
                      Rest of India Minimum Order
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      North, East, West &amp; Central Indian States
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-700 bg-slate-200 px-2.5 py-1 rounded-xl">
                    Zone: Rest of India
                  </span>
                </div>

                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    required
                    value={settings.min_order_other_states}
                    onChange={(e) =>
                      setSettings({ ...settings, min_order_other_states: Number(e.target.value) })
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-slate-950 font-mono text-base focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none shadow-2xs"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Quick Set:</span>
                  {[4000, 5000, 6000, 8000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSettings({ ...settings, min_order_other_states: amt })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        settings.min_order_other_states === amt
                          ? 'bg-slate-900 text-white border-slate-900 font-black'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Specific State Minimum Overrides Accordion */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCustomStatesOpen(!isCustomStatesOpen)}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <span>State-Wise Custom Minimum Overrides</span>
                  {customOverrideCount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold border border-emerald-300">
                      {customOverrideCount} state overrides active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      (Optional: override rules for specific states)
                    </span>
                  )}
                </div>
                {isCustomStatesOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isCustomStatesOpen && (
                <div className="p-4 bg-white border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Indian states (e.g. Maharashtra, Gujarat, Delhi)..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-amber-500 shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                    {filteredStates.map((stateName) => {
                      const customVal = settings.state_min_order_overrides?.[stateName];
                      const isSouthState = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry'].includes(stateName);
                      return (
                        <div
                          key={stateName}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            customVal
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                              : isSouthState
                              ? 'bg-amber-50/40 border-amber-200/80'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-bold text-slate-800 truncate pr-2 text-xs">
                            {stateName}
                          </span>

                          <div className="relative w-24 shrink-0">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">₹</span>
                            <input
                              type="number"
                              min={500}
                              step={100}
                              placeholder={String(isSouthState ? (settings.min_order_tamil_nadu || 4000) : settings.min_order_other_states)}
                              value={customVal ?? ''}
                              onChange={(e) => handleStateOverrideChange(stateName, e.target.value)}
                              className="w-full pl-5 pr-2 py-1 text-right text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Maximum Order Limit Safety Guard */}
            <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold border border-slate-200 shadow-2xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      Maximum Order Amount Cap
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Prevents bulk carts exceeding safe lorry transport thresholds.
                    </p>
                  </div>
                </div>

                {/* Animated iOS Toggle */}
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-extrabold ${settings.max_order_limit_enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {settings.max_order_limit_enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, max_order_limit_enabled: !settings.max_order_limit_enabled })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.max_order_limit_enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.max_order_limit_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {settings.max_order_limit_enabled ? (
                <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={settings.max_order_limit_amount}
                      onChange={(e) =>
                        setSettings({ ...settings, max_order_limit_amount: Number(e.target.value) })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl font-black text-slate-950 font-mono text-sm focus:border-amber-500 focus:outline-none shadow-2xs"
                      placeholder="50000"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold">Presets:</span>
                    {[25000, 50000, 100000, 200000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSettings({ ...settings, max_order_limit_amount: preset })}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          settings.max_order_limit_amount === preset
                            ? 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        ₹{preset.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium">
                  Currently, customers may checkout carts of any order size without an upper limit cap.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: ANNOUNCEMENTS & STOREFRONT TICKER */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'announcements') && (
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
                    <span>Storefront Top Announcement Ticker</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                      Store Header Top
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    High-visibility festive announcement banner rendered at the topmost strip of the entire storefront.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-800 font-extrabold text-xs">
                Top Announcement Ticker Message
              </label>
              <input
                type="text"
                value={settings.announcement_banner}
                onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
                className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-950 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                placeholder="⚡ DIWALI PRE-BOOKING OPEN: Get up to 80% OFF Factory Direct Rates!"
              />
            </div>

            {/* Live Storefront Ticker Preview */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
                Live Storefront Appearance:
              </span>
              <div className="p-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl text-xs font-black tracking-wide flex items-center justify-between shadow-xs overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <span className="animate-pulse text-base">⚡</span>
                  <span className="truncate">
                    {settings.announcement_banner || '⚡ DIWALI PRE-BOOKING OPEN: Get up to 80% OFF Factory Direct Rates!'}
                  </span>
                </div>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md font-mono shrink-0 hidden sm:inline">
                  LIVE STOREFRONT TICKER
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: INVOICING, GSTIN & LEGAL BILL DETAILS */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'billing') && (
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
                    <span>Invoicing, Bill Address &amp; Official GSTIN</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                      Printed on Bills
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Legal tax identification and physical dispatch address printed on official customer invoices &amp; packing slips.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Form Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Store Address */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-extrabold text-xs">
                      Official Invoice Bill Address
                    </label>
                    <span className="text-[10px] text-amber-800 font-black bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Printed on Invoices
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={settings.store_address}
                    onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                    placeholder="e.g. 4/128, Sivakasi Main Road, Sivakasi, Virudhunagar Dist, Tamil Nadu - 626123"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl p-3.5 text-slate-950 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all leading-relaxed shadow-2xs"
                  />
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Rendered in the invoice letterhead and the storefront footer.
                  </span>
                </div>

                {/* GSTIN Number */}
                <div className="space-y-1.5">
                  <label className="block text-slate-800 font-extrabold text-xs">
                    GSTIN Tax Identification Number
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.gstin}
                      onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-slate-950 font-mono font-black uppercase text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none shadow-2xs"
                      placeholder="e.g. 33AAAFF9012K1Z5"
                    />
                  </div>
                </div>

                {/* Catalog Discount Banner Link */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Active Global Festive Discount: {settings.discount_percentage}% OFF
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Applied sitewide to all product MRP strike-through pricing.
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/admin/discount"
                    className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs rounded-xl border border-amber-300 transition-colors shadow-2xs"
                  >
                    Adjust %
                  </Link>
                </div>
              </div>

              {/* Realistic Mock Packing Slip / Invoice Preview (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Packing Slip / Invoice Header Preview</span>
                  </span>
                  <span className="text-[9px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded">
                    Print Layout
                  </span>
                </div>

                {/* Simulated Thermal / Letterhead Paper */}
                <div className="bg-white rounded-xl border border-slate-300 p-4 font-mono text-[11px] space-y-2 shadow-2xs">
                  <div className="text-center border-b border-dashed border-slate-300 pb-2.5">
                    <h4 className="font-black text-sm text-slate-950 uppercase tracking-wider">
                      {settings.store_name || 'VASU CRACKERS'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {settings.tagline || 'Direct Factory Fireworks Outlet'}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {settings.store_address || '4/128, Main Road, Sivakasi, Tamil Nadu'}
                    </p>
                    {settings.gstin && (
                      <p className="text-[10px] font-bold text-slate-800">
                        GSTIN: {settings.gstin}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Ph: {SettingsService.getCombinedHelplineString(settings) || '+91 94932 39009'}
                    </p>
                  </div>

                  <div className="text-center pt-1 text-[10px] text-slate-400">
                    ═══════ INVOICE / PACKING SLIP ═══════
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-medium text-center">
                  This header prints on customer A4 invoices and 4-inch packing slips.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SAVE COMMAND BAR (DESKTOP) */}
        <div className="hidden sm:flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-lg">
              Ctrl+S
            </kbd>
            <span>Keyboard shortcut active for instant saving</span>
            {isDirty && (
              <span className="text-amber-600 font-bold ml-2">● You have unsaved edits</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Discard Edits
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Save className="w-4 h-4 text-slate-950" />
              )}
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </button>
          </div>
        </div>

        {/* FLOATING ACTION BAR FOR MOBILE / STICKY ON UNSAVED */}
        {isDirty && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-40 bg-slate-950/95 backdrop-blur-md text-white p-3 sm:px-5 sm:py-3 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold text-amber-200">Unsaved changes</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Revert
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                )}
                <span>Save (Ctrl+S)</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
