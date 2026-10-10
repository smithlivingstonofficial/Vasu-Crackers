'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  MapPin,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Menu,
  X,
  Home,
  Package,
  ChevronRight,
  Phone,
  ListFilter,
  LayoutGrid,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { SettingsService } from '@/lib/services/settings.service';
import { Category, DeliveryZone } from '@/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCart: () => void;
  categories?: Category[];
  zones?: DeliveryZone[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCart,
  categories = [],
  zones = [],
  viewMode = 'list',
  onViewModeChange,
}) => {
  const { itemCount, subtotal, selectedZone, setSelectedZone, minOrderThreshold, isMinOrderReached } = useCart();
  const { settings } = useStoreSettings();

  const storeName = settings?.store_name?.trim() || 'Vasu Crackers';
  const tagline = settings?.tagline?.trim() || 'Direct Factory Outlet • Sivakasi, Tamil Nadu';
  const storeAddress = settings?.store_address?.trim() || '';
  const announcement = settings?.announcement_banner || '⚡ DIWALI PRE-BOOKING OPEN: Sivakasi Factory Direct Rates!';
  const logoUrl = settings?.logo_url || '/Vasu Crackers Firework Emblem.png';

  const helplineList = useMemo(() => {
    return SettingsService.getHelplineNumbers(settings);
  }, [settings]);

  const whatsappList = useMemo(() => {
    return SettingsService.getWhatsAppNumbers(settings);
  }, [settings]);

  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showSupportDropdown, setShowSupportDropdown] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Deduplicate delivery zones by zone_name
  const uniqueZones = useMemo(() => {
    const map = new Map<string, DeliveryZone>();
    zones.forEach((z) => {
      const key = z.zone_name.toLowerCase().trim();
      if (!map.has(key)) map.set(key, z);
    });
    return Array.from(map.values());
  }, [zones]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-sans">

        {/* Main Responsive Brand Header */}
        <div className="px-3 sm:px-4 py-2.5 max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Two-Tone Brand Title with Logo & Sivakasi Direct Pill Badge */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${storeName} Logo`}
                width={48}
                height={32}
                priority
                unoptimized
                className="h-8 sm:h-9 w-auto max-w-[48px] sm:max-w-[54px] object-contain shrink-0 transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm sm:text-base shadow-xs shrink-0 transition-transform group-hover:scale-105">
                ✨
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg tracking-tight font-heading whitespace-nowrap">
                {(() => {
                  const parts = (storeName || 'Vasu Crackers').split(' ');
                  if (parts.length > 1) {
                    const first = parts[0];
                    const rest = parts.slice(1).join(' ');
                    return (
                      <>
                        <span className="font-extrabold text-slate-900">{first.toUpperCase()}</span>{' '}
                        <span className="font-black text-amber-600">{rest.toUpperCase()}</span>
                      </>
                    );
                  }
                  return <span className="font-extrabold text-slate-900">{(storeName || 'Vasu Crackers').toUpperCase()}</span>;
                })()}
              </span>

              {/* Direct Pill Badge */}
              <span className="hidden sm:inline-flex items-center justify-center bg-amber-100/90 text-amber-900 font-extrabold text-[9px] px-2 py-0.5 rounded-md border border-amber-300/80 uppercase tracking-widest whitespace-nowrap">
                Sivakasi Direct
              </span>
            </div>
          </Link>

          {/* Right Cart & Region & Mobile Menu Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Region Picker Button (Desktop/Tablet) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowZonePicker(!showZonePicker)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[11px] text-slate-700 font-bold cursor-pointer transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[90px]">{selectedZone.zone_name}</span>
              </button>

              {showZonePicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-extrabold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Region
                  </div>
                  {uniqueZones.map((zone: DeliveryZone) => (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowZonePicker(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex flex-col transition-colors cursor-pointer ${selectedZone.id === zone.id
                          ? 'bg-amber-500/15 text-amber-900 font-bold border border-amber-300'
                          : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <span>{zone.zone_name}</span>
                      <span className="text-[10px] text-slate-500">Min Order: ₹{zone.min_order_amount.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Support & Helpline Dropdown (Desktop/Tablet) */}
            {(helplineList.length > 0 || whatsappList.length > 0) && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowSupportDropdown(!showSupportDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-bold cursor-pointer transition-colors"
                  title="Contact Helplines & WhatsApp"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>Support</span>
                  <ChevronDown className={`w-3 h-3 text-emerald-700 transition-transform ${showSupportDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSupportDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 space-y-2">
                    <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Direct Customer Support
                      </span>
                      <button
                        onClick={() => setShowSupportDropdown(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Helplines */}
                    {helplineList.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-bold text-amber-900 uppercase px-1 block">Calling Lines:</span>
                        {helplineList.map((item, idx) => (
                          <a
                            key={`top-tel-${idx}`}
                            href={`tel:${item.cleanTel}`}
                            onClick={() => setShowSupportDropdown(false)}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-950 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400 block">{item.label}</span>
                                <span className="font-mono text-xs font-bold truncate block">{item.display}</span>
                              </div>
                            </div>
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded shrink-0">Call</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* WhatsApps */}
                    {whatsappList.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <span className="text-[9.5px] font-bold text-emerald-900 uppercase px-1 block">WhatsApp Desks:</span>
                        {whatsappList.map((item, idx) => (
                          <a
                            key={`top-wa-${idx}`}
                            href={`https://wa.me/${item.cleanWa}?text=${encodeURIComponent(`Hi ${storeName}, I have an enquiry regarding fireworks.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowSupportDropdown(false)}
                            className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] text-emerald-700 block">{item.label}</span>
                                <span className="font-mono text-xs font-bold text-emerald-950 truncate block">{item.display}</span>
                              </div>
                            </div>
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">Chat</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart CTA */}
            <button
              onClick={onOpenCart}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer relative ${isMinOrderReached
                  ? 'vasu-gradient-gold text-slate-950 shadow-xs hover:brightness-105 glow-gold shine-gold-sweep'
                  : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                }`}
            >
              <div className="relative z-10">
                <ShoppingBag className="w-4 h-4 text-slate-950" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold font-mono z-10">₹{subtotal.toLocaleString()}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SINGLE ROW TOOLBAR: Animated Expanding Search + Category Filter Dropdown */}
        <div className="px-3 sm:px-4 py-1.5 max-w-7xl mx-auto flex items-center justify-between gap-2 border-t border-slate-100 relative">
          {/* Animated Expanding Search Input Box */}
          <div
            className={`relative transition-all duration-300 ease-out flex-1 min-w-0 ${isSearchFocused ? 'z-20 shadow-xs' : 'z-10'
              }`}
          >
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search sparklers, pots..."
              className={`w-full border border-slate-200/80 text-slate-900 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:outline-none transition-all placeholder:text-slate-400 font-medium ${isSearchFocused || searchQuery
                  ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-2xs'
                  : 'bg-slate-100/90 hover:bg-slate-100'
                }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 font-bold bg-slate-200/60 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative shrink-0 flex items-center gap-1.5">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`flex items-center justify-between gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${selectedCategory !== 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200/80'
                }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span className="truncate max-w-[85px] sm:max-w-[140px]">
                  {selectedCategory === 'all'
                    ? 'Category'
                    : categories.find((c: Category) => c.id === selectedCategory)?.name || 'Category'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* View Mode Toggle (Rate Card vs Visual Grid) */}
            {onViewModeChange && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  title="Rate Card Table View"
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${viewMode === 'list'
                      ? 'bg-white text-slate-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rate Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('grid')}
                  title="Visual Grid View"
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${viewMode === 'grid'
                      ? 'bg-white text-slate-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Visual Grid</span>
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCategoryDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1.5 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                    <span>Select Category</span>
                    <span className="text-[9px] text-amber-600 font-bold">{categories.length} Total</span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${selectedCategory === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <span>All Categories</span>
                  </button>

                  {categories.map((cat: Category) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PORTAL-RENDERED MOBILE NAVIGATION DRAWER */}
      {isMobileMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9998] flex justify-end font-sans">
          {/* Full Screen Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in z-[9998]"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel Sheet */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full min-h-screen shadow-2xl z-[9999] flex flex-col justify-between p-4 animate-in slide-in-from-right duration-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`${storeName} Logo`}
                      width={48}
                      height={32}
                      unoptimized
                      className="h-7 w-auto max-w-[44px] object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs shadow-xs shrink-0">
                      ✨
                    </div>
                  )}
                  <span className="text-base tracking-tight font-heading whitespace-nowrap">
                    {(() => {
                      const parts = (storeName || 'Vasu Crackers').split(' ');
                      if (parts.length > 1) {
                        const first = parts[0];
                        const rest = parts.slice(1).join(' ');
                        return (
                          <>
                            <span className="font-extrabold text-slate-900">{first.toUpperCase()}</span>{' '}
                            <span className="font-black text-amber-600">{rest.toUpperCase()}</span>
                          </>
                        );
                      }
                      return <span className="font-extrabold text-slate-900">{(storeName || 'Vasu Crackers').toUpperCase()}</span>;
                    })()}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5 text-xs font-bold">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-500/10 text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-amber-600" />
                    <span>Home &amp; Shop</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/track-order"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-amber-500/10 text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>Track Your Order</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Shop Contact & Enquiry Info Section */}
              {(helplineList.length > 0 || whatsappList.length > 0 || storeAddress) ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Shop Contact &amp; Support:
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                      Direct Sivakasi
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                    {/* All Helpline Mobile Lines */}
                    {helplineList.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-amber-900 font-extrabold uppercase tracking-wide block px-1">
                          Direct Calling Lines:
                        </span>
                        {helplineList.map((item, idx) => (
                          <a
                            key={`drawer-tel-${idx}`}
                            href={`tel:${item.cleanTel}`}
                            className="flex items-center justify-between p-2.5 bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-400 block font-normal">{item.label}</span>
                                  {item.isPrimary && (
                                    <span className="text-[8.5px] bg-amber-100 text-amber-900 font-extrabold px-1 rounded border border-amber-200">
                                      Main
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-amber-900">{item.display}</span>
                              </div>
                            </div>
                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                              Call Now
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* All WhatsApp Support Desks */}
                    {whatsappList.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] text-emerald-900 font-extrabold uppercase tracking-wide block px-1">
                          WhatsApp Support Desks:
                        </span>
                        {whatsappList.map((item, idx) => (
                          <a
                            key={`drawer-wa-${idx}`}
                            href={`https://wa.me/${item.cleanWa}?text=${encodeURIComponent(`Hi ${storeName}, I have an enquiry regarding fireworks.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-emerald-700 block font-normal">{item.label}</span>
                                  {item.isPrimary && (
                                    <span className="text-[8.5px] bg-emerald-200/80 text-emerald-900 font-extrabold px-1 rounded border border-emerald-300">
                                      Desk 1
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-xs font-bold text-emerald-950">{item.display}</span>
                              </div>
                            </div>
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-lg shrink-0 shadow-2xs">
                              Chat
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Address in Bill (Printed on Bill & Site) */}
                    {storeAddress ? (
                      <div className="flex items-start gap-2.5 p-2.5 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs shadow-2xs pt-1 border-t border-slate-200/60">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-slate-400 block font-normal">Warehouse &amp; Bill Address</span>
                            <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300/80">Bill Address</span>
                          </div>
                          <p className="text-[11px] text-slate-700 font-medium leading-relaxed mt-0.5">
                            {storeAddress}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Floating Logo - Display only when custom site logo is configured */}
            {logoUrl ? (
              <div className="my-auto py-3 flex items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                  <Image
                    src={logoUrl}
                    alt={`${storeName} Brand Logo`}
                    width={180}
                    height={180}
                    unoptimized
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.30)]"
                    priority
                  />
                </div>
              </div>
            ) : null}

            {/* Footer Contact Info & Address */}
            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1 mt-2">
              <span className="font-bold text-slate-800 block">{storeName}</span>
              {storeAddress ? <p className="text-slate-600 text-[11px] leading-relaxed">{storeAddress}</p> : null}
              {tagline ? <span className="block text-slate-400 text-[10px]">{tagline}</span> : null}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
