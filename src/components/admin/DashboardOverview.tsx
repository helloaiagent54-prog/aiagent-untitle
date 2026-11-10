import React, { useState } from 'react';
import {
  Users,
  ShoppingCart,
  ShoppingBag,
  Star,
  TrendingUp,
  BarChart3,
  Trophy,
  Zap,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Calendar,
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  Clock,
  User,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import { AdminModule } from './AdminSidebar';

interface DashboardOverviewProps {
  stats: any;
  salesOverview: any[];
  topProducts: any[];
  orderStatusOverview: any;
  revenueGrowth: any[];
  recentActivities: any[];
  onSelectModule: (module: AdminModule) => void;
  onOpenAddProduct: () => void;
  onOpenAddCoupon: () => void;
  onOpenAddCategory: () => void;
  onOpenAddBanner: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  salesOverview,
  topProducts,
  orderStatusOverview,
  revenueGrowth,
  recentActivities,
  onSelectModule,
  onOpenAddProduct,
  onOpenAddCoupon,
  onOpenAddCategory,
  onOpenAddBanner,
}) => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [salesRange, setSalesRange] = useState('Last 30 Days');
  const [hoveredMonth, setHoveredMonth] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* 1. Header Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Date-Range Dropdown Button matching Reference */}
        <div className="relative">
          <button
            onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isDateRangeOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setIsDateRangeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-xl transition-colors font-medium ${
                    dateRange === range ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Four Key Metric Cards Row (Matching Reference Icons & Sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Visitors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/90 shadow-xs flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Visitors</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {stats?.totalVisitors?.toLocaleString() || '24,532'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{stats?.totalVisitorsTrend || '+12.5%'}</span>
            </div>
          </div>

          {/* Blue Sparkline SVG */}
          <div className="w-24 h-14 shrink-0 opacity-80">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path
                d="M0,40 Q15,45 30,25 T60,30 T85,15 T100,5"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/90 shadow-xs flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Orders</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {stats?.totalOrders?.toLocaleString() || '1,248'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{stats?.totalOrdersTrend || '+18.7%'}</span>
            </div>
          </div>

          {/* Purple Sparkline SVG */}
          <div className="w-24 h-14 shrink-0 opacity-80">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path
                d="M0,45 Q20,40 40,30 T70,35 T90,15 T100,8"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/90 shadow-xs flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Revenue</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                ৳ {stats?.totalRevenue?.toLocaleString() || '1,48,720'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{stats?.totalRevenueTrend || '+20.3%'}</span>
            </div>
          </div>

          {/* Green Sparkline SVG */}
          <div className="w-24 h-14 shrink-0 opacity-80">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path
                d="M0,42 Q20,48 40,25 T65,30 T85,12 T100,6"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/90 shadow-xs flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Reviews</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {stats?.totalReviews?.toLocaleString() || '682'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{stats?.totalReviewsTrend || '+10.1%'}</span>
            </div>
          </div>

          {/* Amber Sparkline SVG */}
          <div className="w-24 h-14 shrink-0 opacity-80">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path
                d="M0,45 Q20,38 40,32 T65,35 T85,18 T100,8"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Row 2: Sales Overview (5 cols) + Top Products (4 cols) + Quick Actions (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card A: Sales Overview Area Chart (~5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales Overview</h3>
                <p className="text-[11px] text-slate-400">Your store performance over the last 30 days</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  Orders
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  Revenue
                </span>
              </div>
            </div>
          </div>

          {/* High-Fidelity SVG Area Line Chart */}
          <div className="pt-2">
            <div className="relative h-56 w-full">
              <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="60" x2="490" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="100" x2="490" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="140" x2="490" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="180" x2="490" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="30" y="24" textAnchor="end" fontSize="10" fill="#94a3b8">2K</text>
                <text x="30" y="64" textAnchor="end" fontSize="10" fill="#94a3b8">1.5K</text>
                <text x="30" y="104" textAnchor="end" fontSize="10" fill="#94a3b8">1K</text>
                <text x="30" y="144" textAnchor="end" fontSize="10" fill="#94a3b8">500</text>
                <text x="30" y="184" textAnchor="end" fontSize="10" fill="#94a3b8">0</text>

                {/* Revenue Area & Curve (Light Blue) */}
                <path
                  d="M 50,165 Q 90,140 130,130 T 210,135 T 290,120 T 370,115 T 450,90 L 450,180 L 50,180 Z"
                  fill="url(#revenueGrad)"
                />
                <path
                  d="M 50,165 Q 90,140 130,130 T 210,135 T 290,120 T 370,115 T 450,90"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Orders Area & Curve (Dark Blue) */}
                <path
                  d="M 50,150 Q 90,105 130,120 T 210,85 T 290,110 T 370,80 T 450,45 L 450,180 L 50,180 Z"
                  fill="url(#ordersGrad)"
                />
                <path
                  d="M 50,150 Q 90,105 130,120 T 210,85 T 290,110 T 370,80 T 450,45"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* X-axis date points matching Reference */}
                <text x="50" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 2</text>
                <text x="110" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 6</text>
                <text x="170" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 10</text>
                <text x="230" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 14</text>
                <text x="290" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 18</text>
                <text x="350" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 22</text>
                <text x="410" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 26</text>
                <text x="465" y="196" textAnchor="middle" fontSize="10" fill="#94a3b8">Oct 30</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Card B: Top Products (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Top Products</h3>
                <p className="text-[11px] text-slate-400">Best Selling Products</p>
              </div>
            </div>

            <button
              onClick={() => onSelectModule('products')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ranked List 1 to 5 matching Reference Image */}
          <div className="divide-y divide-slate-50 py-1 space-y-2.5">
            {(topProducts || []).slice(0, 5).map((prod: any, idx: number) => {
              const maxSold = 250;
              const ratio = Math.min(100, Math.round(((prod.sold || 100) / maxSold) * 100));
              return (
                <div key={idx} className="pt-2 flex items-center gap-3">
                  {/* Rank badge */}
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=120&q=80'}
                    alt={prod.name}
                    className="w-9 h-9 rounded-lg object-cover bg-slate-50 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500">৳ {prod.price?.toLocaleString()}</p>
                  </div>

                  {/* Progress & Count */}
                  <div className="w-28 text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 block mb-1">{prod.sold} sold</span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card C: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              <p className="text-[11px] text-slate-400">Frequently used operations</p>
            </div>
          </div>

          {/* 2x3 Grid of 6 Actions matching reference image */}
          <div className="grid grid-cols-2 gap-2.5 py-2">
            <button
              onClick={onOpenAddProduct}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">Add Product</span>
            </button>

            <button
              onClick={onOpenAddCategory}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">Create Category</span>
            </button>

            <button
              onClick={onOpenAddBanner}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">Create Banner</span>
            </button>

            <button
              onClick={onOpenAddCoupon}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">Add Coupon</span>
            </button>

            <button
              onClick={() => onSelectModule('orders')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">Manage Orders</span>
            </button>

            <button
              onClick={() => onSelectModule('reviews')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-center flex flex-col items-center justify-center transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600">View Reviews</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Row 3: Order Status (4 cols) + Revenue Growth (5 cols) + Active Users (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card D: Order Status Donut Chart (~4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Order Status</h3>
                <p className="text-[11px] text-slate-400">Order Status Overview</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              This Month ▾
            </span>
          </div>

          {/* Donut Chart with Center Number matching Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Segment 1: Pending (Blue, 28%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="11"
                  strokeDasharray="67 172"
                  strokeDashoffset="0"
                />
                {/* Segment 2: Processing (Amber, 34%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="11"
                  strokeDasharray="81 158"
                  strokeDashoffset="-67"
                />
                {/* Segment 3: Shipped (Teal/Emerald, 26%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="11"
                  strokeDasharray="62 177"
                  strokeDashoffset="-148"
                />
                {/* Segment 4: Delivered (Purple, 12%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="11"
                  strokeDasharray="29 210"
                  strokeDashoffset="-210"
                />
              </svg>

              {/* Center count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {orderStatusOverview?.totalOrders?.toLocaleString() || '1,248'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Total Orders</span>
              </div>
            </div>

            {/* Legend matching Reference percentages */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Pending
                </span>
                <span className="font-bold text-slate-900">{orderStatusOverview?.percentages?.pending || 28}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Processing
                </span>
                <span className="font-bold text-slate-900">{orderStatusOverview?.percentages?.processing || 34}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Shipped
                </span>
                <span className="font-bold text-slate-900">{orderStatusOverview?.percentages?.shipped || 26}%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                  Delivered
                </span>
                <span className="font-bold text-slate-900">{orderStatusOverview?.percentages?.delivered || 12}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card E: Revenue Growth Monthly Bar Chart (~5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between relative">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue Growth</h3>
                <p className="text-[11px] text-slate-400">Monthly Revenue</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              This Year ▾
            </span>
          </div>

          {/* Peak Tooltip badge matching Reference (৳ 1,48,720) */}
          <div className="pt-6 relative">
            <div className="absolute top-2 right-12 z-10 bg-[#001736] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
              <span>৳ 1,48,720</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            </div>

            {/* Monthly Bars Jan - Dec */}
            <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-100">
              {(revenueGrowth || []).map((m: any, idx: number) => {
                const max = 150000;
                const heightPercent = Math.min(100, Math.round((m.revenue / max) * 100));
                const isPeak = m.isPeak || idx === 10; // November peak
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                  >
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-blue-700 to-blue-500 shadow-sm shadow-blue-500/30'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-800 font-medium">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Y-axis milestones */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>0</span>
              <span>50K</span>
              <span>1L</span>
              <span>1.5L</span>
            </div>
          </div>
        </div>

        {/* Card F: Active Users with World Map (~3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Users</h3>
                <p className="text-[11px] text-slate-400">Live Visitors on Your Store</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Now
            </span>
          </div>

          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.activeUsers?.toLocaleString() || '2,843'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">Online Users</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{stats?.activeUsersTrend || '+8.2%'}</span>
            </div>
          </div>

          {/* Stylized World Map with glowing location dots */}
          <div className="relative h-28 w-full bg-blue-50/40 rounded-2xl overflow-hidden p-2 flex items-center justify-center border border-blue-100/50">
            {/* World map silhouette vector */}
            <svg viewBox="0 0 300 150" className="w-full h-full opacity-60 text-blue-300 fill-current">
              <path d="M40,50 Q60,30 90,40 T140,50 T170,80 T210,60 T250,70 T280,50 L270,110 Q240,120 200,115 T150,130 T90,120 T40,110 Z" />
            </svg>
            {/* Glowing Pulse dots for Bangladesh, South Asia & Global */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 relative ring-2 ring-white" />
            </div>
            <div className="absolute top-1/3 left-1/3 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            </div>
            <div className="absolute top-2/3 right-1/4 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Row 4: Recent Activities (~9 cols) + Upgrade Your Store (~3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card G: Recent Activities (~9 cols) */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <p className="text-[11px] text-slate-400">Latest activities from your store</p>
              </div>
            </div>

            <button
              onClick={() => onSelectModule('audit-logs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5 Horizontal Activity Cards matching Reference Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
            {(recentActivities || []).map((act: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-3 hover:border-blue-200 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    act.type === 'order'
                      ? 'bg-blue-100 text-blue-600'
                      : act.type === 'user'
                      ? 'bg-cyan-100 text-cyan-600'
                      : act.type === 'review'
                      ? 'bg-amber-100 text-amber-500'
                      : act.type === 'coupon'
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {act.type === 'order' && <ShoppingCart className="w-4 h-4" />}
                  {act.type === 'user' && <User className="w-4 h-4" />}
                  {act.type === 'review' && <Star className="w-4 h-4" />}
                  {act.type === 'coupon' && <Tag className="w-4 h-4" />}
                  {act.type === 'product' && <Package className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{act.title}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card H: Upgrade Your Store Graphic Card (~3 cols) */}
        <div className="lg:col-span-3 rounded-3xl p-6 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 text-white shadow-xl shadow-blue-500/15 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1.5 z-10">
            <h3 className="text-base font-black tracking-tight leading-tight">Upgrade Your Store</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Get more features and grow faster!
            </p>
          </div>

          <div className="pt-4 z-10 flex items-center justify-between gap-2">
            <button
              onClick={() => onSelectModule('general-settings')}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs rounded-xl shadow-md transition-all hover:translate-x-0.5 flex items-center gap-1.5"
            >
              <span>Upgrade Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* 3D shopping bag graphic badge */}
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-inner">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
