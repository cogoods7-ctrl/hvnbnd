'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeItem } = useCart();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div className={`overlay ${cartOpen ? 'show' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`drawer ${cartOpen ? 'show' : ''}`}>
        <div className="drawer-head">
          <h3>Your Bag</h3>
          <button className="drawer-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">
              Your bag is empty.<br /><br />
              <Link href="/shop" className="btn btn-outline" onClick={() => setCartOpen(false)}>Start Shopping</Link>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div className="cart-item" key={idx}>
                <div className="cart-item-media"><img src={item.image} alt={item.name} /></div>
                <div className="cart-item-body">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">{item.colorway} &middot; Size {item.size}</div>
                  <div className="cart-item-row">
                    <div className="qty-mini">
                      <button onClick={() => updateQty(idx, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(idx, 1)}>+</button>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                  <a href="#" className="remove-link" onClick={(e) => { e.preventDefault(); removeItem(idx); }}>Remove</a>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="subtotal-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <Link href="/checkout" className="btn btn-primary btn-block" onClick={() => setCartOpen(false)}>Checkout</Link>
            <div className="drawer-note">Shipping &amp; taxes calculated at checkout</div>
          </div>
        )}
      </div>
    </>
  );
}
