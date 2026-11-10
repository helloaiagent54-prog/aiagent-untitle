import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { UserCheck, Plus, ShieldCheck, Mail, Phone, Lock, Shield } from 'lucide-react';
import { AdminModal } from './common/modal';
import { apiRequest } from '../../services/api';
import { useAppDispatch } from '../../app/hooks';
import { addToast } from '../../features/ui/uiSlice';

export const StaffManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    phone: '',
  });

  const fetchStaff = () => {
    apiRequest('/admin/staff').then((res) => {
      if (res.success && res.staff) {
        setStaffList(res.staff);
      }
    });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    if (res.success) {
      setIsModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'admin', phone: '' });
      fetchStaff();
      dispatch(
        addToast({
          type: 'success',
          title: 'Staff Account Created',
          message: `${form.name} can now sign in with administrative privileges.`,
        })
      );
    } else {
      dispatch(
        addToast({
          type: 'error',
          title: 'Creation Failed',
          message: res.message || 'Could not create staff user.',
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Staff Members & RBAC Permissions</h2>
            <p className="text-xs text-slate-500">
              Manage internal administrative accounts, catalog managers, order fulfillment officers, and customer care.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Staff Member</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3">Staff Member</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Assigned RBAC Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((s: any) => (
              <tr key={s._id || s.id} className="hover:bg-slate-50/50">
                <td className="p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <span className="text-[10px] text-slate-400">ID: {String(s._id || s.id).slice(-6)}</span>
                  </div>
                </td>
                <td className="p-3">
                  <p className="text-slate-800 font-medium">{s.email}</p>
                  <p className="text-slate-400 text-[10px]">{s.phone || 'No phone set'}</p>
                </td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    {s.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Authorized
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AdminModal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={<UserCheck className="w-5 h-5" />}
        title="Create Staff Account"
        subtitle="Provision internal team credentials with role-based access control (RBAC)."
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sazzad Hossain"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="staff@aureliacommerce.com"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Temporary Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Phone Number (+880)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+8801700000000"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Role & Access Level</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin (Full Dashboard Access)</option>
              <option value="super_admin">Super Admin (System & Staff Control)</option>
              <option value="catalog_manager">Catalog Manager (Products & CMS)</option>
              <option value="order_manager">Order Manager (Fulfillment & Shipping)</option>
              <option value="customer_support">Customer Support (Reviews & Enquiries)</option>
              <option value="finance">Finance (Revenue & Audit)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
