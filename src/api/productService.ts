import { api } from './client';
import type { Product, Category } from '@/types';

/**
 * Product Service integration layer.
 * Endpoints (expected on the API gateway):
 *   GET  /api/products            -> list + filters (query: q, category, sort, minPrice, maxPrice, page)
 *   GET  /api/products/:id        -> single product
 *   GET  /api/products/categories -> category list
 *   GET  /api/products/search?q=  -> search
 */
export const productService = {
  async getProducts(params?: Record<string, unknown>): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/api/products', { params });
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/api/products/${id}`);
    return data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/api/products/categories');
    return data;
  },

  async searchProducts(query: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/api/products/search', {
      params: { q: query },
    });
    return data;
  },
};
