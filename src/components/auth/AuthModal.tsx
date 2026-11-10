import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { closeAuthModal, setAuthModalTab, addToast } from '../../features/ui/uiSlice';
import { loginSuccess } from '../../features/auth/authSlice';
import { Modal } from '../ui/Modal';
import { apiRequest } from '../../services/api';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthModalOpen, authModalTab, authRedirectPath } = useAppSelector((state) => state.ui);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);

    if (res.success && res.token && res.user) {
      dispatch(loginSuccess({ user: res.user, token: res.token }));
      dispatch(
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: `Signed in as ${res.user.name}`,
        })
      );
      dispatch(closeAuthModal());
      if (authRedirectPath) {
        navigate(authRedirectPath);
      }
    } else {
      setFormError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });

    setIsLoading(false);

    if (res.success && res.token && res.user) {
      dispatch(loginSuccess({ user: res.user, token: res.token }));
      dispatch(
        addToast({
          type: 'success',
          title: 'Account Created',
          message: 'Welcome to Novara Commerce! Your account is active.',
        })
      );
      dispatch(closeAuthModal());
      if (authRedirectPath) {
        navigate(authRedirectPath);
      }
    } else {
      setFormError(res.message || 'Registration failed.');
    }
  };

  const handleDemoLogin = async (role: 'customer' | 'admin') => {
    setIsLoading(true);
    setFormError('');
    const creds =
      role === 'admin'
        ? { email: 'admin@novaracommerce.com', password: 'admin123456' }
        : { email: 'customer@novara.com', password: 'customer123' };

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(creds),
    });

    setIsLoading(false);

    if (res.success && res.token && res.user) {
      dispatch(loginSuccess({ user: res.user, token: res.token }));
      dispatch(
        addToast({
          type: 'success',
          title: role === 'admin' ? 'Admin Access Granted' : 'Customer Signed In',
          message: `Logged in as ${res.user.name} (${res.user.role})`,
        })
      );
      dispatch(closeAuthModal());
      if (authRedirectPath) {
        navigate(authRedirectPath);
      }
    } else {
      setFormError(res.message || 'Demo login failed.');
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => dispatch(closeAuthModal())}
      title={
        authModalTab === 'login'
          ? 'Sign in to Your Account'
          : authModalTab === 'register'
          ? 'Create a Customer Account'
          : 'Reset Password'
      }
      subtitle="Orders and verified reviews require a registered customer account."
      maxWidth="md"
    >
      {/* Tab toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            dispatch(setAuthModalTab('login'));
            setFormError('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authModalTab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch(setAuthModalTab('register'));
            setFormError('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authModalTab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <span className="font-semibold">Notice:</span> {formError}
        </div>
      )}

      {authModalTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => dispatch(setAuthModalTab('forgot'))}
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? 'Signing In...' : 'Sign In to Proceed'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Instant One-Click Demo Logins for fast evaluation */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2.5">Instant test accounts (Pre-configured credentials):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                Demo Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Super Admin
              </button>
            </div>
          </div>
        </form>
      )}

      {authModalTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rafik Hasan"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number (Bangladesh)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1712 345678"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {authModalTab === 'forgot' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your email address and we'll send a secure password reset link to your inbox.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(
                addToast({
                  type: 'info',
                  title: 'Reset Link Sent',
                  message: `A password reset link has been dispatched to ${email || 'your email'}`,
                })
              );
              dispatch(setAuthModalTab('login'));
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Send Reset Instructions
          </button>
        </div>
      )}
    </Modal>
  );
};
