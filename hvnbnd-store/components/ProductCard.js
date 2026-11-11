import Link from 'next/link';

export default function ProductCard({ product }) {
  const primary = product.image_back || product.image_front;
  const secondary = product.image_back ? product.image_front : null;
  const lowStock = product.low_stock_flag === true;
  const variants = product.variants && product.variants.length > 1 ? product.variants : null;

  return (
    <Link href={`/product/${product.id}`} className="card">
      <div className="card-media">
        <img className="img-front" src={primary} alt={`${product.name} ${product.colorway}`} />
        {secondary && <img className="img-back" src={secondary} alt={`${product.name} front`} />}
        {lowStock && <span className="card-badge">Low Stock</span>}
      </div>
      <div className="card-name">{variants ? product.name : `${product.name} — ${product.colorway}`}</div>
      <div className="card-price">${Number(product.price).toFixed(2)}</div>
      {variants && (
        <div className="swatch-dots" title={`${variants.length} colors`}>
          {variants.map((v) => (
            <span key={v.id} className="swatch-dot" style={{ background: v.swatch || '#ccc' }} />
          ))}
        </div>
      )}
    </Link>
  );
}
