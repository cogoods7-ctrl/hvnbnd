import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default async function ShopPage({ searchParams }) {
  const products = await getProducts();
  const cats = ['All', ...new Set(products.map((p) => p.category))];
  const active = searchParams?.category || 'All';
  const list = active === 'All' ? products : products.filter((p) => p.category === active);

  return (
    <div className="wrap" style={{ paddingTop: 44, paddingBottom: 100 }}>
      <div className="section-head">
        <div>
          <span className="eyebrow">Full Catalog</span>
          <h2>Shop All</h2>
        </div>
        <p>{products.length} pieces available, produced &amp; fulfilled through Tapstitch.</p>
      </div>
      <div className="chip-row">
        {cats.map((c) => (
          <Link
            key={c}
            href={c === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(c)}`}
            className={`chip ${active === c ? 'active' : ''}`}
          >
            {c}
          </Link>
        ))}
      </div>
      <div className="grid">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
