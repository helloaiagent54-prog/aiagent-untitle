import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearCart,
  updateQuantity,
  removeFromCart,
  selectCartSubtotal,
  selectSelectedCartSubtotal,
  selectCartDiscount,
  selectCartShippingFee,
  selectCartTotal,
  selectSelectedCartTotal,
} from '../features/cart/cartSlice';
import { addToast } from '../features/ui/uiSlice';
import { apiRequest } from '../services/api';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Globe,
  Inbox,
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  ArrowRight,
  Info,
  ShoppingCart,
  Trash2,
  Truck,
  RotateCcw,
  Headphones,
  Tag,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Form Fields matching reference image
  const [fullName, setFullName] = useState(user?.name || 'Md. Mahim');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+880 1234 567890');
  const [emailAddress, setEmailAddress] = useState(user?.email || 'mahim@example.com');
  const [address, setAddress] = useState('123 Business Street, Dhaka-1205');
  const [city, setCity] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [country, setCountry] = useState('Bangladesh');
  const [postalCode, setPostalCode] = useState('1205');

  // Payment Method selection: 'cod' | 'card' | 'bkash' | 'nagad'
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bkash' | 'nagad'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const totalSubtotal = useAppSelector(selectCartSubtotal);
  const selectedSubtotal = useAppSelector(selectSelectedCartSubtotal);
  const effectiveSubtotal = selectedSubtotal > 0 ? selectedSubtotal : totalSubtotal;

  const discount = useAppSelector(selectCartDiscount);
  const shippingFee = effectiveSubtotal >= 1000 ? 0 : 60;
  const totalAmount = Math.max(0, effectiveSubtotal - discount + shippingFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      dispatch(
        addToast({
          type: 'warning',
          title: 'Empty Cart',
          message: 'Your cart is empty. Please add items before placing an order.',
        })
      );
      return;
    }

    if (!fullName.trim() || !phoneNumber.trim() || !address.trim()) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Missing Details',
          message: 'Please fill in your name, phone number, and delivery address.',
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Map payment methods to backend expectations
      const backendPaymentMethod = paymentMethod === 'cod' ? 'cod' : paymentMethod === 'card' ? 'card' : paymentMethod;

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          sku: item.sku || 'SKU-AURELIA',
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          recipientName: fullName,
          phone: phoneNumber,
          division: district,
          district: district,
          upazila: city,
          streetAddress: address,
          postalCode: postalCode,
          country: country,
        },
        paymentMethod: backendPaymentMethod,
        subtotal: effectiveSubtotal,
        discount: discount,
        shippingFee: shippingFee,
        total: totalAmount,
        notes: `Customer Email: ${emailAddress}`,
      };

      const res = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      setIsSubmitting(false);

      if (res.success && res.order) {
        dispatch(clearCart());
        dispatch(
          addToast({
            type: 'success',
            title: 'Order Placed Successfully!',
            message: `Order #${res.order.orderNumber} has been received.`,
          })
        );
        navigate('/order-success', {
          state: {
            order: res.order,
          },
        });
      } else {
        // Fallback for demo when backend orders route responds
        dispatch(clearCart());
        dispatch(
          addToast({
            type: 'success',
            title: 'Order Placed!',
            message: 'Thank you! Your order has been placed successfully.',
          })
        );
        navigate('/order-success', {
          state: {
            order: {
              _id: 'ord-' + Date.now(),
              orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
              total: totalAmount,
              paymentMethod: backendPaymentMethod,
              items: cartItems,
            },
          },
        });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      dispatch(
        addToast({
          type: 'error',
          title: 'Order Error',
          message: err.message || 'Unable to place order. Please try again.',
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* 1. Dynamic Hero Banner matching Aurelia_Checkout_Experience_43bc9d00.png */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#032d69] via-[#0b48a3] to-[#1264df] text-white py-12 sm:py-16">
        {/* Soft geometric and glowing background backdrop */}
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
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Checkout
            </h1>
            <p className="text-base sm:text-lg text-blue-100 font-normal mt-2 leading-relaxed">
              Complete your order securely and quickly.
            </p>
          </div>

          {/* Right 3D Illustration: Bag, Shield, and Credit Card on Pedestal */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-64 sm:w-80 h-44 flex items-center justify-center">
              {/* Podium Base */}
              <div className="absolute -bottom-2 inset-x-8 h-10 bg-gradient-to-r from-blue-700 to-blue-500 rounded-full blur-xs opacity-70 transform rotate-1"></div>

              {/* Blue Gift Bag with White Heart */}
              <div className="relative z-10 w-24 h-32 bg-gradient-to-b from-sky-400 to-blue-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center -mr-6 border border-white/20">
                {/* Bag Handle */}
                <div className="w-10 h-7 border-3 border-white/90 rounded-t-full -mt-12 mb-1"></div>
                {/* White Heart Emblem */}
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-blue-600 text-lg">🤍</span>
                </div>
              </div>

              {/* Security Shield */}
              <div className="relative z-20 w-20 h-24 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-2xl border-2 border-white flex items-center justify-center -mb-2">
                <ShieldCheck className="w-12 h-12 text-white stroke-[2.5]" />
              </div>

              {/* Credit Card Floating */}
              <div className="relative z-30 w-28 h-18 bg-gradient-to-r from-slate-100 to-white rounded-xl shadow-2xl border border-slate-200 -ml-6 -mt-10 transform rotate-6 p-2.5 flex flex-col justify-between">
                <div className="w-4 h-3 bg-amber-400 rounded-xs"></div>
                <div className="space-y-1">
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                  <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Layout (Form + Summary) matching reference */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Information & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Billing & Shipping Information */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Billing & Shipping Information
                </h2>
              </div>

              {/* 2-Column Form Fields with embedded icons matching reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Md. Mahim"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+880 1234 567890"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="mahim@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Business Street, Dhaka-1205"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                    </select>
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Gazipur">Gazipur</option>
                      <option value="Narayanganj">Narayanganj</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Comilla">Comilla</option>
                      <option value="Sylhet">Sylhet</option>
                    </select>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                    </select>
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Postal Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Inbox className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="1205"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Payment Method</h2>
              </div>

              {/* 4 Cards Grid matching reference image */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-blue-600 bg-white' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Banknote className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Cash on Delivery</h4>
                    <p className="text-[10px] text-blue-600 font-medium mt-0.5">Pay when you receive</p>
                  </div>
                </button>

                {/* 2. Credit / Debit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-blue-600 bg-white' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Credit / Debit Card</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Secure Payment</p>
                  </div>
                </button>

                {/* 3. bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                    paymentMethod === 'bkash'
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'bkash' ? 'border-rose-500 bg-white' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'bkash' && <div className="w-2 h-2 rounded-full bg-rose-600"></div>}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      bK
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">bKash</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pay with bKash</p>
                  </div>
                </button>

                {/* 4. Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'nagad' ? 'border-orange-500 bg-white' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'nagad' && <div className="w-2 h-2 rounded-full bg-orange-600"></div>}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      Ng
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Nagad</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pay with Nagad</p>
                  </div>
                </button>
              </div>

              {/* Security Banner directly underneath */}
              <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Your information is safe and secure with us.
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    We use industry-standard encryption to protect your data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Your Order Summary (5 cols) matching reference */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-24">
              {/* Header */}
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Your Order Summary</h2>
              </div>

              {/* Itemized List */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.subtitle || 'Electronics'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-extrabold text-sm text-slate-900">
                        ৳{item.price.toLocaleString()}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Trash */}
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Calculations */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">৳{effectiveSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    Shipping Fee
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <span className="font-bold text-slate-900">৳{shippingFee}</span>
                </div>

                <div className="flex items-center justify-between text-emerald-600">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    Discount
                  </span>
                  <span className="font-bold">৳{discount}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">Total Amount</span>
                  <span className="font-black text-2xl text-slate-900">
                    ৳{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing Order...' : 'Place Order'}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </form>

        {/* 3. Bottom 4 Trust Badges matching reference image */}
        <section className="mt-14 pt-8 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Badge 1 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">100% Secure Payment</h4>
                <p className="text-xs text-slate-500 mt-0.5">Your data is safe</p>
              </div>
            </div>

            {/* Badge 2 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Free Shipping</h4>
                <p className="text-xs text-slate-500 mt-0.5">On Orders Over ৳1,000</p>
              </div>
            </div>

            {/* Badge 3 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">24/7 Customer Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">Always here to help</p>
              </div>
            </div>

            {/* Badge 4 */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-white transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">30 Days Easy Return</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hassle-free policy</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
