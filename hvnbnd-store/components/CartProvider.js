'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hvnbnd_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('hvnbnd_cart', JSON.stringify(cart));
  }, [cart, hydrated]);

  function addToCart(item) {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === item.productId && i.size === item.size);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], qty: next[existingIdx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    setCartOpen(true);
  }

  function updateQty(idx, delta) {
    setCart((prev) => {
      const next = [...prev];
      if (!next[idx]) return prev;
      next[idx] = { ...next[idx], qty: next[idx].qty + delta };
      return next.filter((i) => i.qty > 0);
    });
  }

  function removeItem(idx) {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearCart() {
    setCart([]);
  }

  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, count, cartOpen, setCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
