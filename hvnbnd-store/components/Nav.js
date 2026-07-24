'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

// Note: intentionally no link to /admin anywhere in here or in Footer.js.
// The dashboard is reached only by typing the URL directly.
export default function Nav() {
  const { count, setCartOpen } = useCart();

  return (
    <>
      <div className="announce">Free shipping on orders over $75 &middot; Made new drops monthly</div>
      <div className="nav">
        <div className="nav-inner">
          <div className="nav-links">
            <Link href="/shop">Shop</Link>
            <Link href="/shop?category=Graphic%20Tees">Graphic Tees</Link>
            <Link href="/shop?category=Art%20Studio">Art Studio</Link>
          </div>
          <Link href="/" className="logo-mark"><img src="/images/logo.png" alt="hvnbnd apparel" /></Link>
          <div className="nav-right">
            <Link href="/about" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              About
            </Link>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              Bag {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
