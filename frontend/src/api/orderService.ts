import { api } from './client';
import type { Order } from '@/types';

/**
 * Order Service integration layer.
 * Endpoints (expected on the API gateway):
 *   GET   /api/orders           -> list current user's orders
 *   GET   /api/orders/:id       -> single order
 *   POST  /api/orders           -> place a new order { items, address, paymentMethod }
 */
export interface PlaceOrderPayload {
  items: { productId: string; quantity: number }[];
  address: Order['address'];
  paymentMethod: string;
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const { data } = await api.get<any>('/api/orders');
    return Array.isArray(data) ? data : data?.data || [];
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get<any>(`/api/orders/${id}`);
    return data?.data || data?.order || data;
  },

  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const { data } = await api.post<any>('/api/orders', payload);
    return data?.data || data?.order || data;
  },
};
