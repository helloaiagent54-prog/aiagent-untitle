import React from 'react';
import { Order } from '../../../types';
import { AdminDrawer } from '../common/modal';
import {
  ShoppingBag,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus?: (order: Order) => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}) => {
  if (!order) return null;

  const statusColor = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    returned: 'bg-slate-200 text-slate-800 border-slate-300',
  }[order.orderStatus] || 'bg-slate-100 text-slate-800 border-slate-200';

  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      icon={<ShoppingBag className="w-5 h-5" />}
      title={`Order #${order.orderNumber}`}
      subtitle={`Placed on ${orderDate}`}
      badge={
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor}`}
        >
          {order.orderStatus}
        </span>
      }
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Invoice</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onUpdateStatus && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpdateStatus(order);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Update Fulfillment</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* 1. Customer Card */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <User className="w-4 h-4 text-blue-600" />
            <span>Customer Details</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">ID: {order._id.slice(-6)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Customer Name</span>
            <span className="font-black text-slate-900 text-sm">{order.customerName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
            <a
              href={`tel:${order.customerPhone}`}
              className="font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {order.customerPhone}
            </a>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
            <span className="font-medium text-slate-700">{order.customerEmail || 'No email provided'}</span>
          </div>
        </div>
      </div>

      {/* 2. Delivery Destination */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 pb-2 border-b border-slate-200/60">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Shipping & Delivery Destination</span>
        </div>
        <p className="font-semibold text-slate-800 leading-relaxed">
          {order.shippingAddress.streetAddress}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>{order.shippingAddress.upazila}</span>
          <span>·</span>
          <span>{order.shippingAddress.district}</span>
          <span>·</span>
          <span className="font-bold text-slate-700">{order.shippingAddress.division} Division</span>
        </div>
      </div>

      {/* 3. Ordered Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Ordered Items ({order.items.length})</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-500">
            Qty: {order.items.reduce((acc, it) => acc + it.quantity, 0)} units
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-3.5 flex items-center gap-3.5 hover:bg-slate-50/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono text-slate-400">SKU: {item.sku || 'N/A'}</span>
                  {item.variantId && (
                    <>
                      <span>·</span>
                      <span className="text-blue-600 font-semibold">Variant ID: {item.variantId.slice(-4)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-slate-600 font-medium">৳{item.price.toLocaleString()}</span>
                  <span className="text-slate-400">×</span>
                  <span className="font-bold text-slate-900">{item.quantity}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-900 tabular-nums">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Payment & Financial Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Payment Summary</span>
          </div>
          <span className="font-bold uppercase tracking-wider text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </div>

        <div className="space-y-1.5 pt-1 text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900 tabular-nums">৳{order.pricing.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="font-medium text-slate-900 tabular-nums">৳{order.pricing.shippingFee.toLocaleString()}</span>
          </div>
          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Promotional Discount</span>
              <span className="tabular-nums">- ৳{order.pricing.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>Grand Total</span>
            <span className="text-blue-700 font-black tabular-nums">৳{order.pricing.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 5. Tracking / Notes if present */}
      {(order as any).notes && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Audit / Tracking Note</span>
          <p className="font-medium leading-relaxed">{(order as any).notes}</p>
        </div>
      )}
    </AdminDrawer>
  );
};
