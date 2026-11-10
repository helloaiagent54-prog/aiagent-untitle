import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { Product, Category } from '../types';
import { useAppDispatch } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';
import { addToast } from '../features/ui/uiSlice';
import { PublicAdvertisement } from '../components/public/PublicAdvertisement';
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Star,
  ShoppingCart,
  X,
  Search,
  Check,
} from 'lucide-react';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active filters from query params
  const categoryParam = searchParams.get('category') || 'all';
  const brandParam = searchParams.get('brand') || '';
  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  useEffect(() => {
    // Fetch categories
    apiRequest('/categories').then((res) => {
      if (res.success && res.categories) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    apiRequest(`/products?${params.toString()}`).then((res) => {
      setIsLoading(false);
      if (res.success) {
        setProducts(res.products || []);
        setTotalCount(res.pagination?.total || 0);
        if (res.availableBrands) setAvailableBrands(res.availableBrands);
      }
    });
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: product.salePrice,
        originalPrice: product.basePrice > product.salePrice ? product.basePrice : undefined,
        quantity: 1,
        image: product.images?.[0] || '',
        stock: product.stock,
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name} (৳${product.salePrice.toLocaleString()}) added to your bag.`,
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">
              {categoryParam !== 'all' ? categoryParam : queryParam ? `Search: "${queryParam}"` : 'All Products'}
            </span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {categoryParam !== 'all'
              ? `${categoryParam.toUpperCase()}`
              : queryParam
              ? `Results for "${queryParam}"`
              : 'Explore Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Showing {totalCount} authentic products available for delivery</p>
        </div>

        {/* Sort and mobile filter toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filters
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Sort by:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Best Selling & Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </div>
            <button onClick={clearAllFilters} className="text-xs text-blue-600 hover:underline">
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categories</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  categoryParam === 'all'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateParam('category', cat.name)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors ${
                    categoryParam.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-slate-400">{cat.liveCount || cat.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          {availableBrands.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Brands</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => updateParam('brand', brandParam === brand ? '' : brand)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors ${
                      brandParam === brand ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{brand}</span>
                    {brandParam === brand && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Price (BDT ৳)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ৳"
                value={minPriceParam}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max ৳"
                value={maxPriceParam}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* PLP Sidebar Advertisement */}
          <PublicAdvertisement placement="plp_sidebar" variant="sidebar" className="mt-6" />
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {/* PLP Top Advertisement Banner */}
          <PublicAdvertisement placement="plp_top" className="mb-6" />

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                  <div className="w-full aspect-square bg-slate-100 rounded-xl" />
                  <div className="w-2/3 h-4 bg-slate-100 rounded" />
                  <div className="w-1/3 h-4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected criteria. Try adjusting your search keywords or clearing
                filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-300 shadow-xs hover:shadow-lg transition-all p-3.5 flex flex-col justify-between cursor-pointer relative"
                >
                  {product.badge && (
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md z-10 text-white bg-blue-600">
                      {product.badge}
                    </span>
                  )}

                  <div className="w-full aspect-square rounded-xl bg-slate-50 mb-3 overflow-hidden flex items-center justify-center">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-800">{product.rating}</span>
                      <span className="text-[10px] text-slate-400">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-blue-700 tabular-nums">
                        ৳{product.salePrice.toLocaleString()}
                      </span>
                      {product.basePrice > product.salePrice && (
                        <span className="text-[10px] text-slate-400 line-through tabular-nums">
                          ৳{product.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Categories</h4>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    updateParam('category', c.name);
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-full text-left py-1.5 text-xs text-slate-700"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
