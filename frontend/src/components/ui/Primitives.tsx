import { Star } from 'lucide-react';
import { formatINR } from '@/api';

export function Rating({
  value,
  count,
  size = 'sm',
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const height = size === 'md' ? 'h-4' : 'h-3.5';
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-md ${height} px-1.5 ${
          value >= 4 ? 'bg-success-500' : value >= 3 ? 'bg-warning-500' : 'bg-error-500'
        } text-white`}
      >
        <Star className={size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5'} fill="currentColor" strokeWidth={0} />
        <span className={size === 'md' ? 'text-xs' : 'text-[11px]'}>{value.toFixed(1)}</span>
      </span>
      {count !== undefined && (
        <span className="text-xs text-ink-500">
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </div>
  );
}

export function Price({ price, mrp }: { price: number; mrp?: number }) {
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-bold text-ink-900">{formatINR(price)}</span>
      {mrp && mrp > price && (
        <>
          <span className="text-sm text-ink-400 line-through">{formatINR(mrp)}</span>
          <span className="text-sm font-semibold text-success-600">{discount}% off</span>
        </>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = 'brand',
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'ink';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    accent: 'bg-accent-50 text-accent-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    ink: 'bg-ink-100 text-ink-600',
  };
  return <span className={`chip ${tones[tone]}`}>{children}</span>;
}

export function StockPill({ stock }: { stock: number }) {
  if (stock === 0) return <Badge tone="error">Out of stock</Badge>;
  if (stock <= 10) return <Badge tone="warning">Only {stock} left</Badge>;
  return <Badge tone="success">In stock</Badge>;
}
