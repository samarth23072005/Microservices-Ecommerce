import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Price, Rating, StockPill, Badge } from '@/components/ui/Primitives';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={`/products/${product._id}`} className="relative block">
        <div className="aspect-square overflow-hidden bg-ink-50">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.tags?.includes('deal') && <Badge tone="accent">Deal</Badge>}
          {product.tags?.includes('new') && <Badge tone="brand">New</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{product.brand}</p>
        <Link
          to={`/products/${product._id}`}
          className="mt-0.5 line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-700"
        >
          {product.name}
        </Link>
        <div className="mt-1.5">
          <Rating value={product.rating} count={product.ratingCount} />
        </div>
        <div className="mt-2">
          <Price price={product.price} mrp={product.mrp} />
        </div>
        <div className="mt-1.5">
          <StockPill stock={product.stock} />
        </div>
        <button
          onClick={() => add(product)}
          disabled={product.stock === 0}
          className="btn-primary mt-3 w-full py-2 text-sm"
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
