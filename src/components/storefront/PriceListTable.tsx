'use client';

import React, { useMemo } from 'react';
import {
  Eye,
  Check,
  Volume2,
  Flower2,
  RotateCw,
  Zap,
  Flame,
  Bomb,
  Rocket,
  Pencil,
  Gift,
  Package,
  Moon,
  Star,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';

interface PriceListTableProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  onQuickView?: (product: Product) => void;
}

export function CategoryIcon({ name, className = 'w-4 h-4 text-white' }: { name: string; className?: string }) {
  const lower = name.toLowerCase();
  if (lower.includes('sound')) return <Volume2 className={className} />;
  if (lower.includes('flower') || lower.includes('pot')) return <Flower2 className={className} />;
  if (lower.includes('chakkara') || lower.includes('ground') || lower.includes('wheel')) return <RotateCw className={className} />;
  if (lower.includes('bijili')) return <Zap className={className} />;
  if (lower.includes('lar') || lower.includes('garland')) return <Flame className={className} />;
  if (lower.includes('bomb')) return <Bomb className={className} />;
  if (lower.includes('rocket')) return <Rocket className={className} />;
  if (lower.includes('pencil') || lower.includes('candle')) return <Pencil className={className} />;
  if (lower.includes('kutties') || lower.includes('kid') || lower.includes('special')) return <Gift className={className} />;
  if (lower.includes('match') || lower.includes('box')) return <Package className={className} />;
  if (lower.includes('night') || lower.includes('color')) return <Moon className={className} />;
  if (lower.includes('new') || lower.includes('arrival')) return <Star className={className} />;
  if (lower.includes('shot') || lower.includes('fancy') || lower.includes('amazing')) return <Sparkles className={className} />;
  if (lower.includes('sparkler')) return <Sparkles className={className} />;
  return <Sparkles className={className} />;
}

function formatPrice(val: number): string {
  return Number.isInteger(val) ? `₹${val.toLocaleString('en-IN')}` : `₹${val.toFixed(2)}`;
}

function formatPiecesCount(packSize?: string): string {
  if (!packSize) return '';
  const trimmed = packSize.trim();
  if (!trimmed) return '';
  if (/^\d+$/.test(trimmed)) {
    return `${trimmed}\u00A0Pcs`;
  }
  return trimmed.replace(/\s+/g, '\u00A0');
}

