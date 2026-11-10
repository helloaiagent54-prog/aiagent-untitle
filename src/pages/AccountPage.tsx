import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout, updateAddresses, updateUser } from '../features/auth/authSlice';
import { addToast, openAuthModal } from '../features/ui/uiSlice';
import { apiRequest } from '../services/api';
import { Order, UserAddress } from '../types';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  Clock,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Package,
  XCircle,
  KeyRound,
  Check,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Address modal/form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newRecipient, setNewRecipient] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newDivision, setNewDivision] = useState('Dhaka');
  const [newDistrict, setNewDistrict] = useState('Dhaka');
  const [newUpazila, setNewUpazila] = useState('Gulshan');
  const [newStreet, setNewStreet] = useState('');

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ tab: 'login', redirectPath: '/account' }));
    } else if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [isAuthenticated, user, dispatch]);

  const loadOrders = () => {
    if (isAuthenticated) {
      setIsLoadingOrders(true);
      apiRequest('/orders/my-orders').then((res) => {
        setIsLoadingOrders(false);
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign in to Access Your Account</h2>
        <button
          onClick={() => dispatch(openAuthModal({ tab: 'login' }))}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify({
        recipientName: newRecipient,
        phone: newPhone,
        division: newDivision,
        district: newDistrict,
        upazila: newUpazila,
        streetAddress: newStreet,
      }),
    });

    if (res.success && res.addresses) {
      dispatch(updateAddresses(res.addresses));
      setIsAddingAddress(false);
      setNewStreet('');
      dispatch(
        addToast({
          type: 'success',
          title: 'Address Saved',
          message: 'Your new delivery destination has been added.',
        })
      );
    }
  };

  const handleSetDefaultAddress = async (addressId?: string) => {
    if (!addressId) return;
    const res = await apiRequest(`/auth/addresses/${addressId}/default`, { method: 'PATCH' });
    if (res.success && res.addresses) {
      dispatch(updateAddresses(res.addresses));
      dispatch(
        addToast({
          type: 'success',
          title: 'Default Address Updated',
          message: 'Primary shipping destination has been changed.',
        })
      );
    }
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!addressId) return;
    const res = await apiRequest(`/auth/addresses/${addressId}`, { method: 'DELETE' });
    if (res.success && res.addresses) {
      dispatch(updateAddresses(res.addresses));
      dispatch(
        addToast({
          type: 'info',
          title: 'Address Removed',
          message: 'The address has been removed from your account.',
        })
      );
    }
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderNumber}? Stock will be returned.`)) {
      return;
    }

    const res = await apiRequest(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Customer requested cancellation via portal' }),
    });

    if (res.success) {
      dispatch(
        addToast({
          type: 'success',
          title: 'Order Cancelled',
          message: `Order ${orderNumber} has been successfully cancelled.`,
        })
      );
      loadOrders();
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Cancellation Failed',
          message: res.message || 'Could not cancel this order.',
        })
      );
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: profileName, phone: profilePhone }),
    });
    setIsSavingProfile(false);

    if (res.success && res.user) {
      dispatch(updateUser(res.user));
      dispatch(
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your personal information has been saved.',
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: res.message || 'Could not update profile.',
        })
      );
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Password Mismatch',
          message: 'New password and confirmation do not match.',
        })
      );
      return;
    }

    setIsChangingPassword(true);
    const res = await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setIsChangingPassword(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      dispatch(
        addToast({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been successfully updated.',
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Change Failed',
          message: res.message || 'Incorrect current password.',
        })
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Account Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
              Verified {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            dispatch(logout());
            navigate('/');
          }}
          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs h-fit">
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'addresses' })}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'addresses' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({user.addresses?.length || 0})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'wishlist' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist (2 items)</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
              activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>
        </aside>

        {/* Tab Content (9 cols) */}
        <main className="lg:col-span-9">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Your Order History</h2>

              {isLoadingOrders ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-100 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                          <span className="text-slate-400 ml-2">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                          <span className="font-black text-slate-900 tabular-nums">
                            ৳{ord.pricing.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="flex items-center gap-3 overflow-x-auto">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-xl">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded bg-white"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-xs text-slate-700 max-w-xs truncate">{item.name}</span>
                            <span className="text-xs text-slate-400 font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping info & action buttons */}
                      <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          Delivering to: {ord.shippingAddress.upazila}, {ord.shippingAddress.district} (
                          {ord.paymentMethod.toUpperCase()})
                        </span>
                        <div className="flex items-center gap-3">
                          {(ord.orderStatus === 'pending' || ord.orderStatus === 'confirmed') && (
                            <button
                              onClick={() => handleCancelOrder(ord._id, ord.orderNumber)}
                              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel Order
                            </button>
                          )}
                          <Link
                            to={`/order-success?orderId=${ord._id}`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            View Receipt →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Saved Delivery Addresses</h2>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address
                </button>
              </div>

              {isAddingAddress && (
                <form
                  onSubmit={handleSaveAddress}
                  className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4"
                >
                  <h3 className="text-xs font-bold uppercase text-blue-700">Add New Bangladesh Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Recipient Full Name"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number (+880)"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Division (e.g. Dhaka)"
                      value={newDivision}
                      onChange={(e) => setNewDivision(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="District (e.g. Dhaka)"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Upazila / Thana (e.g. Gulshan)"
                      value={newUpazila}
                      onChange={(e) => setNewUpazila(e.target.value)}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="House #, Road #, Area..."
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                      Save Destination
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(user.addresses || []).map((addr: any, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{addr.recipientName}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr._id || addr.id)}
                            className="text-[11px] font-bold text-blue-600 hover:underline px-1"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(addr._id || addr.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{addr.phone}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {addr.streetAddress}, {addr.upazila}, {addr.district}, {addr.division}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Your Saved Wishlist</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=200&q=80"
                    alt="AirPods Pro 2"
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">AirPods Pro 2</h4>
                    <p className="text-xs font-black text-blue-700">৳24,999</p>
                    <button
                      onClick={() => navigate('/product/airpods-pro-2')}
                      className="text-[11px] font-bold text-blue-600 hover:underline mt-1"
                    >
                      View Product →
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80"
                    alt="Watch Series 10"
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">Smart Watch Series 10</h4>
                    <p className="text-xs font-black text-blue-700">৳11,999</p>
                    <button
                      onClick={() => navigate('/product/smart-watch-series-10')}
                      className="text-[11px] font-bold text-blue-600 hover:underline mt-1"
                    >
                      View Product →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              {/* Profile Details Form */}
              <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Personal Information
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Email address cannot be modified.</span>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Phone Number (+880)</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      placeholder="+8801700000000"
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>

              {/* Password Rotation Form */}
              <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  Change Password
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">New Password (min 6 characters)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
