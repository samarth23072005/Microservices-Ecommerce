export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  stock: number;
  images: string[];
  highlights: string[];
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  address: {
    name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}
