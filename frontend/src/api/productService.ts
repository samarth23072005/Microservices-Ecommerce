
import { api } from './client';
import type { Product, Category } from '@/types';

export interface ProductsResponse {
  success: boolean;
  count: number;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  data: Product[];
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  data: (
    | string
    | {
        id?: string;
        name: string;
        slug?: string;
        icon?: string;
        color?: string;
      }
  )[];
}

const CATEGORY_META: Record<
  string,
  { icon: string; color: string; label?: string }
> = {
  smartphones: { icon: 'Smartphone', color: 'from-brand-500 to-brand-700', label: 'Smartphones' },
  laptops: { icon: 'Smartphone', color: 'from-brand-600 to-brand-800', label: 'Laptops' },
  tablets: { icon: 'Smartphone', color: 'from-brand-400 to-brand-600', label: 'Tablets' },
  electronics: { icon: 'Smartphone', color: 'from-brand-500 to-brand-700', label: 'Electronics' },
  'mobile-accessories': { icon: 'Headphones', color: 'from-brand-400 to-brand-600', label: 'Accessories' },
  audio: { icon: 'Headphones', color: 'from-brand-400 to-brand-600', label: 'Audio' },
  fashion: { icon: 'Shirt', color: 'from-accent-500 to-accent-700', label: 'Fashion' },
  'mens-shirts': { icon: 'Shirt', color: 'from-accent-500 to-accent-700', label: "Men's Shirts" },
  'mens-shoes': { icon: 'Footprints', color: 'from-ink-500 to-ink-700', label: "Men's Shoes" },
  'mens-watches': { icon: 'Watch', color: 'from-accent-400 to-accent-600', label: "Men's Watches" },
  'womens-dresses': { icon: 'Shirt', color: 'from-accent-600 to-accent-800', label: "Women's Dresses" },
  'womens-shoes': { icon: 'Footprints', color: 'from-ink-600 to-ink-800', label: "Women's Shoes" },
  'womens-watches': { icon: 'Watch', color: 'from-accent-400 to-accent-600', label: "Women's Watches" },
  'womens-jewellery': { icon: 'Sparkles', color: 'from-accent-500 to-brand-600', label: 'Jewellery' },
  'womens-bags': { icon: 'Briefcase', color: 'from-ink-600 to-ink-800', label: 'Bags' },
  bags: { icon: 'Briefcase', color: 'from-ink-600 to-ink-800', label: 'Bags' },
  tops: { icon: 'Shirt', color: 'from-accent-400 to-accent-600', label: 'Tops' },
  footwear: { icon: 'Footprints', color: 'from-ink-500 to-ink-700', label: 'Footwear' },
  wearables: { icon: 'Watch', color: 'from-accent-400 to-accent-600', label: 'Wearables' },
  home: { icon: 'Home', color: 'from-success-500 to-success-700', label: 'Home' },
  'home-decoration': { icon: 'Home', color: 'from-success-500 to-success-700', label: 'Home Decor' },
  furniture: { icon: 'Home', color: 'from-success-600 to-brand-700', label: 'Furniture' },
  kitchen: { icon: 'UtensilsCrossed', color: 'from-success-600 to-brand-700', label: 'Kitchen' },
  'kitchen-accessories': { icon: 'UtensilsCrossed', color: 'from-success-600 to-brand-700', label: 'Kitchen Accessories' },
  groceries: { icon: 'UtensilsCrossed', color: 'from-success-500 to-brand-600', label: 'Groceries' },
  beauty: { icon: 'Sparkles', color: 'from-error-500 to-accent-600', label: 'Beauty' },
  'skin-care': { icon: 'Sparkles', color: 'from-error-400 to-accent-500', label: 'Skin Care' },
  fragrances: { icon: 'Sparkles', color: 'from-accent-500 to-brand-600', label: 'Fragrances' },
  books: { icon: 'BookOpen', color: 'from-brand-600 to-brand-800', label: 'Books' },
  sunglasses: { icon: 'Sparkles', color: 'from-ink-500 to-brand-600', label: 'Sunglasses' },
  'sports-accessories': { icon: 'Watch', color: 'from-brand-500 to-accent-600', label: 'Sports' },
  motorcycle: { icon: 'Footprints', color: 'from-brand-600 to-ink-800', label: 'Motorcycles' },
  vehicle: { icon: 'Footprints', color: 'from-brand-600 to-ink-800', label: 'Vehicles' },
};

