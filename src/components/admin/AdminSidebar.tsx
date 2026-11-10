import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Layers,
  Award,
  Sliders,
  Image as ImageIcon,
  FileText,
  Newspaper,
  Settings,
  CreditCard,
  Truck,
  Percent,
  Bell,
  ShieldCheck,
  Database,
  UserCheck,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  Megaphone,
} from 'lucide-react';

export type AdminModule =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'reviews'
  | 'coupons'
  | 'categories'
  | 'brands'
  | 'attributes'
  | 'hero-slider'
  | 'banners'
  | 'advertisements'
  | 'pages'
  | 'blog-posts'
  | 'general-settings'
  | 'payment-methods'
  | 'shipping-settings'
  | 'tax-fees'
  | 'notifications'
  | 'audit-logs'
  | 'backup-restore'
  | 'staff-management'
  | 'database-status';

interface AdminSidebarProps {
  activeModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts?: {
    products?: number;
    orders?: number;
    customers?: number;
    reviews?: number;
    coupons?: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  counts,
}) => {
  const handleItemClick = (module: AdminModule) => {
    onSelectModule(module);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#06152d] text-slate-300 flex flex-col border-r border-[#102447] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#112447]">
          <Link to="/admin" className="flex items-center gap-3 group">
            {/* Aurelia Logo Icon matching Reference */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-tight">Aurelia</span>
              <span className="text-[10px] text-slate-400 font-medium block">Shop Smart, Live Better</span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {/* Main Dashboard Button (Matching Reference) */}
          <div>
            <button
              onClick={() => handleItemClick('dashboard')}
              className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 transition-all ${
                activeModule === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Group 1: E-Commerce */}
          <div className="space-y-1">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">E-Commerce</h4>

            <button
              onClick={() => handleItemClick('products')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'products'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Products</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleItemClick('orders')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'orders'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span>Orders</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleItemClick('customers')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'customers'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Customers</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('reviews')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'reviews'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-slate-400" />
                <span>Reviews</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('coupons')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'coupons'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>Coupons</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('categories')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'categories'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Categories</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('brands')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'brands'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-slate-400" />
                <span>Brands</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('attributes')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'attributes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Attributes</span>
              </div>
            </button>
          </div>

          {/* Group 2: Website Content */}
          <div className="space-y-1">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Website Content</h4>

            <button
              onClick={() => handleItemClick('hero-slider')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'hero-slider'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Hero Slider</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleItemClick('banners')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'banners'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Banners</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleItemClick('advertisements')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'advertisements'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-slate-400" />
                <span>Advertisements</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleItemClick('pages')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'pages'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Pages</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('blog-posts')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'blog-posts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-4 h-4 text-slate-400" />
                <span>Blog Posts</span>
              </div>
            </button>
          </div>

          {/* Group 3: Settings */}
          <div className="space-y-1">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Settings</h4>

            <button
              onClick={() => handleItemClick('general-settings')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'general-settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>General Settings</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('payment-methods')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'payment-methods'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payment Methods</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('shipping-settings')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'shipping-settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Shipping Settings</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('tax-fees')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'tax-fees'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Percent className="w-4 h-4 text-slate-400" />
                <span>Tax & Fees</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('notifications')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'notifications'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-400" />
                <span>Notifications</span>
              </div>
            </button>
          </div>

          {/* Group 4: System */}
          <div className="space-y-1">
            <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">System</h4>

            <button
              onClick={() => handleItemClick('audit-logs')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'audit-logs'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Audit Logs</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('backup-restore')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'backup-restore'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-slate-400" />
                <span>Backup & Restore</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('staff-management')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'staff-management'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Staff Management</span>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('database-status')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                activeModule === 'database-status'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-purple-100 hover:bg-purple-900/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Atlas Diagnostics</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Badge matching reference image */}
        <div className="p-4 border-t border-[#112447] bg-[#050f21]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Aurelia Admin Panel</p>
              <p className="text-[10px] text-slate-400 font-mono">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
