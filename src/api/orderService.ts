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
    const { data } = await api.get<Order[]>('/api/orders');
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/api/orders/${id}`);
    return data;
  },

  async placeOrder(payload: PlaceOrderPayload): Promise<Order> {
    const { data } = await api.post<Order>('/api/orders', payload);
    return data;
  },
};
