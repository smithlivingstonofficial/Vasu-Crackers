'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { QuickAddCard } from '@/components/storefront/QuickAddCard';
import { PriceListTable, CategoryIcon } from '@/components/storefront/PriceListTable';
import { StorefrontCatalogLoader } from '@/components/storefront/StorefrontCatalogLoader';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { Footer } from '@/components/storefront/Footer';
import { Product, Category, DeliveryZone } from '@/types';
import { useCart } from '@/context/CartContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { ProductService } from '@/lib/services/product.service';
import { createClient } from '@/lib/supabase/client';

export default function StorefrontPage() {
  const { settings } = useStoreSettings();

  // Initialize with cached products and categories for instant 0ms first render
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      return ProductService.getCachedProducts() || [];
    }
    return [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      return ProductService.getCachedCategories() || [];
    }
    return [];
  });
  const [zones, setZones] = useState<DeliveryZone[]>(() => {
    if (typeof window !== 'undefined') {
      return ProductService.getCachedDeliveryZones() || [];
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Brand loading state at startup to showcase Vasu Crackers logo
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDbData(force = false) {
      try {
        const [fetchedProducts, fetchedCategories, fetchedZones] = await Promise.all([
          ProductService.getAllProducts({ forceFresh: force }),
          ProductService.getCategories({ forceFresh: force }),
          ProductService.getDeliveryZones({ forceFresh: force }),
        ]);
        if (isMounted) {
          setProducts(fetchedProducts);
          setCategories(fetchedCategories);
          setZones(fetchedZones);
        }
      } catch (e) {
        console.error('Failed to load DB catalog', e);
      } finally {
        if (isMounted) {
          // Smooth transition so the brand logo is cleanly appreciated on initial startup
          setTimeout(() => {
            if (isMounted) {
              setPageLoading(false);
            }
          }, 400);
        }
      }
    }

    // Load 100% fresh data directly from Supabase DB on startup (bypassing any stale cache)
    loadDbData(true);

    const handleCatalogUpdate = () => {
      loadDbData(true);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'vpp_catalog_last_updated' ||
        e.key === 'sfw_store_settings_cache_v2' ||
        e.key === 'sfw_cache_products_all' ||
        e.key === 'sfw_cache_store_settings'
      ) {
        loadDbData(true);
      }
    };

    window.addEventListener('vpp_catalog_updated', handleCatalogUpdate);
    window.addEventListener('sfw_store_settings_updated', handleCatalogUpdate);
    window.addEventListener('vpp_store_settings_updated', handleCatalogUpdate);
    window.addEventListener('storage', handleStorageChange);

    let broadcastChannel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('vpp_catalog_channel');
      broadcastChannel.onmessage = () => {
        loadDbData(true);
      };
    }

    // Supabase Live Postgres Realtime subscription for instant discount & price sync
    const supabase = createClient();
    const liveChannel = supabase
      .channel('storefront_live_catalog_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          loadDbData(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        () => {
          loadDbData(true);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('vpp_catalog_updated', handleCatalogUpdate);
      window.removeEventListener('sfw_store_settings_updated', handleCatalogUpdate);
      window.removeEventListener('vpp_store_settings_updated', handleCatalogUpdate);
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) broadcastChannel.close();
      supabase.removeChannel(liveChannel);
    };
  }, []);

  useEffect(() => {
    try {
      const savedState =
        localStorage.getItem('vasu_crackers_storefront_state_v1') ||
        localStorage.getItem('sivakasi_fireworld_storefront_state_v1') ||
        localStorage.getItem('vaily_pyro_storefront_state_v1');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
        if (parsed.viewMode) setViewMode(parsed.viewMode);
      }
    } catch (e) {
      console.error('Failed to load storefront state from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(
          'vasu_crackers_storefront_state_v1',
          JSON.stringify({ selectedCategory, searchQuery, viewMode })
        );
      } catch (e) {
        console.error('Failed to save storefront state to localStorage', e);
      }
    }
  }, [selectedCategory, searchQuery, viewMode, isLoaded]);

  const { cart, itemCount, subtotal, remainingForMinOrder, isMinOrderReached } = useCart();

  const totalSavings = useMemo(() => {
    return cart.reduce((acc, item) => {
      const diff = Math.max(0, item.product.mrp - item.product.selling_price);
      return acc + diff * item.quantity;
    }, 0);
  }, [cart]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.is_active === false) return false;

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Group filtered products strictly by the existing categories
  const groupedProducts = useMemo(() => {
    const groups: { category: Category | { id: string; name: string }; items: Product[] }[] = [];
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans antialiased text-slate-900">
      <div>
        {/* Sticky App Header */}
        <Header
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCart={() => setIsCartOpen(true)}
          categories={categories}
          zones={zones}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4">
          {/* HERO BANNER (Only from settings when enabled with a custom image) */}
          {settings.hero_banner_enabled && settings.hero_banner_image_url && settings.hero_banner_image_url !== '/hero-banner.webp' && (
            <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-200/90 shadow-2xs group transition-all">
              <a
                href={settings.hero_banner_link_url || '#catalog'}
                className="block relative w-full aspect-[2.1/1] sm:aspect-[2.8/1] overflow-hidden bg-slate-100"
                title={`${settings.store_name} — Price List`}
              >
                <img
                  src={settings.hero_banner_image_url}
                  alt={`${settings.store_name} Banner`}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Browse Price List</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>
              </a>
            </div>
          )}

          {/* MAIN PRODUCT CATALOGUE SECTION */}
          <section id="catalog" className="space-y-3">

            {/* Active Search / Category Filter Badge */}
            {!pageLoading && (searchQuery || selectedCategory !== 'all') && (
              <div className="flex items-center justify-between bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200/80 text-xs font-semibold text-amber-900">
                <div className="flex items-center gap-2 truncate">
                  <span>Showing results for:</span>
                  <span className="font-bold text-slate-900 truncate">
                    {searchQuery ? `"${searchQuery}"` : categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                  <span className="text-[11px] text-amber-700">({filteredProducts.length} items)</span>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px] border border-amber-300 transition-colors cursor-pointer shrink-0 ml-2"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Content states */}
            {pageLoading ? (
              <StorefrontCatalogLoader />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-xl font-bold">
                  🔍
                </div>
                <h3 className="font-black text-slate-900 text-sm font-heading">
                  No fireworks found
                </h3>
                <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">
                  No products matched your search. Try clearing your filter or searching for another keyword.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-2xs transition-all cursor-pointer inline-block"
                >
                  Show All Fireworks
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ✨ VISUAL SHOWCASE GRID */
              <div className="space-y-5">
                {groupedProducts.map((group) => (
                  <div key={group.category.id} className="space-y-2.5">
                    {/* Category Header */}
                    <div className="vasu-gradient-banner shine-sweep relative text-white px-3.5 py-2.5 rounded-2xl flex items-center justify-between shadow-xs border border-amber-300/40 select-none">
                      <div className="flex items-center gap-2 min-w-0 z-10">
                        <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                          <CategoryIcon name={group.category.name} className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="font-extrabold text-xs sm:text-sm tracking-wide uppercase text-white font-heading truncate drop-shadow-xs">
                          {group.category.name}
                        </h2>
                      </div>
                      <span className="bg-black/25 backdrop-blur-md text-amber-200 border border-amber-300/40 font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 sparkle-icon shrink-0" />
                        <span>{group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}</span>
                      </span>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
                      {group.items.map((product) => (
                        <QuickAddCard
                          key={product.id}
                          product={product}
                          onQuickView={(p) => setQuickViewProduct(p)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 📋 SIVAKASI BULK RATE CARD */
              <PriceListTable
                products={products}
                categories={categories}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            )}
          </section>
        </main>
      </div>

      {/* Sticky Bottom Order Summary Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md md:max-w-lg z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-amber-400 p-3 sm:p-3.5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-between gap-3 text-slate-900 font-sans">
            {/* Left Info Column */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] sm:text-[11px] font-black border border-amber-300 shrink-0">
                  <ShoppingBag className="w-3 h-3 text-amber-700" />
                  <span>{itemCount} {itemCount === 1 ? 'Box' : 'Boxes'}</span>
                </span>
                {totalSavings > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Saved ₹{totalSavings.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs text-slate-500 font-medium">Subtotal:</span>
                <span className="text-base sm:text-xl font-black text-slate-950 font-mono tracking-tight">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
                {!isMinOrderReached && remainingForMinOrder > 0 && (
                  <span className="text-[10px] text-amber-700 font-medium truncate ml-1 hidden xs:inline">
                    (Add ₹{remainingForMinOrder.toLocaleString('en-IN')} for min order)
                  </span>
                )}
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all cursor-pointer active:scale-95 border border-slate-200"
              >
                Cart
              </button>

              <Link
                href="/checkout"
                className="px-4 py-2 sm:px-5 sm:py-2.5 vasu-gradient-gold hover:brightness-105 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer glow-gold shine-gold-sweep"
              >
                <span>Order</span>
                <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
