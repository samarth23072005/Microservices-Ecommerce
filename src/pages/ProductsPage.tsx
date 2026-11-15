import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { localProducts, localCategories } from '@/data/repository';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
];

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const query = params.get('q') ?? '';

  const [selectedCats, setSelectedCats] = useState<string[]>(category ? [category] : []);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(80000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Sync category from URL when it changes
  useEffect(() => {
    setSelectedCats(category ? [category] : []);
  }, [category]);

  const toggleCat = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
  };

  const filtered = useMemo(() => {
    let list = [...localProducts];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        (p.name + p.brand + p.category + p.description).toLowerCase().includes(q),
      );
    }
    if (selectedCats.length) {
      list = list.filter((p) => selectedCats.includes(p.category));
    }
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    switch (sort) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        list.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
        break;
    }
    return list;
  }, [query, selectedCats, minPrice, maxPrice, minRating, inStockOnly, sort]);

  const activeCatName = localCategories.find((c) => c.slug === category)?.name;

  const clearAll = () => {
    setSelectedCats([]);
    setMinPrice(0);
    setMaxPrice(80000);
    setMinRating(0);
    setInStockOnly(false);
    setSort('relevance');
    setParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 animate-fade-in">
      {/* Breadcrumb / title */}
      <div className="mb-4">
        <p className="text-xs text-ink-500">
          Home <span className="text-ink-300">/</span>{' '}
          <span className="text-ink-700">{activeCatName || (query ? `Search: "${query}"` : 'All Products')}</span>
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-900">
          {activeCatName || (query ? `Results for "${query}"` : 'All Products')}
        </h1>
        <p className="text-sm text-ink-500">{filtered.length} products found</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <FiltersPanel
            selectedCats={selectedCats}
            toggleCat={toggleCat}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            clearAll={clearAll}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="btn-outline px-4 py-2 text-sm lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-lg border border-ink-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <EmptyState query={query} onClear={clearAll} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-card-hover animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="rounded-md p-1.5 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel
              selectedCats={selectedCats}
              toggleCat={toggleCat}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              clearAll={clearAll}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FiltersPanel(props: {
  selectedCats: string[];
  toggleCat: (s: string) => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (n: number) => void;
  setMaxPrice: (n: number) => void;
  minRating: number;
  setMinRating: (n: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (b: boolean) => void;
  clearAll: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink-900">Filters</h3>
        <button onClick={props.clearAll} className="text-xs font-medium text-brand-700 hover:underline">
          Clear all
        </button>
      </div>

      {/* Categories */}
      <FilterBlock title="Category">
        <div className="space-y-1.5">
          {localCategories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={props.selectedCats.includes(c.slug)}
                onChange={() => props.toggleCat(c.slug)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
              />
              {c.name}
            </label>
          ))}
        </div>
      </FilterBlock>

      {/* Price */}
      <FilterBlock title="Price">
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={80000}
            step={500}
            value={props.minPrice}
            onChange={(e) => props.setMinPrice(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="flex items-center justify-between text-xs text-ink-600">
            <span>₹{props.minPrice.toLocaleString('en-IN')}</span>
            <span>₹{props.maxPrice.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={80000}
            step={500}
            value={props.maxPrice}
            onChange={(e) => props.setMaxPrice(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>
      </FilterBlock>

      {/* Rating */}
      <FilterBlock title="Customer Rating">
        <div className="space-y-1.5">
          {[4, 3, 2, 0].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
              <input
                type="radio"
                name="rating"
                checked={props.minRating === r}
                onChange={() => props.setMinRating(r)}
                className="h-4 w-4 border-ink-300 text-brand-600 focus:ring-brand-400"
              />
              {r === 0 ? 'All ratings' : `${r}★ & above`}
            </label>
          ))}
        </div>
      </FilterBlock>

      {/* Stock */}
      <FilterBlock title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={props.inStockOnly}
            onChange={(e) => props.setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          />
          In stock only
        </label>
      </FilterBlock>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="mb-3 text-sm font-semibold text-ink-900">{title}</p>
      {children}
    </div>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-ink-100 text-ink-400">
        <SearchIcon className="h-6 w-6" />
      </div>
      <p className="font-semibold text-ink-800">No products found</p>
      <p className="max-w-xs text-sm text-ink-500">
        {query ? `We couldn't find anything for "${query}".` : 'Try adjusting your filters to see more results.'}
      </p>
      <button onClick={onClear} className="btn-primary mt-2">
        Clear filters
      </button>
    </div>
  );
}
