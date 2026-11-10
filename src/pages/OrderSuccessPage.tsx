import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { Order } from '../types';
import { CheckCircle, Package, ArrowRight, Truck, MapPin, Printer } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    apiRequest(`/orders/${orderId}`).then((res) => {
      setIsLoading(false);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    });
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          We have received your order. Our logistics team in Dhaka is preparing your shipment.
        </p>

        {order && (
          <div className="pt-4 border-t border-slate-100 text-left space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
                <span className="font-bold text-blue-700 uppercase">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                <span className="font-black text-slate-900 text-sm">৳{order.pricing.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Purchased Items</h3>
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-50 border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="p-4 rounded-2xl bg-slate-50 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shipping Destination</span>
              <p className="font-bold text-slate-900">{order.shippingAddress.recipientName} ({order.shippingAddress.phone})</p>
              <p className="text-slate-600">
                {order.shippingAddress.streetAddress}, {order.shippingAddress.upazila}, {order.shippingAddress.district},{' '}
                {order.shippingAddress.division}
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/account?tab=orders"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            Track in My Orders
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
