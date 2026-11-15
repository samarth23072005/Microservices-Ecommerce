import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderRepository, localOrders } from '@/data/repository';
import { formatINR } from '@/api';
import type { Order } from '@/types';

const STATUS_META: Record<Order['status'], { icon: typeof Package; tone: string; label: string }> = {
  Pending: { icon: Clock, tone: 'bg-warning-50 text-warning-600', label: 'Pending' },
  Confirmed: { icon: Package, tone: 'bg-brand-50 text-brand-700', label: 'Confirmed' },
  Shipped: { icon: Truck, tone: 'bg-brand-50 text-brand-700', label: 'Shipped' },
  'Out for Delivery': { icon: Truck, tone: 'bg-accent-50 text-accent-700', label: 'Out for Delivery' },
  Delivered: { icon: CheckCircle2, tone: 'bg-success-50 text-success-700', label: 'Delivered' },
  Cancelled: { icon: XCircle, tone: 'bg-error-50 text-error-600', label: 'Cancelled' },
};

const STEPS: Order['status'][] = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderRepository.list().then((o) => {
      setOrders(o.length ? o : localOrders);
      setLoading(false);
    });
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="card p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-400">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Please login first</h1>
          <p className="mt-2 text-ink-500">Login to view your order history.</p>
          <Link to="/login?redirect=/orders" className="btn-primary mt-6">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        {[0, 1].map((i) => (
          <div key={i} className="card mb-4 h-48 animate-pulse bg-ink-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 animate-fade-in">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink-900">My Orders</h1>
      <p className="mb-6 text-sm text-ink-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-400">
            <Package className="h-8 w-8" />
          </div>
          <p className="mt-4 font-semibold text-ink-800">No orders yet</p>
          <p className="mt-1 text-sm text-ink-500">When you place orders, they'll appear here.</p>
          <Link to="/products" className="btn-primary mt-6">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

const normalizeStatus = (status?: string): Order['status'] => {
  if (!status) return 'Confirmed';
  const s = status.toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'shipped') return 'Shipped';
  if (s === 'out for delivery') return 'Out for Delivery';
  if (s === 'delivered') return 'Delivered';
  if (s === 'cancelled') return 'Cancelled';
  return 'Confirmed';
};

function OrderCard({ order }: { order: Order }) {
  const statusKey = normalizeStatus(order.status);
  const meta = STATUS_META[statusKey] || STATUS_META.Confirmed;
  const StatusIcon = meta.icon;
  const currentStepIndex = STEPS.indexOf(statusKey);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <div>
            <p className="text-xs text-ink-500">Order ID</p>
            <p className="font-semibold text-ink-900">{order._id}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Placed on</p>
            <p className="font-medium text-ink-800">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Total</p>
            <p className="font-semibold text-ink-900">{formatINR(order.total)}</p>
          </div>
        </div>
        <span className={`chip ${meta.tone}`}>
          <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
        </span>
      </div>

      {/* Tracker (only for non-cancelled) */}
      {statusKey !== 'Cancelled' && (
        <div className="border-b border-ink-100 px-5 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              const Icon = STATUS_META[step].icon;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full ${
                        done ? 'bg-success-500 text-white' : 'bg-ink-100 text-ink-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-[10px] ${done ? 'font-semibold text-success-700' : 'text-ink-400'}`}>
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 h-1 flex-1 rounded-full ${i < currentStepIndex ? 'bg-success-500' : 'bg-ink-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="divide-y divide-ink-100 px-5 py-3">
        {order.items.map((item) => (
          <div key={item.productId} className="flex gap-3 py-3">
            <Link
              to={`/products/${item.productId}`}
              className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-50"
            >
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/products/${item.productId}`}
                className="line-clamp-1 text-sm font-medium text-ink-900 hover:text-brand-700"
              >
                {item.name}
              </Link>
              <p className="mt-0.5 text-xs text-ink-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-ink-900">{formatINR(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-ink-50 px-5 py-3 text-xs text-ink-600">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-brand-600" />
          {order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}
        </span>
        <span className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-brand-600" /> {order.paymentMethod}
        </span>
      </div>
    </div>
  );
}
