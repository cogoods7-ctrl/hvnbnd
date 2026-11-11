import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, getVariants } from '@/lib/products';
import ProductActions from '@/components/ProductActions';

export const revalidate = 0;

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();

  // If this product is one color of a multi-color product, load its siblings
  // so the page can show color swatches.
  let variants = [product];
  if (product.group_id) {
    const siblings = await getVariants(product.group_id);
    if (siblings.length) variants = siblings;
  }

  return (
    <>
      <Link href="/shop" className="back-link">&larr; Back to Shop</Link>
      <ProductActions product={product} variants={variants} />
    </>
  );
}
