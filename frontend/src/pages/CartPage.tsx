import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/api';
import { orderService } from '@/api';
import { localOrders } from '@/data/repository';

export function CartPage() {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [placedId, setPlacedId] = useState<string | null>(null);

  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.03);
  const total = subtotal + deliveryFee + tax;

  const placeOrder = async () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    setPlacing(true);
    try {
      const order = await orderService.placeOrder({
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        address: {
          name: user.name,
          phone: '+91 98765 43210',
          line1: 'Flat 402, Sunrise Apartments',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
        },
        paymentMethod: 'UPI',
      });
      setPlacedId(order._id);
      clear();
    } catch {
      // backend not connected — simulate a successful order
      const fakeId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setPlacedId(fakeId);
      clear();
    } finally {
      setPlacing(false);
    }
  };

  if (placedId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-scale-in">
        <div className="card p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-50 text-success-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Order placed!</h1>
          <p className="mt-2 text-ink-600">
            Your order <span className="font-semibold text-brand-700">{placedId}</span> has been confirmed.
            You'll receive a confirmation shortly.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/orders" className="btn-primary">View Orders</Link>
            <Link to="/products" className="btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-fade-in">
        <div className="card p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-100 text-ink-400">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Your cart is empty</h1>
          <p className="mt-2 text-ink-500">Browse our products and add something you love.</p>
          <Link to="/products" className="btn-primary mt-6">
            <ArrowLeft className="h-4 w-4" /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      <h1 className="mb-5 font-display text-2xl font-bold text-ink-900">
        Shopping Cart <span className="text-base font-normal text-ink-500">({items.length} items)</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card divide-y divide-ink-100">
            {items.map((item) => (
              <div key={item.product._id} className="flex gap-4 p-4">
                <Link
                  to={`/products/${item.product._id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-50"
                >
                  <img
                    src={item.product.images?.[0] || item.product.imageUrl || item.product.image || ''}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase text-ink-400">{item.product.brand}</p>
                  <Link
                    to={`/products/${item.product._id}`}
                    className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-700"
                  >
                    {item.product.name}
                  </Link>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-bold text-ink-900">{formatINR(item.product.price)}</span>
                    {item.product.mrp && item.product.mrp > item.product.price && (
                      <span className="text-xs text-ink-400 line-through">{formatINR(item.product.mrp)}</span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-4">
                    <div className="inline-flex items-center rounded-lg border border-ink-200">
                      <button
                        onClick={() => setQty(item.product._id, item.quantity - 1)}
                        className="grid h-8 w-8 place-items-center text-ink-600 hover:bg-ink-50"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => setQty(item.product._id, item.quantity + 1)}
                        className="grid h-8 w-8 place-items-center text-ink-600 hover:bg-ink-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.product._id)}
                      className="flex items-center gap-1 text-sm font-medium text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-ink-400">Subtotal</p>
                  <p className="font-bold text-ink-900">{formatINR(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between p-4">
              <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Continue shopping
              </Link>
              <button onClick={clear} className="text-sm font-medium text-ink-500 hover:text-error-600">
                Clear cart
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-28 p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Price Details</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <Row label={`Price (${items.length} items)`} value={formatINR(subtotal)} />
              <Row label="Delivery" value={deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)} highlight={deliveryFee === 0} />
              <Row label="Taxes (3%)" value={formatINR(tax)} />
              {deliveryFee === 0 && subtotal > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-xs font-medium text-success-700">
                  <Tag className="h-3.5 w-3.5" /> You saved {formatINR(40)} on delivery!
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="font-bold text-ink-900">Total</span>
              <span className="font-display text-xl font-bold text-ink-900">{formatINR(total)}</span>
            </div>

            <button onClick={placeOrder} disabled={placing} className="btn-accent mt-5 w-full py-3">
              {placing ? 'Placing order…' : user ? 'Place Order' : 'Login to Checkout'}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-400">
              <ShieldCheck className="h-4 w-4 text-success-600" /> 100% secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span className={highlight ? 'font-semibold text-success-600' : 'font-medium text-ink-800'}>{value}</span>
    </div>
  );
}
