import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div>
          <div className="foot-logo"><img src="/images/logo.png" alt="hvnbnd" /></div>
          <p style={{ marginTop: 16, maxWidth: 260 }}>
            Faith-first streetwear, made new one drop at a time. Every piece custom made to order.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link href="/shop">All Products</Link>
          <Link href="/shop?category=Graphic%20Tees">Graphic Tees</Link>
          <Link href="/shop?category=Art%20Studio">Art Studio</Link>
        </div>
        <div>
          <h4>Studio</h4>
          <Link href="/about">About hvnbnd</Link>
        </div>
        <div>
          <h4>Support</h4>
          <p>Shipping &amp; Returns</p>
          <p>hvnbndclo@gmail.com</p>
        </div>
      </div>
      <div className="foot-bottom">© 2026 hvnbnd apparel — made new in Christ, 2 Corinthians 5:17</div>
    </footer>
  );
}
