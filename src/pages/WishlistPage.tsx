import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  removeFromWishlist,
  clearWishlist,
  selectWishlistItems,
  selectWishlistCount,
  WishlistItem,
} from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { addToast } from '../features/ui/uiSlice';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  ArrowRight,
  Package,
  Gift,
  ShoppingBag,
} from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(selectWishlistItems);
  const wishlistCount = useAppSelector(selectWishlistCount);

  const handleAddToCart = (item: WishlistItem) => {
    dispatch(
      addToCart({
        productId: item.productId,
        name: item.name,
        subtitle: item.category || 'Lifestyle',
        sku: `WL-${item.slug.toUpperCase()}`,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: 1,
        image: item.image,
        stock: 50,
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${item.name} has been added to your shopping cart.`,
      })
    );
  };

  const handleRemoveItem = (item: WishlistItem) => {
    dispatch(removeFromWishlist(item.productId));
    dispatch(
      addToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${item.name} was removed from your wishlist.`,
      })
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      dispatch(clearWishlist());
      dispatch(
        addToast({
          type: 'info',
          title: 'Wishlist Cleared',
          message: 'All items have been removed from your wishlist.',
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* 1. Dynamic Hero Banner matching Aurelia_Wishlist_Shopping_Page_98a0194a.png */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#032e6a] via-[#0947a1] to-[#1264df] text-white py-12 sm:py-16">
        {/* Soft abstract luminous background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-cyan-300 blur-3xl"></div>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 300">
            <path d="M0,150 C300,250 800,50 1200,180 L1200,300 L0,300 Z" fill="rgba(255,255,255,0.06)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-0 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Text */}
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/25 border border-cyan-300/40 text-cyan-200 text-xs font-semibold shadow-inner">
              <span>Save Your Favorite Items</span>
              <span>💙</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mt-3">
              My <span className="text-cyan-300">Wishlist</span>
            </h1>

            <p className="text-base sm:text-lg text-blue-100 font-normal mt-2 leading-relaxed">
              Keep track of the products you love.
            </p>
          </div>

          {/* Right 3D Floating Illustrations: Heart Speech Bubble, Bag & Gift Box */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-64 sm:w-80 h-44 flex items-center justify-center">
              {/* Soft glow base */}
              <div className="absolute -bottom-2 inset-x-8 h-10 bg-blue-400/20 rounded-full blur-xl"></div>

              {/* Heart Speech Bubble */}
              <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center -mr-4 -mt-6 border border-blue-50 transform -rotate-6">
                <Heart className="w-9 h-9 text-blue-600 fill-blue-600" />
                {/* Speech tail */}
                <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white transform rotate-45"></div>
              </div>

              {/* Blue Shopping Bag with Heart */}
              <div className="relative z-20 w-24 h-32 bg-gradient-to-b from-sky-400 to-blue-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-white/20">
                <div className="w-10 h-7 border-3 border-white/90 rounded-t-full -mt-12 mb-1"></div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-5 h-5 text-blue-600 fill-blue-600" />
                </div>
              </div>

              {/* Wrapped Gift Box with Ribbon */}
              <div className="relative z-30 w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-2xl border-2 border-white -ml-4 mt-6 flex items-center justify-center">
                <div className="absolute inset-x-0 h-3 bg-white/80 top-1/2 -translate-y-1/2"></div>
                <div className="absolute inset-y-0 w-3 bg-white/80 left-1/2 -translate-x-1/2"></div>
                <Gift className="w-8 h-8 text-white z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Wishlist Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Wishlist Header Bar matching reference */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💙</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Wishlist{' '}
              <span className="font-semibold text-slate-500 text-lg">
                ({wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'})
              </span>
            </h2>
          </div>

          <button
            onClick={handleClearAll}
            disabled={wishlistCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Wishlist</span>
          </button>
        </div>

        {/* 4-Column Product Grid matching reference image */}
        {wishlistCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all p-4 flex flex-col justify-between group"
              >
                {/* Top Badge & Heart Action */}
                <div className="relative">
                  {item.discountBadge && (
                    <span className="absolute top-0 left-0 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {item.discountBadge}
                    </span>
                  )}

                  {/* Heart Toggle Button */}
                  <button
                    onClick={() => handleRemoveItem(item)}
                    title="Remove from wishlist"
                    className="absolute top-0 right-0 w-8 h-8 rounded-full border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors shadow-2xs"
                  >
                    <Heart className="w-4 h-4 fill-blue-600 text-blue-600" />
                  </button>

                  {/* Centered Product Photo */}
                  <div className="w-full h-44 flex items-center justify-center my-4 p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-base text-center truncate">
                    {item.name}
                  </h3>

                  {/* Star Rating */}
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-extrabold text-slate-700">{item.rating || 4.7}</span>
                    <span className="text-[11px] text-slate-400">
                      ({item.reviewCount || '10k reviews'})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline justify-center gap-2 pt-1">
                    <span className="font-black text-lg text-blue-700">
                      ৳{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ৳{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons: Add to Cart (large) + Trash (square) */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item)}
                      title="Remove"
                      className="w-10 h-10 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl flex items-center justify-center transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* 3. Empty Wishlist State Banner matching reference */}
        <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/70 border border-blue-100 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
          {/* Subtle background shopping bag silhouettes */}
          <div className="absolute inset-0 pointer-events-none opacity-5 flex justify-between items-center px-12">
            <ShoppingBag className="w-48 h-48 -ml-12" />
            <ShoppingBag className="w-48 h-48 -mr-12" />
          </div>

          {/* Left Icon + Text */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {wishlistCount === 0 ? 'Your wishlist is empty!' : 'Want to discover more products?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
                Start adding products to your wishlist and keep track of your favorite items anytime.
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="relative z-10 shrink-0">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
