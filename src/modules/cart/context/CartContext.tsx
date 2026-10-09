import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { ProductModel } from '@/modules/room-service/models/product.model';
import type { CartItemModel } from '../models/cart-item.model';

interface CartContextValue {
  items: CartItemModel[];
  add: (product: ProductModel, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemModel[]>([]);
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      add: (product, quantity = 1) =>
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          return existing
            ? current.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              )
            : [...current, { product, quantity }];
        }),
      setQuantity: (productId, quantity) =>
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.product.id !== productId)
            : current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        ),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>.');
  return context;
}
