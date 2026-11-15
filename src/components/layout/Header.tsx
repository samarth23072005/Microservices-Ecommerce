import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Package,
  LogOut,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { localCategories } from '@/data/repository';
import type { Category } from '@/types';

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  const cats = useMemo<Category[]>(() => localCategories, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-700 text-white shadow-lg">
      {/* Top bar */}
      <div className="hidden bg-brand-800 text-xs text-brand-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Deliver to Bengaluru 560001
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-accent-300" /> Free delivery on orders over ₹499
          </span>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          className="rounded-md p-1.5 hover:bg-brand-600 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-700">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <span className="font-display text-xl font-extrabold tracking-tight">ShopKart</span>
            <span className="hidden text-[10px] text-brand-200 sm:block">India's Smart Marketplace</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={submitSearch} className="relative flex-1">
          <div className="flex w-full overflow-hidden rounded-lg bg-white shadow-sm">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for products, brands and more…"
              className="w-full px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-brand-50 px-4 text-brand-700 transition hover:bg-brand-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-brand-600"
              >
                <UserIcon className="h-5 w-5" />
                <span className="hidden text-sm sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg bg-white py-1 text-ink-800 shadow-card-hover animate-scale-in">
                  <div className="border-b border-ink-100 px-4 py-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-ink-500">{user.email}</p>
                  </div>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-brand-600"
            >
              <UserIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-brand-600"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category nav (desktop) */}
      <nav className="hidden border-t border-brand-600/40 bg-brand-700 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 text-sm">
          <Link to="/products" className="rounded px-3 py-1 font-medium text-brand-100 hover:bg-brand-600 hover:text-white">
            All Products
          </Link>
          {cats.slice(0, 9).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="rounded px-3 py-1 text-brand-100 transition hover:bg-brand-600 hover:text-white"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-brand-600/40 bg-brand-700 lg:hidden animate-fade-in">
          <nav className="flex flex-col px-4 py-2 text-sm">
            <Link to="/products" className="rounded px-3 py-2 text-brand-100 hover:bg-brand-600">
              All Products
            </Link>
            {cats.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="rounded px-3 py-2 text-brand-100 hover:bg-brand-600"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
