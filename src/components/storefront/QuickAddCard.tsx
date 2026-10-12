'use client';

import React from 'react';
import { Plus, Minus, Volume2, Sparkles, Eye, ShieldCheck, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface QuickAddCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const QuickAddCard: React.FC<QuickAddCardProps> = ({ product, onQuickView }) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const discountPercent =
    product.mrp > 0 && product.mrp > product.selling_price
      ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
      : 0;

  const savingsAmount = Math.max(0, product.mrp - product.selling_price);

  const isOutOfStock =
    (product.stock !== undefined && product.stock <= 0) || product.is_active === false;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQty > 0) {
      updateQuantity(product.id, currentQty - 1);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-xl hover:-translate-y-0.5 card-shine-hover ${
        currentQty > 0
          ? 'border-amber-500/80 bg-amber-50/15 ring-2 ring-amber-400/40 shadow-md'
          : 'border-slate-200/90 hover:border-amber-300'
      }`}
    >
      {/* Product Image Area */}
      <div
        onClick={() => onQuickView && onQuickView(product)}
        className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-50 to-slate-100 cursor-pointer overflow-hidden flex items-center justify-center"
      >
        <img
          src={product.image_url || '/placeholder-product.png'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/placeholder-product.png')) {
              target.src = '/placeholder-product.png';
            }
          }}
          className={`w-full h-full ${
            product.image_url ? 'object-cover' : 'object-contain'
          } group-hover:scale-108 transition-transform duration-500`}
        />

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 bg-[length:200%_auto] animate-gradient-shift text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg uppercase shadow-md tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_best_seller && (
            <span className="vasu-gradient-gold text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 shadow-md">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" /> BESTSELLER
            </span>
          )}
        </div>

        {/* Quick View Hover Pill */}
        <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-slate-950/85 text-white font-bold text-[11px] backdrop-blur-md flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick View</span>
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-lg uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details & Actions */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Pack size & Sound Level */}
          <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-semibold mb-1">
            <span className="truncate max-w-[100px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
              {product.pack_size || '1 Box'}
            </span>
            {product.sound_level && (
              <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.5 rounded-md text-[9px] flex items-center gap-1 font-bold shrink-0">
                <Volume2 className="w-2.5 h-2.5 text-amber-600" />
                {product.sound_level}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView && onQuickView(product)}
            className="font-extrabold text-slate-950 text-xs sm:text-sm leading-snug line-clamp-2 cursor-pointer hover:text-amber-600 transition-colors font-heading"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing & Add/Stepper Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-black text-slate-950 text-base sm:text-lg font-mono tracking-tight">
                ₹{product.selling_price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.selling_price && (
                <span className="text-[11px] text-red-600 line-through decoration-red-400 font-mono font-bold">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {savingsAmount > 0 && (
              <span className="text-[9px] font-extrabold text-emerald-600 truncate">
                Save ₹{savingsAmount.toLocaleString('en-IN')} / box
              </span>
            )}
          </div>

          {/* Stepper Control */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">
                Unavailable
              </span>
            ) : currentQty > 0 ? (
              <div className="flex items-center bg-slate-950 rounded-xl p-0.5 shadow-md border border-amber-500/40">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                  aria-label="Decrease Quantity"
                >
                  <Minus className="w-3 h-3 text-white" />
                </button>
                <span className="w-6 text-center font-black text-xs sm:text-sm text-amber-400 font-mono">
                  {currentQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg vasu-gradient-gold text-slate-950 font-black flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
                  aria-label="Increase Quantity"
                >
                  <Plus className="w-3 h-3 text-slate-950 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleIncrement}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl vasu-gradient-gold hover:brightness-105 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer glow-gold shine-gold-sweep"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ADD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
