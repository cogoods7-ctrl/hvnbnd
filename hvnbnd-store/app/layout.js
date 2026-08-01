import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata = {
  title: 'hvnbnd apparel',
  description: 'Faith-first streetwear. Made new, worn in. Chapter 1 out now.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Nav />
            <div style={{ flex: 1 }}>{children}</div>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
