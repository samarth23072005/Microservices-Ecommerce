export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  category: string;
  brand?: string;
  description: string;
  price: number;
  mrp?: number;
  rating?: number;
  ratingCount?: number;
  stock: number;
  image?: string;
  imageUrl?: string;
  images?: string[];
  highlights?: string[];
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  address: OrderAddress;
  paymentMethod: string;
}
