import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const qty = action.quantity ?? 1;
      const existing = state.items.find((i) => i.product._id === action.product._id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product._id === action.product._id ? { ...i, quantity: i.quantity + qty } : i,
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: qty }] };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.product._id !== action.productId) };
    case 'SET_QTY':
      return {
        items: state.items
          .map((i) =>
            i.product._id === action.productId ? { ...i, quantity: Math.max(0, action.quantity) } : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'shopkart_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', items: JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    return {
      items: state.items,
      count,
      subtotal,
      add: (product, quantity) => dispatch({ type: 'ADD', product, quantity }),
      remove: (productId) => dispatch({ type: 'REMOVE', productId }),
      setQty: (productId, quantity) => dispatch({ type: 'SET_QTY', productId, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