export const PriceListTable: React.FC<PriceListTableProps> = ({
  products,
  categories,
  selectedCategory,
  searchQuery,
  onQuickView,
}) => {
  const { cart, updateQuantity } = useCart();

  // Map product id -> quantity in cart
  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cart]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.is_active === false) return false;

      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: { category: { id: string; name: string }; items: Product[] }[] = [];
    const catMap = new Map<string, Product[]>();

    filteredProducts.forEach((p) => {
      const catId = p.category_id || 'uncategorized';
      if (!catMap.has(catId)) catMap.set(catId, []);
      catMap.get(catId)!.push(p);
    });

    categories.forEach((cat) => {
      const items = catMap.get(cat.id);
      if (items && items.length > 0) {
        groups.push({ category: cat, items });
      }
    });

    const uncat = catMap.get('uncategorized');
    if (uncat && uncat.length > 0) {
      groups.push({ category: { id: 'uncategorized', name: 'Other Fireworks' }, items: uncat });
    }

    return groups;
  }, [filteredProducts, categories]);

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center shadow-2xs space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center text-xl font-bold border border-amber-200">
          <Sparkles className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="font-black text-slate-900 text-sm">No fireworks found</h3>
        <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">
          No products matched your search. Try clearing your search keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 font-sans">
      {groupedProducts.map((group) => {
        // Calculate category cart stats
        let catItemCount = 0;
        let catSubtotal = 0;
        group.items.forEach((item) => {
          const qty = cartQtyMap.get(item.id) || 0;
          if (qty > 0) {
            catItemCount += qty;
            catSubtotal += item.selling_price * qty;
          }
        });

        return (
          <div
            key={group.category.id}
            id={`cat-${group.category.id}`}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden"
          >
            {/* CATEGORY BANNER (ALWAYS EXPANDED, NO COLLAPSE) */}
            <div className="vasu-gradient-banner shine-sweep relative text-white px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-xs border-b border-amber-300/40 select-none">
              <div className="flex items-center gap-2.5 min-w-0 z-10">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                  <CategoryIcon name={group.category.name} className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-white font-heading truncate drop-shadow-xs">
                  {group.category.name}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0 z-10">
                {catItemCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>
                      {catItemCount} in Cart (₹{catSubtotal.toLocaleString('en-IN')})
                    </span>
                  </span>
                )}

                <span className="bg-black/25 backdrop-blur-md text-amber-200 border border-amber-300/40 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 sparkle-icon shrink-0" />
                  <span>{group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}</span>
                </span>
              </div>
            </div>

            {/* TABLE CONTENT */}
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-left text-xs border-collapse">
                {/* TABLE HEADER */}
                <thead>
                  <tr className="bg-slate-50/90 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] sm:text-xs border-b border-slate-200/80 select-none">
                    <th className="w-[36px] sm:w-[50px] py-2.5 px-1 text-center border-r border-slate-200/50 text-slate-500">
                      IMG
                    </th>
                    <th className="py-2.5 px-2 sm:px-3.5 border-r border-slate-200/50 text-left text-slate-800">
                      PRODUCT
                    </th>
                    <th className="w-[48px] sm:w-[80px] py-2.5 px-1 sm:px-2 text-right border-r border-slate-200/50 text-slate-500">
                      MRP
                    </th>
                    <th className="w-[50px] sm:w-[85px] py-2.5 px-1 sm:px-2 text-right border-r border-slate-200/50 text-slate-950">
                      RATE
                    </th>
                    <th className="w-[56px] sm:w-[90px] py-2.5 px-1 text-center border-r border-slate-200/50 text-slate-700">
                      QTY
                    </th>
                    <th className="w-[52px] sm:w-[90px] py-2.5 px-1 sm:px-2 text-right text-slate-950">
                      TOTAL
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>
                  {group.items.map((product) => {
                    const qty = cartQtyMap.get(product.id) || 0;
                    const itemTotal = product.selling_price * qty;
                    const isOutOfStock =
                      (product.stock !== undefined && product.stock <= 0) ||
                      product.is_active === false;
                    const pieces = formatPiecesCount(product.pack_size);
                    const showPieces =
                      pieces && !product.name.toLowerCase().includes(pieces.toLowerCase());

                    return (
                      <tr
                        key={product.id}
                        className={`border-b transition-colors ${qty > 0
                            ? 'bg-amber-50/70 hover:bg-amber-50/90 border-l-4 border-l-amber-500 border-b-amber-200/60 shadow-2xs'
                            : 'bg-white hover:bg-amber-50/20 border-b-slate-100'
                          }`}
                      >
                        {/* 1. IMG */}
                        <td className="w-[36px] sm:w-[50px] py-2 px-1 text-center border-r border-slate-200/50 align-middle">
                          <div
                            onClick={() => onQuickView && onQuickView(product)}
                            className="relative w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-xl overflow-hidden border border-slate-200/80 shrink-0 cursor-pointer mx-auto group shadow-2xs hover:border-amber-500 transition-colors"
                            title="Click to view photo"
                          >
                            <img
                              src={product.image_url || '/placeholder-product.png'}
                              alt={product.name}
                              width={40}
                              height={40}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.endsWith('/placeholder-product.png')) {
                                  target.src = '/placeholder-product.png';
                                }
                              }}
                              className={`w-full h-full ${product.image_url ? 'object-cover' : 'object-contain'
                                } group-hover:scale-110 transition-transform duration-200`}
                            />
                            <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3 h-3 drop-shadow" />
                            </div>
                          </div>
                        </td>

                        {/* 2. PRODUCT */}
                        <td className="py-2 px-2 sm:px-3.5 border-r border-slate-200/50 align-middle">
                          <span
                            onClick={() => onQuickView && onQuickView(product)}
                            className="font-bold text-slate-900 text-xs sm:text-sm hover:text-amber-600 transition-colors cursor-pointer leading-tight line-clamp-2 block break-words"
                            title={`${product.name}${showPieces ? ` (${pieces})` : ''}`}
                          >
                            <span>{product.name}</span>
                            {showPieces && (
                              <span className="font-medium text-slate-500 text-[10px] sm:text-xs ml-1 inline-block">
                                ({pieces})
                              </span>
                            )}
                          </span>
                        </td>

                        {/* 3. MRP */}
                        <td className="w-[48px] sm:w-[80px] py-2 px-1 sm:px-2 text-right border-r border-slate-200/50 font-mono text-xs sm:text-sm text-red-600 line-through decoration-red-400 font-bold align-middle whitespace-nowrap">
                          {formatPrice(product.mrp)}
                        </td>

                        {/* 4. RATE */}
                        <td className="w-[50px] sm:w-[85px] py-2 px-1 sm:px-2 text-right border-r border-slate-200/50 font-mono text-xs sm:text-base font-black text-slate-950 align-middle whitespace-nowrap">
                          {formatPrice(product.selling_price)}
                        </td>

                        {/* 5. QTY (Warm amber highlight matching cart stepper) */}
                        <td className="w-[56px] sm:w-[90px] py-2 px-1 text-center border-r border-slate-200/50 align-middle">
                          {isOutOfStock ? (
                            <span className="text-red-600 font-bold text-[9px] sm:text-xs uppercase tracking-tight leading-none block">
                              Sold Out
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (qty > 0) updateQuantity(product.id, qty - 1, product);
                                }}
                                className="hidden sm:flex w-6 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 items-center justify-center font-bold active:scale-95 transition-all cursor-pointer border border-slate-200/60"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={qty === 0 ? '' : qty.toString()}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                  if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/\D/g, '');
                                  if (clean === '') {
                                    updateQuantity(product.id, 0, product);
                                  } else {
                                    const num = parseInt(clean, 10);
                                    updateQuantity(product.id, isNaN(num) ? 0 : Math.max(0, num), product);
                                  }
                                }}
                                className={`w-9 sm:w-11 h-7 sm:h-8 text-center text-xs sm:text-sm rounded-xl outline-none transition-all block p-0 font-mono font-black ${qty > 0
                                    ? 'bg-amber-100/90 text-amber-950 border-2 border-amber-500 shadow-xs ring-2 ring-amber-400/20'
                                    : 'bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-400 placeholder:text-slate-300'
                                  }`}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  updateQuantity(product.id, qty + 1, product);
                                }}
                                className="hidden sm:flex w-6 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 items-center justify-center font-black active:scale-95 transition-all cursor-pointer shadow-xs"
                                aria-label="Increase"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* 6. TOTAL (Amber gold matching Cart Grand Total) */}
                        <td className="w-[52px] sm:w-[90px] py-2 px-1 sm:px-2 text-right align-middle whitespace-nowrap">
                          <span
                            className={`font-mono text-xs sm:text-sm block ${itemTotal > 0 ? 'text-amber-600 font-black' : 'text-slate-300 font-medium'
                              }`}
                          >
                            {formatPrice(itemTotal)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
