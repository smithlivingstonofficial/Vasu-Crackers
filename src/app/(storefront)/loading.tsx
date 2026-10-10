import React from 'react';
import Image from 'next/image';
import { Sparkles, Flame, Factory } from 'lucide-react';

export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background festive glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md w-full text-center">
        {/* Logo Card with Festive Border & Drop Shadow */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-rose-500/30 to-amber-500/30 rounded-3xl blur-2xl animate-pulse pointer-events-none" />
          
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl shadow-amber-500/15 flex flex-col items-center justify-center min-w-[200px]">
            <Image
              src="/Vasu Crackers Firework Emblem.png"
              alt="Vasu Crackers"
              width={200}
              height={130}
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-md mb-2"
              priority
              unoptimized
            />
            <span className="font-heading font-black text-slate-900 text-sm tracking-tight">VASU CRACKERS</span>

            {/* Sparkle badge */}
            <div className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>

            {/* Flame badge */}
            <div className="absolute -bottom-2.5 -left-2.5 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-pulse">
              <Flame className="w-4 h-4 fill-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 text-[11px] font-black uppercase tracking-wider mb-1">
            <Factory className="w-3.5 h-3.5 text-amber-700" />
            <span>Direct Factory Wholesale</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
            VASU CRACKERS
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Loading 2026 Fresh Cracker Catalog &amp; Wholesale Rates...
          </p>
        </div>

        {/* Sleek Animated Progress Bar */}
        <div className="w-56 sm:w-64 h-2 bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner border border-slate-200">
          <div className="absolute inset-y-0 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 rounded-full w-4/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
