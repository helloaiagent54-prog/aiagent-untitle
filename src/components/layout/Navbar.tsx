import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCartUniqueLinesCount } from '../../features/cart/cartSlice';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice';
import { AccountPopup } from './AccountPopup';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Phone,
  Mail,
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  ChevronDown,
  Sparkles,
  X,
  Package,
} from 'lucide-react';
import { apiRequest } from '../../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartUniqueCount = useAppSelector(selectCartUniqueLinesCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch categories for "All Categories ▾" dropdown
  useEffect(() => {
    apiRequest('/categories').then((res) => {
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    });
  }, []);

  // Debounced search suggestions query (max 8 suggestions per Section 13)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      apiRequest(`/products/suggestions?q=${encodeURIComponent(searchQuery)}`).then((res) => {
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
          setShowSuggestions(true);
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search container to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. Top Announcement Bar (Faithfully matching reference image) */}
      <div className="bg-[#002244] text-white text-[11px] font-medium py-1.5 px-4 sm:px-8 border-b border-blue-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left features */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              Free Shipping on Orders Over ৳1,000
            </span>
            <span className="hidden sm:flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              30 Days Easy Return
            </span>
            <span className="hidden md:flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Secure Payment
            </span>
          </div>

          {/* Right contact & language */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:+8801234567890" className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
              <Phone className="w-3 h-3 text-blue-400" />
              +880 1234 567890
            </a>
            <a href="mailto:support@aurelia.com" className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
              <Mail className="w-3 h-3 text-blue-400" />
              support@aurelia.com
            </a>
            <span className="flex items-center gap-1 opacity-90 cursor-pointer hover:text-blue-300">
              EN <ChevronDown className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Logo matching reference */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-blue-700 leading-none block">
              Aurelia
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block">
              Shop Smart, Live Better
            </span>
          </div>
        </Link>

        {/* Search Bar with Autocomplete Dropdown (Centered, exactly as in image) */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search for products, electronics, books (e.g. iPhone, মোটিভেশনাল বই)..."
              className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors shadow-xs"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Bounded Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Matching Suggestions
              </div>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(item.slug)}
                  className="px-3.5 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-blue-700 tabular-nums">
                        ৳{item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through tabular-nums">
                          ৳{item.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Icons: My Account, Wishlist, Cart */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* My Account with required popup */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-50"
            >
              <User className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline">My Account</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <AccountPopup isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
          </div>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors relative py-1.5 px-1.5"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-slate-700" />
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            </div>
            <span className="hidden sm:inline">Wishlist</span>
          </Link>

          {/* Cart with mandatory unique lines count badge */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors relative py-1.5 px-1.5"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartUniqueCount}
              </span>
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Mobile search input */}
      <div className="px-4 pb-2 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          />
          <button type="submit" className="absolute right-1 px-3 py-1 bg-blue-600 text-white rounded text-xs">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 3. Royal Blue Navigation Bar (Matching reference) */}
      <div className="bg-[#1677ff] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center">
            {/* "All Categories ▾" dropdown button */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="bg-[#0958d9] hover:bg-[#003eb3] text-white text-xs font-bold py-3 px-5 flex items-center gap-2 transition-colors uppercase tracking-wider"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute left-0 top-full w-64 bg-white text-slate-800 rounded-b-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat._id || cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setIsCategoryMenuOpen(false)}
                      className="px-4 py-2 hover:bg-blue-50 text-xs font-medium text-slate-700 hover:text-blue-700 flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400">({cat.liveCount || cat.itemCount}+)</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Main navigation links */}
            <nav className="hidden lg:flex items-center text-xs font-semibold">
              <Link to="/" className="py-3 px-4 hover:bg-blue-600/80 transition-colors">
                Home
              </Link>
              <Link to="/shop" className="py-3 px-4 hover:bg-blue-600/80 transition-colors flex items-center gap-1">
                Shop <ChevronDown className="w-3 h-3 opacity-80" />
              </Link>
              <Link to="/shop" className="py-3 px-4 hover:bg-blue-600/80 transition-colors flex items-center gap-1">
                Categories <ChevronDown className="w-3 h-3 opacity-80" />
              </Link>
              <Link to="/shop?sort=newest" className="py-3 px-4 hover:bg-blue-600/80 transition-colors">
                New Arrivals
              </Link>
              <Link to="/shop?sort=popular" className="py-3 px-4 hover:bg-blue-600/80 transition-colors">
                Best Sellers
              </Link>
              <Link to="/shop?sort=discount" className="py-3 px-4 hover:bg-blue-600/80 transition-colors">
                Special Offers
              </Link>
              <Link to="/contact" className="py-3 px-4 hover:bg-blue-600/80 transition-colors flex items-center gap-1">
                About Us <ChevronDown className="w-3 h-3 opacity-80" />
              </Link>
            </nav>
          </div>

          {/* Admin link badge */}
          <Link
            to="/admin"
            className="text-[11px] font-bold bg-white/15 hover:bg-white/25 px-3 py-1 rounded-md transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
