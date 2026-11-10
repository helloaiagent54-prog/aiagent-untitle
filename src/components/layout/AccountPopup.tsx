import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { openAuthModal, addToast } from '../../features/ui/uiSlice';
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  ShieldCheck,
  LogIn,
  UserPlus,
  ChevronRight,
} from 'lucide-react';

interface AccountPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountPopup: React.FC<AccountPopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProtectedNavigation = (path: string) => {
    onClose();
    if (isAuthenticated) {
      navigate(path);
    } else {
      dispatch(openAuthModal({ tab: 'login', redirectPath: path }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(
      addToast({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been safely signed out.',
      })
    );
    onClose();
    navigate('/');
  };

  const isStaff = user && ['super_admin', 'admin', 'order_manager', 'inventory_manager', 'catalog_manager'].includes(user.role);

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {isAuthenticated && user ? (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <span className="inline-block mt-0.5 text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-900 mb-1">Welcome to Aurelia / Novara</p>
          <p className="text-xs text-slate-500 mb-3">Sign in for fast checkout & order tracking</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                dispatch(openAuthModal({ tab: 'login' }));
              }}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => {
                onClose();
                dispatch(openAuthModal({ tab: 'register' }));
              }}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </button>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="py-1">
        <button
          onClick={() => handleProtectedNavigation('/account?tab=orders')}
          className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between group transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>My Orders / Order History</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
        </button>

        <button
          onClick={() => handleProtectedNavigation('/account?tab=addresses')}
          className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between group transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Saved Addresses</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
        </button>

        <button
          onClick={() => handleProtectedNavigation('/account?tab=profile')}
          className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between group transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Account & Profile Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
        </button>

        {isStaff && (
          <button
            onClick={() => {
              onClose();
              navigate('/admin');
            }}
            className="w-full px-4 py-2.5 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center justify-between group transition-colors border-t border-slate-100 mt-1"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Operations Suite</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">STAFF</span>
          </button>
        )}

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors border-t border-slate-100 mt-1"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
};
