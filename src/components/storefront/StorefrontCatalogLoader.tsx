'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Flame, Factory } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';

export const StorefrontCatalogLoader: React.FC = () => {
  const { settings } = useStoreSettings();
  const logoUrl = settings?.logo_url || '/Vasu Crackers Firework Emblem.png';
  const storeName = settings?.store_name || 'Vasu Crackers';

  return (
    <div className="space-y-4 font-sans animate-in fade-in duration-300">
      {/* 1. ANIMATED BRAND EMBLEM CARD */}
      <div className="bg-white rounded-3xl border border-amber-500/20 p-6 sm:p-10 text-center shadow-md relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-500/15 via-orange-500/15 to-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Main Logo Container with Ambient Glow */}
          <div className="relative mb-5 flex flex-col items-center justify-center">
            {/* Ambient Pulsing Halo */}
            <div className="absolute -inset-3 bg-gradient-to-r from-amber-400/25 via-red-500/25 to-amber-500/25 rounded-3xl blur-xl animate-pulse pointer-events-none" />

            {/* Logo Card with Badges */}
            <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-amber-300/80 shadow-xl shadow-amber-500/10 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${storeName} Logo`}
                  width={280}
                  height={180}
                  priority
                  unoptimized
                  className="h-16 sm:h-24 w-auto max-w-[200px] sm:max-w-[300px] object-contain drop-shadow-md"
                />
              ) : (
                <div className="h-14 sm:h-18 px-4 flex items-center justify-center gap-2 text-amber-600 font-black text-lg sm:text-xl">
                  <span>🎆</span>
                  <span>{storeName.toUpperCase()}</span>
                </div>
              )}

              {/* Sparkle badge */}
              <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-bounce">
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </div>

              {/* Flame badge */}
              <div className="absolute -bottom-2.5 -left-2.5 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md animate-pulse">
                <Flame className="w-4 h-4 fill-white" />
              </div>
            </div>
          </div>

          {/* Heading & Subtext */}
          <div className="space-y-1 max-w-md mx-auto mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/80 text-[11px] font-black uppercase tracking-wider mb-1">
              <Factory className="w-3.5 h-3.5 text-amber-700" />
              <span>Direct Factory Wholesale</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-slate-900 font-heading tracking-tight">
              Loading Fireworks Catalog...
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Fetching direct factory wholesale rates &amp; 2026 fresh cracker inventory from Sivakasi
            </p>
          </div>

          {/* Sleek Animated Progress Bar */}
          <div className="w-56 sm:w-72 h-2 bg-slate-100 rounded-full overflow-hidden relative shadow-inner border border-slate-200/60">
            <div className="absolute inset-y-0 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 rounded-full w-4/5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. REALISTIC SHIMMER SKELETON RATE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Banner Skeleton */}
        <div className="vasu-gradient-banner shine-sweep relative px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 animate-pulse" />
            <div className="h-4 bg-white/30 rounded w-32 sm:w-44 animate-pulse" />
          </div>
          <div className="h-4 bg-white/20 rounded-full w-14 animate-pulse" />
        </div>

        {/* Table Header Skeleton */}
        <div className="bg-slate-100 border-b border-slate-200 py-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-400">
          <div className="w-8 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-24 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-12 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-12 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-10 h-3 bg-slate-200 rounded animate-pulse" />
          <div className="w-12 h-3 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Rows Skeleton */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 animate-pulse">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div
                  className="h-3.5 bg-slate-200/80 rounded"
                  style={{ width: `${55 + (i % 3) * 18}%` }}
                />
                <div className="h-2.5 bg-slate-100 rounded w-20" />
              </div>
              <div className="w-10 sm:w-14 h-3.5 bg-rose-50 rounded shrink-0" />
              <div className="w-10 sm:w-14 h-4 bg-slate-200/80 rounded shrink-0" />
              <div className="w-8 sm:w-12 h-7 bg-slate-100 border border-slate-200/60 rounded shrink-0" />
              <div className="w-10 sm:w-14 h-3.5 bg-slate-200/60 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
