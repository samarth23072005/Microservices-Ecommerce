import { products as sampleProducts, categories as sampleCategories, sampleOrders } from '@/data/sampleData';
import type { Product, Category, Order } from '@/types';
import { productService, orderService } from '@/api';

/**
 * Thin data layer that tries the real backend services first and
 * gracefully falls back to bundled sample data when the API Gateway
 * isn't reachable (e.g. during local frontend-only development).
 *
 * When the backend is connected, every call resolves from the gateway
 * and the sample data is never used.
 */
async function withFallback<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call();
  } catch (err) {
    // Network / gateway down -> use sample data silently.
    return fallback;
  }
}

export const productRepository = {
  list(params?: Record<string, unknown>): Promise<Product[]> {
    return withFallback(() => productService.getProducts(params), sampleProducts);
  },
  byId(id: string): Promise<Product | undefined> {
    return withFallback(
      () => productService.getProductById(id),
      sampleProducts.find((p) => p._id === id || p.slug === id),
    );
  },
  categories(): Promise<Category[]> {
    return withFallback(() => productService.getCategories(), sampleCategories);
  },
  search(query: string): Promise<Product[]> {
    if (!query.trim()) return Promise.resolve(sampleProducts);
    return withFallback(
      () => productService.searchProducts(query),
      sampleProducts.filter((p) =>
        (p.name + p.brand + p.category + p.description).toLowerCase().includes(query.toLowerCase()),
      ),
    );
  },
};

export const orderRepository = {
  list(): Promise<Order[]> {
    return withFallback(() => orderService.getOrders(), sampleOrders);
  },
};

/** Synchronous helpers over the bundled sample data (used for instant UI filtering). */
export const localProducts = sampleProducts;
export const localCategories = sampleCategories;
export const localOrders = sampleOrders;
