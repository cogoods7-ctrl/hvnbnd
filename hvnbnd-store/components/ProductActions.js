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
    'Every order is custom made once it is placed. Production takes 1–3 days, and shipping takes 9–14 days once it leaves production — so plan on 10–17 days total from order to delivery.',
  ],
  ['Care', 'Machine wash cold, inside out. Hang dry or tumble low. Do not iron directly over the print.'],
];

// `variants` is every colorway of this product (including the one being
// viewed). Single-color products just pass a list of one.
export default function ProductActions({ product, variants }) {
  const { addToCart } = useCart();
  const colors = variants && variants.length ? variants : [product];
  const [current, setCurrent] = useState(product);
  const [view, setView] = useState(product.image_back ? 'back' : 'front');
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(null);

  const sizes = current.sizes && current.sizes.length ? current.sizes : ['S', 'M', 'L', 'XL'];
  const activeSize = size && sizes.includes(size) ? size : sizes[1] || sizes[0];

  const media = view === 'back' && current.image_back ? current.image_back : current.image_front;
  const lowStock = current.low_stock_flag === true && current.stock > 0;

  function pickColor(v) {
    setCurrent(v);
    setQty(1);
  }

  function handleAdd() {
    addToCart({
      productId: current.id,
      name: current.name,
      colorway: current.colorway,
      price: Number(current.price),
      image: current.image_front,
      size: activeSize,
      qty,
    });
  }

  return (
    <div className="pdp">
      <div>
        <div className="pdp-media-main"><img src={media} alt={`${current.name} — ${current.colorway}`} /></div>
        {current.image_back && (
          <div className="pdp-thumbs">
            <div className={`pdp-thumb ${view === 'front' ? 'active' : ''}`} onClick={() => setView('front')}>
              <img src={current.image_front} alt="front" />
            </div>
            <div className={`pdp-thumb ${view === 'back' ? 'active' : ''}`} onClick={() => setView('back')}>
              <img src={current.image_back} alt="back" />
            </div>
          </div>
        )}
      </div>
      <div className="pdp-info">
        <span className="eyebrow">{current.category}</span>
        <h1>{current.name}</h1>
        <div className="pdp-price">${Number(current.price).toFixed(2)}</div>
        <p className="pdp-desc">
          Heavyweight 240gsm cotton, garment-dyed and mineral-washed for a broken-in feel from the
          first wear. Boxy fit, dropped shoulder. {current.image_back ? 'Front chest hit, full back graphic.' : 'Front chest hit.'}
        </p>

        {colors.length > 1 && (
          <>
            <span className="field-label">Color: <b style={{ color: 'var(--ink)' }}>{current.colorway}</b></span>
            <div className="color-swatch-row">
              {colors.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  title={v.colorway}
                  aria-label={v.colorway}
                  className={`color-swatch ${v.id === current.id ? 'selected' : ''} ${v.stock < 1 ? 'soldout' : ''}`}
                  style={{ background: v.swatch || '#cccccc' }}
                  onClick={() => pickColor(v)}
                />
              ))}
            </div>
          </>
        )}

        <span className="field-label">Size</span>
        <div className="opt-row">
          {sizes.map((s) => (
            <button key={s} className={`opt ${activeSize === s ? 'selected' : ''}`} onClick={() => setSize(s)}>
              {s}
            </button>
          ))}
        </div>

        <span className="field-label">Quantity</span>
        <div className="qty-row">
          <div className="qty-box">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(Math.max(current.stock, 1), q + 1))}>+</button>
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={current.stock < 1} onClick={handleAdd}>
          {current.stock < 1 ? 'Out of Stock' : `Add to Bag — $${(Number(current.price) * qty).toFixed(2)}`}
        </button>
        <div className={`stock-note ${lowStock ? 'stock-low' : ''}`}>
          {current.stock < 1
            ? 'Restocking soon'
            : lowStock
            ? `Only ${current.stock} left — moving fast`
            : `${current.stock} in stock`}
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