const formatCategoryName = (slug: string): string => {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const mapCategoryToUI = (
  item:
    | string
    | {
        id?: string;
        name: string;
        slug?: string;
        icon?: string;
        color?: string;
      },
  index: number
): Category => {
  if (typeof item === 'object' && item !== null) {
    const slug =
      item.slug ||
      item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const meta = CATEGORY_META[slug] || {
      icon: 'Tag',
      color: 'from-brand-500 to-brand-700',
    };

    return {
      id: item.id || `cat-${index + 1}-${slug}`,
      name: item.name || meta.label || formatCategoryName(slug),
      slug,
      icon: item.icon || meta.icon,
      color: item.color || meta.color,
    };
  }

  const slug = String(item).trim().toLowerCase();
  const meta = CATEGORY_META[slug] || {
    icon: 'Tag',
    color: 'from-brand-500 to-brand-700',
  };

  return {
    id: `cat-${index + 1}-${slug}`,
    name: meta.label || formatCategoryName(slug),
    slug,
    icon: meta.icon,
    color: meta.color,
  };
};

export const normalizeProduct = (product: Product): Product => {
  const fallbackImg =
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  const primaryImg =
    product.imageUrl ||
    product.image ||
    (product.images && product.images[0]) ||
    fallbackImg;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [primaryImg];

  return {
    ...product,
    _id: product._id || product.id || '',
    id: product.id || product._id || '',
    slug:
      product.slug ||
      product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    rating: typeof product.rating === 'number' ? product.rating : 4.5,
    ratingCount:
      typeof product.ratingCount === 'number' ? product.ratingCount : 50,
    mrp: product.mrp || Math.round(product.price * 1.25),
    image: primaryImg,
    imageUrl: primaryImg,
    images,
    highlights:
      product.highlights && product.highlights.length > 0
        ? product.highlights
        : [
            'Authentic certified product',
            'Fast delivery across India',
            '7-day hassle-free replacement',
          ],
    tags:
      product.tags && product.tags.length > 0
        ? product.tags
        : product.price < 50 || product.stock < 15
          ? ['deal']
          : ['new'],
  };
};

export const productService = {
  // Fetch every page of products from the backend.
  async getProducts(
    
    params?: Record<string, unknown>
  ): Promise<Product[]> {
    const limit = 100;

    const firstResponse = await api.get<ProductsResponse>(
      '/api/products',
      {
        params: { ...params, page: 1, limit },
      }
    );

    const firstData = firstResponse.data;

    if (!Array.isArray(firstData.data)) {
      throw new Error('Invalid products API response: data is not an array');
    }

    let allProducts = firstData.data.map(normalizeProduct);

    const totalPages = Math.max(1, Number(firstData.totalPages) || 1);
    console.log('PRODUCT DEBUG:', JSON.stringify({
  success: firstData.success,
  count: firstData.count,
  totalProducts: firstData.totalProducts,
  totalPages: firstData.totalPages,
  receivedOnFirstPage: firstData.data.length,
  firstProduct: firstData.data[0],
}, null, 2));
    

    for (let page = 2; page <= totalPages; page++) {
      const response = await api.get<ProductsResponse>(
        '/api/products',
        {
          params: { ...params, page, limit },
        }
      );

      if (!Array.isArray(response.data.data)) {
        throw new Error(`Invalid products response on page ${page}`);
      }

      allProducts.push(...response.data.data.map(normalizeProduct));
    }

    console.log('Total products loaded:', allProducts.length);
    console.log('FINAL PRODUCT COUNT:', allProducts.length);
    return allProducts;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<{
      success: boolean;
      data: Product;
    }>(`/api/products/${id}`);

    return normalizeProduct(data.data);
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<
      CategoriesResponse | Category[] | string[]
    >('/api/products/categories');

    let rawList: CategoriesResponse['data'] = [];

    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    }

    return rawList.map((item, idx) =>
      mapCategoryToUI(item, idx)
    );
  },

  async searchProducts(
    query: string,
    params?: Record<string, unknown>
  ): Promise<Product[]> {
    const { data } = await api.get<ProductsResponse>(
      '/api/products/search',
      {
        params: { q: query, ...params },
      }
    );

    const list = Array.isArray(data.data) ? data.data : [];

    return list.map(normalizeProduct);
  },
};

