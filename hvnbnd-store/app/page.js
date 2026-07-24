import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <img className="hero-logo-full" src="/images/logo.png" alt="hvnbnd apparel" />
          <span className="eyebrow">Chapter 1 &nbsp;&middot;&nbsp; Now Available</span>
          <h1>MADE NEW. WORN IN.</h1>
          <p className="sub">
            Vintage-washed streetwear carrying scripture through every stitch.
            Chapter 1 — faith-first, made to be worn out.
          </p>
          <Link href="/shop" className="btn btn-primary">Shop Chapter 1</Link>
        </div>
      </section>

      <div className="promo-strip">
        <div className="promo-cell">Made to Order</div>
        <div className="promo-cell">Heavyweight Cotton</div>
        <div className="promo-cell">Faith-First Design</div>
      </div>

      <section className="section wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Chapter 1</span>
            <h2>Best Sellers</h2>
          </div>
          <p>Garment-dyed, mineral-washed tees built to be worn out — not stored away.</p>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/shop" className="btn btn-outline">View All Products</Link>
        </div>
      </section>
    </>
  );
}
