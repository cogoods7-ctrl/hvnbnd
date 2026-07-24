'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';

const ACCORDION = [
  [
    'Fabric & Fit',
    '100% ringspun cotton, 240gsm heavyweight. Garment-dyed and mineral-washed for a lived-in texture — expect slight variation piece to piece. Oversized boxy fit; runs true to size with room to layer.',
  ],
  [
    'Shipping & Fulfillment',
    'Every order is produced and shipped by our print partner, Tapstitch, once your order is placed. Standard production is 3–5 business days, plus shipping.',
  ],
  ['Care', 'Machine wash cold, inside out. Hang dry or tumble low. Do not iron directly over the print.'],
];

export default function ProductActions({ product }) {
  const { addToCart } = useCart();
  const [view, setView] = useState(product.image_back ? 'back' : 'front');
  const sizes = product.sizes && product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL'];
  const [size, setSize] = useState(sizes[1] || sizes[0]);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(null);

  const media = view === 'back' && product.image_back ? product.image_back : product.image_front;
  const lowStock = product.stock < 10 && product.stock > 0;

  function handleAdd() {
    addToCart({
      productId: product.id,
      name: product.name,
      colorway: product.colorway,
      price: Number(product.price),
      image: product.image_front,
      size,
      qty,
    });
  }

  return (
    <div className="pdp">
      <div>
        <div className="pdp-media-main"><img src={media} alt={product.name} /></div>
        {product.image_back && (
          <div className="pdp-thumbs">
            <div className={`pdp-thumb ${view === 'front' ? 'active' : ''}`} onClick={() => setView('front')}>
              <img src={product.image_front} alt="front" />
            </div>
            <div className={`pdp-thumb ${view === 'back' ? 'active' : ''}`} onClick={() => setView('back')}>
              <img src={product.image_back} alt="back" />
            </div>
          </div>
        )}
      </div>
      <div className="pdp-info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <div className="pdp-price">${Number(product.price).toFixed(2)} &middot; {product.colorway}</div>
        <p className="pdp-desc">
          Heavyweight 240gsm cotton, garment-dyed and mineral-washed for a broken-in feel from the
          first wear. Boxy fit, dropped shoulder. {product.image_back ? 'Front chest hit, full back graphic.' : 'Front chest hit.'}
        </p>

        <span className="field-label">Size</span>
        <div className="opt-row">
          {sizes.map((s) => (
            <button key={s} className={`opt ${size === s ? 'selected' : ''}`} onClick={() => setSize(s)}>
              {s}
            </button>
          ))}
        </div>

        <span className="field-label">Quantity</span>
        <div className="qty-row">
          <div className="qty-box">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}>+</button>
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={product.stock < 1} onClick={handleAdd}>
          {product.stock < 1 ? 'Out of Stock' : `Add to Bag — $${(Number(product.price) * qty).toFixed(2)}`}
        </button>
        <div className={`stock-note ${lowStock ? 'stock-low' : ''}`}>
          {product.stock < 1
            ? 'Restocking soon'
            : lowStock
            ? `Only ${product.stock} left — moving fast`
            : `${product.stock} in stock`}
        </div>

        <div className="accordion">
          {ACCORDION.map(([title, body]) => (
            <div key={title} className={`accordion-item ${open === title ? 'open' : ''}`}>
              <div className="accordion-head" onClick={() => setOpen(open === title ? null : title)}>
                <span>{title}</span><span>+</span>
              </div>
              <div className="accordion-body">{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
