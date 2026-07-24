import Link from 'next/link';

export default function ProductCard({ product }) {
  const primary = product.image_back || product.image_front;
  const secondary = product.image_back ? product.image_front : null;
  const lowStock = product.stock < 10;

  return (
    <Link href={`/product/${product.id}`} className="card">
      <div className="card-media">
        <img className="img-front" src={primary} alt={`${product.name} ${product.colorway}`} />
        {secondary && <img className="img-back" src={secondary} alt={`${product.name} front`} />}
        {lowStock && <span className="card-badge">Low Stock</span>}
      </div>
      <div className="card-name">{product.name} — {product.colorway}</div>
      <div className="card-price">${Number(product.price).toFixed(2)}</div>
    </Link>
  );
}
