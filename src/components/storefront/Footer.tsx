'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Clock, Phone } from 'lucide-react';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { SettingsService } from '@/lib/services/settings.service';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const Footer: React.FC = () => {
  const { settings } = useStoreSettings();

  const helplineList = useMemo(() => {
    return SettingsService.getHelplineNumbers(settings);
  }, [settings]);

  const whatsappList = useMemo(() => {
    return SettingsService.getWhatsAppNumbers(settings);
  }, [settings]);

  const storeAddress = settings?.store_address?.trim() || '';
  const storeName = settings?.store_name || 'Vasu Crackers';

  return (
    <footer className="bg-slate-100 text-slate-600 text-xs border-t border-slate-200 font-sans">
      {/* Compact Features Row */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-slate-800">Direct Factory Rates</span>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-slate-800">Safe Doorstep Delivery</span>
        </div>

        {/* WhatsApp Quick Feature */}
        {whatsappList.length > 0 ? (
          <a
            href={`https://wa.me/${whatsappList[0].cleanWa}?text=${encodeURIComponent(`Hi ${storeName}, I have an enquiry.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-emerald-700 transition-colors group"
          >
            <WhatsAppIcon className="w-4 h-4 fill-emerald-600 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800 block truncate leading-tight">WhatsApp Support</span>
              <span className="text-[10px] text-emerald-700 font-mono block">
                {whatsappList[0].display} {whatsappList.length > 1 ? `(+${whatsappList.length - 1})` : ''}
              </span>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-800">WhatsApp Copy Share</span>
          </div>
        )}

        {/* Helpline Quick Feature */}
        {helplineList.length > 0 ? (
          <a
            href={`tel:${helplineList[0].cleanTel}`}
            className="flex items-center gap-2 hover:text-amber-600 transition-colors group"
          >
            <Phone className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800 block truncate leading-tight">Direct Helpline</span>
              <span className="text-[10px] text-slate-500 font-mono block">
                {helplineList[0].display} {helplineList.length > 1 ? `(+${helplineList.length - 1})` : ''}
              </span>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-800">Direct Sivakasi Outlet</span>
          </div>
        )}
      </div>

      {/* Main Footer Links & Support Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Col 1: Brand & Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            {(settings?.logo_url || '/Vasu Crackers Firework Emblem.png') ? (
              <Image
                src={settings?.logo_url || '/Vasu Crackers Firework Emblem.png'}
                alt={`${storeName} Logo`}
                width={48}
                height={32}
                unoptimized
                className="h-7 w-auto max-w-[44px] object-contain"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs shadow-xs shrink-0">
                ✨
              </div>
            )}
            <span className="font-black text-sm text-slate-950">
              {storeName.toUpperCase()}
            </span>
          </div>
          {storeAddress ? (
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {storeAddress}
            </p>
          ) : null}
          {settings?.gstin?.trim() ? (
            <span className="inline-block text-[10px] font-mono font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded border border-slate-300/80">
              GSTIN: {settings.gstin.trim()}
            </span>
          ) : null}
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-2.5">
            Quick Navigation
          </span>
          <div className="flex flex-col space-y-2 text-xs font-bold text-slate-700">
            <Link href="/" className="hover:text-amber-600 transition-colors">Storefront Catalog</Link>
            <Link href="/#catalog" className="hover:text-amber-600 transition-colors">Fireworks Price List</Link>
            <Link href="/track-order" className="hover:text-amber-600 transition-colors">Track Order Status</Link>
          </div>
        </div>

        {/* Col 3: Dedicated Helpline Numbers (Calling) */}
        <div>
          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>Customer Helplines</span>
          </span>
          {helplineList.length > 0 ? (
            <div className="space-y-1.5">
              {helplineList.map((item, idx) => (
                <a
                  key={`foot-tel-${idx}`}
                  href={`tel:${item.cleanTel}`}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium leading-none">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 group-hover:text-amber-600">
                      {item.display}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">Direct Sivakasi Assistance</p>
          )}
        </div>

        {/* Col 4: Dedicated WhatsApp Support Desks */}
        <div>
          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
            <span>WhatsApp Desks</span>
          </span>
          {whatsappList.length > 0 ? (
            <div className="space-y-1.5">
              {whatsappList.map((item, idx) => (
                <a
                  key={`foot-wa-${idx}`}
                  href={`https://wa.me/${item.cleanWa}?text=${encodeURIComponent(`Hi ${storeName}, I have an enquiry.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-emerald-100/60 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="w-3 h-3 fill-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-700 block font-medium leading-none">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-950 group-hover:text-emerald-700">
                      {item.display}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">24/7 Enquiry Service</p>
          )}

          <div className="mt-3 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-200">
            Minimum Orders: South India: ₹4,000 | Other States: ₹{settings?.min_order_other_states?.toLocaleString('en-IN') ?? '5,000'}
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-slate-200 border-t border-slate-300 py-3 text-center text-[11px] text-slate-500 font-medium">
        © 2026 {storeName}. All Rights Reserved.
      </div>
    </footer>
  );
};
