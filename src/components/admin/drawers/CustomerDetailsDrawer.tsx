import React from 'react';
import { User } from '../../../types';
import { AdminDrawer } from '../common/modal';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  CreditCard,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useAppDispatch } from '../../../app/hooks';
import { addToast } from '../../../features/ui/uiSlice';

interface CustomerDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: (User & { orderCount?: number; totalSpent?: number }) | null;
}

export const CustomerDetailsDrawer: React.FC<CustomerDetailsDrawerProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const dispatch = useAppDispatch();
  if (!customer) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    dispatch(
      addToast({
        type: 'info',
        title: 'Copied to Clipboard',
        message: `${label} copied.`,
      })
    );
  };

  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Verified Shopper';

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      icon={<Users className="w-5 h-5" />}
      title={customer.name}
      subtitle={`Member since ${memberSince}`}
      badge={
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
          Active Shopper
        </span>
      }
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            ID: {String(customer.id || (customer as any)._id || '').slice(-8)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      }
    >
      {/* 1. Customer Overview Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/50 border border-blue-400/40 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black truncate">{customer.name}</h3>
            <p className="text-xs text-blue-200 truncate">{customer.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-wider text-blue-200 block font-semibold">
              Total Orders
            </span>
            <span className="text-base font-black tabular-nums">
              {customer.orderCount || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-wider text-blue-200 block font-semibold">
              Lifetime Spent
            </span>
            <span className="text-base font-black tabular-nums">
              ৳ {(customer.totalSpent || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Contact Details Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-blue-600" />
          <span>Contact Information</span>
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Email
              </span>
              <span className="font-bold text-slate-900 truncate block">
                {customer.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(customer.email, 'Email address')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Copy email"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Phone
              </span>
              <span className="font-bold text-slate-900 truncate block">
                {customer.phone || 'No phone number provided'}
              </span>
            </div>
            {customer.phone && (
              <button
                type="button"
                onClick={() => copyToClipboard(customer.phone!, 'Phone number')}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Copy phone"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Delivery Addresses */}
      <div className="space-y-2 text-xs">
        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Saved Addresses</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
            {customer.addresses?.length || 0}
          </span>
        </h4>

        {(!customer.addresses || customer.addresses.length === 0) ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
            No saved addresses on file.
          </div>
        ) : (
          <div className="space-y-2">
            {customer.addresses.map((addr: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    {addr.recipientName || customer.name}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {addr.streetAddress}, {addr.upazila}, {addr.district}, {addr.division}
                </p>
                {addr.phone && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    Recipient Phone: {addr.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminDrawer>
  );
};
