'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Flame,
  Clock,
  Phone,
  Gift,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { Category, DeliveryZone } from '@/types';
import { CategoryIcon } from './PriceListTable';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { SettingsService } from '@/lib/services/settings.service';

interface HeroSectionProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedZone?: DeliveryZone;
  storeName?: string;
  tagline?: string;
  whatsappNumber?: string;
  heroBannerImageUrl?: string;
  heroBannerLinkUrl?: string;
  heroBannerEnabled?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedZone,
  storeName = 'Vasu Crackers',
  tagline = 'Direct Factory Outlet • Sivakasi, Tamil Nadu',
  whatsappNumber = '',
  heroBannerImageUrl,
  heroBannerLinkUrl,
  heroBannerEnabled = true,
}) => {
  const { settings } = useStoreSettings();
  const logoUrl = settings?.logo_url || '/Vasu Crackers Firework Emblem.png';
  const whatsappList = React.useMemo(() => SettingsService.getWhatsAppNumbers(settings), [settings]);
  const cleanWhatsapp = (whatsappNumber || '').replace(/\D/g, '') || whatsappList[0]?.cleanWa || '';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. FESTIVE HERO PROMOTION HERO CARD */}
      {heroBannerEnabled && (
        <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white p-4 sm:p-7 group">
          {/* Subtle Background Lighting Sparks */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              {/* Festive Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/40 text-amber-300 text-xs font-black shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>DIWALI 2026 PRE-BOOKING OPEN</span>
                <span className="bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                  Flat {settings?.discount_percentage || 90}% Off
                </span>
              </div>

              {/* Catchy Headline */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight text-white leading-tight">
                  Authentic Sivakasi Crackers <br />
                  <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                    Direct Factory Rates
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
                  Celebrate this Diwali with premium certified green crackers delivered safely to your doorstep. 
                  Zero middlemen, genuine factory pricing, and nationwide dispatch.
                </p>
              </div>

              {/* Quick Action CTAs */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="#catalog"
                  className="px-4 sm:px-5 py-2.5 vasu-gradient-gold hover:brightness-105 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer glow-gold shine-gold-sweep"
                >
                  <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Order Now</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </a>

                <a
                  href={cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    `Hi ${storeName}, I would like to know more about the Diwali 2026 factory pricing and gift boxes.`
                  )}` : '#catalog'}
                  target={cleanWhatsapp ? "_blank" : undefined}
                  rel={cleanWhatsapp ? "noopener noreferrer" : undefined}
                  className="px-3.5 sm:px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-emerald-400" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </div>

            {/* Right Promo Column */}
            <div className="lg:col-span-5 relative">
              {heroBannerImageUrl && heroBannerImageUrl !== '/hero-banner.webp' ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group/img">
                  <img
                    src={heroBannerImageUrl}
                    alt={`${storeName} Sivakasi Fireworks Promotion`}
                    className="w-full h-44 sm:h-52 object-cover transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-3 sm:p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-amber-400" />
                        Family Gift Boxes Available
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                        2026 Fresh Stock
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-amber-950/50 p-5 sm:p-6 flex flex-col items-center justify-center text-center group/card backdrop-blur-sm">
                  {/* Ambient background light */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center">
                    {logoUrl ? (
                      <div className="w-40 h-28 sm:w-48 sm:h-32 relative flex items-center justify-center mb-2 transition-transform duration-500 group-hover/card:scale-105">
                        <Image
                          src={logoUrl}
                          alt={storeName}
                          width={220}
                          height={147}
                          priority
                          unoptimized
                          className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(245,158,11,0.35)]"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-4xl mb-3 shadow-xl shadow-amber-500/25 border border-amber-300/30">
                        🎇
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Direct Sivakasi Factory Hub</span>
                    </div>
                    <span className="text-xs text-slate-300 font-semibold">
                      100% Genuine Certified Green Fireworks
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TRUST & ASSURANCE BADGES RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 shadow-2xs hover:border-amber-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300/60">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight truncate">
              Direct Factory Rates
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 block truncate">
              Save up to 70% on MRP
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 shadow-2xs hover:border-emerald-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300/60">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight truncate">
              Safe Transport Hubs
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 block truncate">
              Fast Doorstep / Hub pickup
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 shadow-2xs hover:border-red-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-700 flex items-center justify-center shrink-0 border border-red-300/60">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight truncate">
              100% Genuine 2026
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 block truncate">
              Certified green crackers
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3 shadow-2xs hover:border-blue-400 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-700 flex items-center justify-center shrink-0 border border-blue-300/60">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-xs sm:text-sm text-slate-900 block leading-tight truncate">
              Instant Order Tracking
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 block truncate">
              WhatsApp bill copy share
            </span>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CATEGORY QUICK JUMP PILLS */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Explore Categories
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              {categories.length} Categories Available
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
            {/* All Products Tab */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer shadow-2xs ${
                selectedCategory === 'all'
                  ? 'bg-slate-950 text-white shadow-md ring-2 ring-amber-500/50'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${selectedCategory === 'all' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>All Fireworks</span>
            </button>

            {/* Individual Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md ring-2 ring-red-400/50'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <CategoryIcon name={cat.name} className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
