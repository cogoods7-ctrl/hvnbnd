import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/products';
import ProductActions from '@/components/ProductActions';

export const revalidate = 0;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();

  return (
    <>
      <Link href="/shop" className="back-link">&larr; Back to Shop</Link>
      <ProductActions product={product} />
    </>
  );
}
