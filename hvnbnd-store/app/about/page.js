export const metadata = { title: 'About — hvnbnd apparel' };

export default function AboutPage() {
  return (
    <>
      <div className="about-hero">
        <span className="eyebrow">Our Story</span>
        <h1 style={{ marginTop: 14 }}>Heaven Bound</h1>
        <p>
          hvnbnd started as a simple idea: clothing that carries something true. Every drop pairs
          vintage-washed streetwear with scripture that means something — not slapped on, stitched
          in. We&apos;re a small studio, and every piece is made to order and shipped by our
          production partner so nothing sits in a warehouse unworn.
        </p>
      </div>
      <div className="about-grid">
        <div className="about-card">
          <div className="num">01</div>
          <h3>Faith First</h3>
          <p>Every graphic starts with a verse, not a trend. The design serves the message.</p>
        </div>
        <div className="about-card">
          <div className="num">02</div>
          <h3>Made to Order</h3>
          <p>We print through Tapstitch as orders come in — less waste, better quality control.</p>
        </div>
        <div className="about-card">
          <div className="num">03</div>
          <h3>Built to Wear In</h3>
          <p>Heavyweight cotton, mineral-washed so it already feels broken in on day one.</p>
        </div>
      </div>
    </>
  );
}
