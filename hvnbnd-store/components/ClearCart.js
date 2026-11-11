'use client';

import { useEffect } from 'react';
import { useCart } from './CartProvider';

// Renders nothing — just empties the bag once the order has actually been
// paid for (this page only renders after Stripe redirects back on success).
export default function ClearCart() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
