'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Volume2,
  ShoppingBag,
  Sparkles,
  Check,
} from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { cart, addToCart } = useCart();
  const [qtyInput, setQtyInput] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    setQtyInput(1);
    setAddedSuccess(false);
  }, [product]);

  if (!product) return null;

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;

  const discountPercent =
    product.mrp > 0 && product.mrp > product.selling_price
      ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
      : 0;

  const savingsPerBox = Math.max(0, product.mrp - product.selling_price);
  const totalPayable = product.selling_price * qtyInput;

  const isOutOfStock =
    (product.stock !== undefined && product.stock <= 0) || product.is_active === false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, qtyInput);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Image */}
          <div className="relative w-full aspect-[16/10] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
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
                product.image_url ? 'object-cover' : 'object-contain p-2'
              }`}
            />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
              {discountPercent > 0 && (
                <span className="bg-gradient-to-r from-rose-600 to-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg uppercase shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
              {product.is_best_seller && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" /> Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-800 font-bold text-xs px-2.5 py-0.5 rounded-md">
                {product.pack_size || '1 Box'}
              </span>
              {product.sound_level && (
                <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-amber-600" /> {product.sound_level}
                </span>
              )}
            </div>

            <h2 className="font-extrabold text-slate-950 text-base sm:text-lg font-heading leading-tight">
              {product.name}
            </h2>

            {product.description && (
              <p className="text-slate-600 text-xs leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Pricing Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-black text-2xl text-slate-950 font-mono">
                  ₹{product.selling_price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.selling_price && (
                  <span className="text-sm text-red-600 line-through decoration-red-400 font-mono font-bold">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {savingsPerBox > 0 && (
                <span className="text-xs font-bold text-emerald-600">
                  Save ₹{savingsPerBox.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Stepper and Add to Cart */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {currentInCart > 0 && (
              <div className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span>In Cart:</span>
                <span className="font-mono font-black">{currentInCart} {currentInCart === 1 ? 'Box' : 'Boxes'}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setQtyInput((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 font-black flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-black text-sm text-slate-950 font-mono">
                  {qtyInput}
                </span>
                <button
                  type="button"
                  onClick={() => setQtyInput((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white text-slate-800 font-black flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'vasu-gradient-gold hover:brightness-105 text-slate-950 font-extrabold shadow-sm glow-gold shine-gold-sweep'
                }`}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added {qtyInput} to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-slate-950" />
                    <span>Add to Cart • ₹{totalPayable.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
