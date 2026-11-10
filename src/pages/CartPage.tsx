import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleItemSelection,
  selectAllItems,
  addToCart,
  selectCartSubtotal,
  selectSelectedCartSubtotal,
  selectCartDiscount,
  selectCartShippingFee,
  selectCartTotal,
  selectSelectedCartTotal,
} from '../features/cart/cartSlice';
import { addToast } from '../features/ui/uiSlice';
import {
  ShoppingCart,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Info,
  ShoppingBag,
  Star,
  Sparkles,
} from 'lucide-react';

interface RecommendedProduct {
  id: string;
  name: string;
  subtitle: string;
  sku: string;
  price: number;
  originalPrice: number;
  discountBadge: string;
  rating: number;
  reviewsCount: string;
  image: string;
}

const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: 'rec-airpods-pro-2',
    name: 'AirPods Pro 2',
    subtitle: 'Premium Wireless Earbuds',
    sku: 'APP2-REC',
    price: 24990,
    originalPrice: 29990,
    discountBadge: '-17%',
    rating: 4.8,
    reviewsCount: '12k reviews',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'rec-samsung-galaxy-s25',
    name: 'Samsung Galaxy S25',
    subtitle: 'Next Gen Smartphone',
    sku: 'SGS25-REC',
    price: 79990,
    originalPrice: 89990,
    discountBadge: '-11%',
    rating: 4.7,
    reviewsCount: '10k reviews',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'rec-smart-watch-series-10',
    name: 'Smart Watch Series 10',
    subtitle: 'Smart Watch',
    sku: 'SWS10-REC',
    price: 11990,
    originalPrice: 14990,
    discountBadge: '-20%',
    rating: 4.7,
    reviewsCount: '8k reviews',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'rec-bluetooth-speaker',
    name: 'Bluetooth Speaker',
    subtitle: 'Portable Stereo Sound',
    sku: 'BTS-REC',
    price: 3999,
    originalPrice: 4999,
    discountBadge: '-20%',
    rating: 4.6,
    reviewsCount: '7k reviews',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'rec-backpack',
    name: 'Backpack',
    subtitle: 'Ergonomic Travel Bag',
    sku: 'BP-REC',
    price: 2999,
    originalPrice: 3999,
    discountBadge: '-25%',
    rating: 4.6,
    reviewsCount: '6k reviews',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
];

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Financial calculations
  const totalSubtotal = useAppSelector(selectCartSubtotal);
  const selectedSubtotal = useAppSelector(selectSelectedCartSubtotal);
  const effectiveSubtotal = selectedSubtotal > 0 ? selectedSubtotal : totalSubtotal;

  const totalAmount = useAppSelector((state) => selectCartTotal(state, 'Dhaka'));
  const selectedTotal = useAppSelector((state) => selectSelectedCartTotal(state, 'Dhaka'));
  const effectiveTotal = selectedSubtotal > 0 ? selectedTotal : totalAmount;

  const [activeSlide, setActiveSlide] = useState(1);

  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected !== false);

  const handleToggleSelectAll = () => {
    dispatch(selectAllItems(!allSelected));
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'Cart is empty',
          message: 'Add items to your cart before proceeding to checkout.',
        })
      );
      return;
    }
    navigate('/checkout');
  };

  const handleAddRecommended = (prod: RecommendedProduct) => {
    dispatch(
      addToCart({
        productId: prod.id,
        name: prod.name,
        subtitle: prod.subtitle,
        sku: prod.sku,
        price: prod.price,
        originalPrice: prod.originalPrice,
        quantity: 1,
        image: prod.image,
        stock: 50,
      })
    );
    dispatch(
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${prod.name} has been added to your shopping cart.`,
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      {/* 1. Dynamic Hero Banner matching Aurelia_Blue_Shopping_Cart_Page_4ded16c4.png */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#032d69] via-[#0b48a3] to-[#1264df] text-white py-10 sm:py-14">
        {/* Decorative backdrop shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-cyan-300 blur-3xl"></div>
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 300">
            <path d="M0,150 C300,250 800,50 1200,180 L1200,300 L0,300 Z" fill="rgba(255,255,255,0.05)" />
            <path d="M0,80 C400,20 700,200 1200,60 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.03)" />
          </svg>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : 3))}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10 backdrop-blur-xs"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev < 3 ? prev + 1 : 0))}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10 backdrop-blur-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-0 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Text Content */}
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 border border-cyan-300/40 text-cyan-200 text-xs font-semibold shadow-inner">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Your Shopping Cart</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-3">
              Review Your Cart
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 font-normal mt-2 leading-relaxed">
              Make sure everything is perfect before checkout.
            </p>

            {/* Pagination Dots matching reference */}
            <div className="flex items-center justify-center md:justify-start gap-2 mt-6">
              {[0, 1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  onClick={() => setActiveSlide(dot)}
                  aria-label={`Slide ${dot + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    dot === activeSlide ? 'w-6 bg-white shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right 3D Cart Illustration matching reference */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* 3D Shopping Cart Artwork */}
            <div className="relative w-64 sm:w-80 h-48 sm:h-56 flex items-center justify-center">
              {/* Glow podium backdrop */}
              <div className="absolute inset-x-4 bottom-2 h-16 bg-blue-400/20 rounded-full blur-xl"></div>

              {/* Speech bubble "Happy Shopping! 💙" */}
              <div className="absolute -top-2 right-4 bg-white text-slate-800 px-4 py-2 rounded-2xl shadow-xl shadow-blue-950/20 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 animate-bounce z-20 border border-blue-100">
                <span className="text-blue-600">Happy</span>
                <span>Shopping!</span>
                <span>💙</span>
                {/* Speech tail */}
                <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white transform rotate-45 border-r border-b border-blue-100"></div>
              </div>

              {/* Shopping Cart Body with Blue Bags */}
              <div className="relative z-10 flex flex-col items-center">
                {/* 3D Wire Cart with Metallic Blue Shading */}
                <div className="relative">
                  {/* Shopping Bags nestled inside cart */}
                  <div className="absolute -top-12 left-6 flex items-end gap-1 z-10">
                    <div className="w-10 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-lg shadow-md flex items-center justify-center">
                      <div className="w-4 h-2 border-2 border-white rounded-t-full -mt-10"></div>
                    </div>
                    <div className="w-14 h-20 bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-lg shadow-lg flex items-center justify-center">
                      <div className="w-6 h-3 border-2 border-white rounded-t-full -mt-12"></div>
                    </div>
                    <div className="w-9 h-14 bg-gradient-to-b from-sky-300 to-blue-500 rounded-t-lg shadow-md flex items-center justify-center">
                      <div className="w-4 h-2 border-2 border-white rounded-t-full -mt-8"></div>
                    </div>
                  </div>

                  {/* Wire mesh cart representation */}
                  <div className="w-44 sm:w-52 h-28 border-4 border-slate-200/90 rounded-2xl bg-gradient-to-tr from-white/10 to-white/30 backdrop-blur-md shadow-2xl relative flex items-center justify-center">
                    <div className="absolute inset-2 border-2 border-dashed border-white/40 rounded-xl"></div>
                    <ShoppingCart className="w-16 h-16 text-white drop-shadow-md opacity-90" />
                  </div>

                  {/* Wheels and Base */}
                  <div className="flex justify-between px-6 -mt-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-blue-600 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-blue-600 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Layout (Cart Items Table + Order Summary) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header Bar matching reference: Deep Blue background with "Your Cart" and amber total */}
              <div className="bg-gradient-to-r from-[#032e6a] via-[#083e8c] to-[#0d50b8] px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleSelectAll}
                    title="Select all items"
                    className="w-5 h-5 rounded-md border border-white/60 flex items-center justify-center transition-colors bg-white/10 hover:bg-white/20"
                  >
                    {allSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-200" />
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Your Cart <span className="font-normal text-blue-200">({cartItems.length} items)</span>
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm text-blue-200 mr-2 font-medium">Total:</span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">
                    ৳{effectiveSubtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Your cart is currently empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Check out our trending products below and start shopping with exclusive discounts.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => {
                    const isSelected = item.selected !== false;
                    const itemTotal = item.price * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                          isSelected ? 'bg-white' : 'bg-slate-50/70 opacity-75'
                        }`}
                      >
                        {/* Checkbox, Thumbnail & Details */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Checkbox matching reference image */}
                          <button
                            onClick={() => dispatch(toggleItemSelection(item.id))}
                            aria-label={`Select ${item.name}`}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Thumbnail */}
                          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                {item.name}
                              </h3>
                              <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 shrink-0" />
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {item.subtitle || 'Premium Gadget'}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                ৳{item.price.toLocaleString()}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                In Stock
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper, Item Total & Red Trash Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Stepper matching reference */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold text-sm"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-9 text-center text-xs font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold text-sm"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Total Price */}
                          <div className="min-w-[90px] text-right font-black text-slate-900 text-base sm:text-lg">
                            ৳{itemTotal.toLocaleString()}
                          </div>

                          {/* Trash button in circular rose background matching reference */}
                          <button
                            onClick={() => {
                              dispatch(removeFromCart(item.id));
                              dispatch(
                                addToast({
                                  type: 'info',
                                  title: 'Item Removed',
                                  message: `${item.name} was removed from your cart.`,
                                })
                              );
                            }}
                            aria-label={`Remove ${item.name}`}
                            className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Actions Bar matching reference */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your entire cart?')) {
                      dispatch(clearCart());
                    }
                  }}
                  disabled={cartItems.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Cart
                </button>

                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) matching reference */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-24">
              {/* Header */}
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="text-base font-bold">📄</span>
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Summary</h2>
              </div>

              {/* Rows */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-900">৳{effectiveSubtotal.toLocaleString()}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      Shipping Fee
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <span className="font-extrabold text-slate-900">৳0</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Free Shipping</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">Total Amount</span>
                  <span className="font-black text-2xl text-slate-900">
                    ৳{effectiveTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <div className="text-center text-xs text-slate-400 font-medium">or</div>

                <Link
                  to="/shop"
                  className="w-full border border-slate-200 hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-600" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Section: "You May Also Like" 5-product grid matching reference */}
        <section className="mt-14 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">You May Also Like</h2>
            </div>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View More</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {RECOMMENDED_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/50 hover:shadow-md transition-all p-4 flex flex-col justify-between group"
              >
                {/* Top Badge */}
                <div className="relative">
                  <span className="absolute top-0 left-0 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    {prod.discountBadge}
                  </span>

                  {/* Product Image */}
                  <div className="w-full h-36 flex items-center justify-center my-3 p-2">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm truncate">{prod.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-700">{prod.rating}</span>
                    <span className="text-[10px] text-slate-400">({prod.reviewsCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-black text-sm text-slate-900">৳{prod.price.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ৳{prod.originalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => handleAddRecommended(prod)}
                    className="w-full mt-3 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
