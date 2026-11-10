import React, { useState } from 'react';
import { User } from '../../types';
import { Users, Search, ShoppingBag, MapPin, Eye, ShieldCheck, Mail, Phone } from 'lucide-react';
import { CustomerDetailsDrawer } from './drawers/CustomerDetailsDrawer';

interface CustomersManagerProps {
  customers: User[];
  onRefresh: () => void;
}

export const CustomersManager: React.FC<CustomersManagerProps> = ({ customers, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Customer Accounts & Profiles</h2>
            <p className="text-xs text-slate-500">Manage registered shopper accounts, orders, and addresses.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Total Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c: any) => (
              <tr key={c._id || c.id} className="hover:bg-slate-50/50">
                <td className="p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {String(c._id || c.id).slice(-6)}</span>
                  </div>
                </td>
                <td className="p-3">
                  <p className="text-slate-800 font-medium">{c.email}</p>
                  <p className="text-slate-400 text-[10px]">{c.phone || 'No phone set'}</p>
                </td>
                <td className="p-3 font-bold text-slate-900">{c.orderCount || 0} orders</td>
                <td className="p-3 font-bold text-blue-700 tabular-nums">৳ {(c.totalSpent || 0).toLocaleString()}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    title="Inspect customer profile drawer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Profile Drawer */}
      <CustomerDetailsDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
};
