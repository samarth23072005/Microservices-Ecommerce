import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Headphones,
  Watch,
  Footprints,
  Sparkles,
  BookOpen,
  UtensilsCrossed,
  Briefcase,
  ShieldCheck,
  Truck,
  Tag,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { productService } from '@/api/productService';
import type { Product, Category } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  Home: HomeIcon,
  Headphones,
  Watch,
  Footprints,
  Sparkles,
  BookOpen,
  UtensilsCrossed,
  Briefcase,
  Tag,
};

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and categories on mount from API Gateway
  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [fetchedProducts, fetchedCategories] = await Promise.all([
          productService.getProducts({ limit: 100 }),
          productService.getCategories(),
        ]);

        if (isMounted) {
          setProducts(fetchedProducts);
          setCategories(fetchedCategories);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[HomePage] Failed to fetch homepage data:', err);
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to connect to the store backend.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Today's Deals: products tagged 'deal', or sensible fallback selection
  const deals = useMemo(() => {
    if (!products.length) return [];
    const tagged = products.filter(
      (p) => p.tags?.includes('deal') || (p.mrp && p.mrp > p.price * 1.15)
    );
    return (tagged.length >= 4 ? tagged : products).slice(0, 8);
  }, [products]);

  // New Arrivals: newest products or sensible fallback selection
  const newArrivals = useMemo(() => {
    if (!products.length) return [];
    const tagged = products.filter((p) => p.tags?.includes('new'));
    if (tagged.length >= 4) return tagged.slice(0, 4);
    // Sensible fallback: slice of products distinct from deals
    return products.slice(8, 12).length >= 4
      ? products.slice(8, 12)
      : products.slice(0, 4);
  }, [products]);

  // Top Rated: products sorted by rating descending (safely handles missing ratings)
  const featured = useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 5);
  }, [products]);

  return (
    <div className="animate-fade-in">
      {/* ERROR BANNER IF GATEWAY IS UNREACHABLE */}
      {error && (
        <div className="bg-error-500/10 border-b border-error-500/20 px-4 py-3 text-center text-sm text-error-700">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-error-600" />
            <span>
              Could not fetch live products from the API Gateway: {error}
            </span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div className="text-white">
            <span className="chip bg-white/15 text-white backdrop-blur">
              <Tag className="h-3.5 w-3.5" /> Big Billion Sale — up to 80% off
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              Shop smarter, <span className="text-accent-300">live better.</span>
            </h1>
            <p className="mt-4 max-w-md text-brand-100">
              Discover millions of products across electronics, fashion, home and more — with fast delivery
              across India and easy returns.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn-accent px-6 py-3 text-base">
                Start Shopping <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/products?category=smartphones"
                className="btn px-6 py-3 text-base text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/10"
              >
                Explore Smartphones
              </Link>
            </div>
            <div className="mt-8 flex gap-6 text-sm">
              <Stat value="2M+" label="Products" />
              <Stat value="50k+" label="Pincodes" />
              <Stat value="4.6★" label="Avg. rating" />
            </div>
          </div>

          {/* Hero collage */}
          <div className="relative hidden md:block">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 h-40 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-28 animate-pulse rounded-2xl bg-white/10" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {featured.slice(0, 4).map((p, i) => (
                  <Link
                    to={`/products/${p._id}`}
                    key={p._id}
                    className={`overflow-hidden rounded-2xl bg-white/10 p-2 backdrop-blur transition hover:bg-white/20 ${
                      i === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <img
                      src={p.images?.[0] || p.imageUrl || p.image || ''}
                      alt={p.name}
                      className={`w-full rounded-xl object-cover ${
                        i === 0 ? 'h-40' : 'h-28'
                      }`}
                    />
                    <p className="mt-1.5 truncate text-xs font-medium text-white">
                      {p.name}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeader title="Shop by Category" link="/products" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="card flex flex-col items-center gap-2 p-3"
                >
                  <div className="h-12 w-12 animate-pulse rounded-full bg-ink-100" />
                  <div className="h-3 w-14 animate-pulse rounded bg-ink-100" />
                </div>
              ))
            : categories.slice(0, 10).map((c) => {
                const Icon = ICONS[c.icon] ?? Tag;
                return (
                  <Link
                    key={c.id}
                    to={`/products?category=${c.slug}`}
                    className="card group flex flex-col items-center gap-2 p-3 transition hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${c.color} text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-center text-xs font-medium text-ink-700 group-hover:text-brand-700">
                      {c.name}
                    </span>
                  </Link>
                );
              })}
        </div>
      </section>

      {/* DEALS */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold">Today's Deals</h2>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="card h-72 animate-pulse bg-ink-100" />
                ))
              : deals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <PromoCard
            title="Smartphones Festival"
            subtitle="From ₹999"
            tone="from-brand-600 to-brand-800"
            cta="/products?category=smartphones"
          />
          <PromoCard
            title="Beauty & Glow"
            subtitle="Min. 40% off"
            tone="from-accent-500 to-accent-700"
            cta="/products?category=beauty"
          />
          <PromoCard
            title="Home Makeover"
            subtitle="Under ₹1,499"
            tone="from-success-600 to-brand-700"
            cta="/products?category=furniture"
          />
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="New Arrivals" link="/products" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="card h-72 animate-pulse bg-ink-100" />
              ))
            : newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* TOP RATED */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Top Rated by Customers" link="/products" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="card h-72 animate-pulse bg-ink-100" />
              ))
            : featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Truck,
              title: 'Free & Fast Delivery',
              desc: 'On orders above ₹499, across 50k+ pincodes.',
            },
            {
              icon: ShieldCheck,
              title: 'Buyer Protection',
              desc: '100% secure payments & buyer guarantee.',
            },
            {
              icon: Tag,
              title: 'Best Prices',
              desc: 'Genuine products at the lowest prices.',
            },
          ].map((f) => (
            <div key={f.title} className="card flex items-start gap-3 p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-ink-900">{f.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-brand-200">{label}</p>
    </div>
  );
}

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-xl font-bold text-ink-900">{title}</h2>
      <Link
        to={link}
        className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function PromoCard({
  title,
  subtitle,
  tone,
  cta,
}: {
  title: string;
  subtitle: string;
  tone: string;
  cta: string;
}) {
  return (
    <Link
      to={cta}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${tone} p-6 text-white transition hover:scale-[1.02]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mt-1 text-sm text-white/80">{subtitle}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
        Shop now <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
