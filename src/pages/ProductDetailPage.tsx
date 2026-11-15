import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Share2,
} from 'lucide-react';
import { localProducts, localCategories } from '@/data/repository';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Price, Rating, StockPill, Badge } from '@/components/ui/Primitives';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const product = useMemo(() => localProducts.find((p) => p._id === id), [id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-display text-2xl font-bold text-ink-900">Product not found</p>
        <p className="mt-2 text-ink-500">The product you're looking for may have been removed.</p>
        <Link to="/products" className="btn-primary mt-6">
          Back to products
        </Link>
      </div>
    );
  }

  const catName = localCategories.find((c) => c.slug === product.category)?.name ?? product.category;
  const related = localProducts
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    add(product, qty);
    navigate('/cart');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-ink-500">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/products?category=${product.category}`} className="hover:text-brand-700">{catName}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-ink-700">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Gallery */}
        <div className="lg:col-span-5">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-ink-50">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 p-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                      activeImg === i ? 'border-brand-500' : 'border-transparent hover:border-ink-200'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button className="btn-outline flex-1 py-2.5 text-sm">
              <Heart className="h-4 w-4" /> Wishlist
            </button>
            <button className="btn-outline flex-1 py-2.5 text-sm">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-4">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-ink-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Rating value={product.rating} count={product.ratingCount} size="md" />
            <StockPill stock={product.stock} />
          </div>

          <div className="mt-4">
            <Price price={product.price} mrp={product.mrp} />
            <p className="mt-1 text-xs text-ink-500">+ ₹40 delivery fee · Inclusive of all taxes</p>
          </div>

          {/* Highlights */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-ink-900">Highlights</h3>
            <ul className="space-y-1.5">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-ink-900">Description</h3>
            <p className="text-sm leading-relaxed text-ink-600">{product.description}</p>
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:col-span-3">
          <div className="card sticky top-28 p-5">
            <Price price={product.price} mrp={product.mrp} />

            {product.stock > 0 ? (
              <>
                <div className="mt-4">
                  <p className="mb-1.5 text-sm font-medium text-ink-700">Quantity</p>
                  <div className="inline-flex items-center rounded-lg border border-ink-200">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="grid h-9 w-9 place-items-center text-ink-600 hover:bg-ink-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="grid h-9 w-9 place-items-center text-ink-600 hover:bg-ink-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  className="btn-primary mt-4 w-full"
                >
                  {added ? (
                    <><Check className="h-4 w-4" /> Added to cart</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                  )}
                </button>
                <button onClick={buyNow} className="btn-accent mt-2 w-full">
                  <Zap className="h-4 w-4" /> Buy Now
                </button>
              </>
            ) : (
              <div className="mt-4 rounded-lg bg-error-50 p-3 text-center text-sm font-medium text-error-600">
                Currently out of stock
              </div>
            )}

            {/* Delivery promises */}
            <div className="mt-5 space-y-2.5 border-t border-ink-100 pt-4">
              <Promise icon={Truck} title="Free delivery" desc="By Mon, 16 Nov" />
              <Promise icon={RotateCcw} title="7-day returns" desc="Easy replacement" />
              <Promise icon={ShieldCheck} title="Warranty" desc="Brand warranty applies" />
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-bold text-ink-900">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Promise({ icon: Icon, title, desc }: { icon: typeof Truck; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-success-50 text-success-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-800">{title}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}
