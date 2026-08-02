# hvnbnd apparel — store

Real, deployable version of your store: Next.js storefront + Stripe checkout +
Supabase database + a hidden `/admin/dashboard` that nobody can reach without
your password. Nothing in the site's navigation links to it.

Follow these steps in order. None of it requires deep coding experience —
just careful copy/pasting.

## 0. What you'll need accounts for (all free to start)
- [Supabase](https://supabase.com) — the database (products + orders)
- [Stripe](https://stripe.com) — payments
- [Vercel](https://vercel.com) — hosting
- [GitHub](https://github.com) — to hand your code to Vercel

---

## 1. Set up Supabase (the database)

1. Go to supabase.com, create a free account, then **New Project**.
2. Once it's created, open **SQL Editor** in the left sidebar → **New Query**.
3. Open `supabase/schema.sql` from this project, copy the whole file, paste
   it into the SQL editor, and click **Run**. This creates your `products`
   and `orders` tables and loads in your two shirt designs.
4. Go to **Project Settings > API**. You'll need three values from this page
   in step 4 below:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" — keep this one secret, never put
     it in client-facing code)

## 2. Set up Stripe (payments)

1. Create a Stripe account at stripe.com.
2. In the dashboard, make sure you're in **Test mode** (toggle top right) —
   we'll switch to live mode at the very end.
3. Go to **Developers > API keys** and copy the **Secret key**.
4. You'll set up the **webhook** after your first deploy (step 5) — Stripe
   needs your live URL to send it to.

## 3. Get the code onto GitHub

1. Create a new (private is fine) repository on GitHub.
2. Upload everything in this folder to that repository (drag-and-drop on
   GitHub's web UI works, or use `git` from the command line if you're
   comfortable with it).

## 4. Deploy to Vercel

1. Go to vercel.com, sign in with GitHub, click **Add New > Project**, and
   import the repository you just created.
2. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
   | `STRIPE_SECRET_KEY` | your Stripe secret key |
   | `STRIPE_WEBHOOK_SECRET` | *(leave blank for now — step 5)* |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-url.vercel.app` for now |
   | `ADMIN_PASSWORD` | a password only you know |
   | `SESSION_SECRET` | a long random string — see below |

   To generate `SESSION_SECRET`, run this in any terminal (Mac Terminal
   works) and paste the result:
   ```
   openssl rand -hex 32
   ```
3. Click **Deploy**. In a minute or two you'll get a live URL like
   `hvnbnd-store.vercel.app`.

## 5. Connect Stripe's webhook (so payments actually mark orders as paid)

1. In Stripe, go to **Developers > Webhooks > Add endpoint**.
2. Endpoint URL: `https://your-vercel-url.vercel.app/api/webhook`
   (use your real domain here once you've connected it in step 7).
3. Select event: `checkout.session.completed`.
4. Save, then copy the **Signing secret** (starts with `whsec_...`).
5. Back in Vercel: **Project Settings > Environment Variables**, add/update
   `STRIPE_WEBHOOK_SECRET` with that value, then **redeploy** (Vercel's
   Deployments tab > ⋯ > Redeploy) so the new variable takes effect.

## 6. Test it

1. Visit your Vercel URL, add something to the bag, and check out.
2. Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC,
   any ZIP.
3. You should land on the success page, and the order should show up at
   `your-url.vercel.app/admin/dashboard` (log in with your `ADMIN_PASSWORD`)
   with status **Processing**.
4. Confirm `/admin` is **not** linked anywhere on the site — it isn't; you
   have to type the URL.

## 7. Connect your domain

1. In Vercel: **Project Settings > Domains**, add the domain you bought.
2. Vercel will show you DNS records to add — go to wherever you bought the
   domain (GoDaddy, Namecheap, etc.), find DNS settings, and add those
   records. This usually takes a few minutes to a few hours to fully
   propagate.
3. Once your domain is live, update `NEXT_PUBLIC_SITE_URL` in Vercel's
   environment variables to your real domain (`https://hvnbnd.com`), and
   update the Stripe webhook URL from step 5 to use the real domain too.
   Redeploy after both changes.

## 8. Go live (real money)

Everything above uses Stripe **test mode** — no real charges happen.
When you're ready to accept real payments:

1. In Stripe, toggle to **Live mode**.
2. Get your **live** secret key from Developers > API keys and set it as
   `STRIPE_SECRET_KEY` in Vercel (replacing the test one).
3. Create a **new** webhook endpoint in live mode pointing at
   `https://yourdomain.com/api/webhook`, and update `STRIPE_WEBHOOK_SECRET`
   in Vercel with the new live signing secret.
4. Redeploy.

## Running it locally (optional, for testing changes before deploying)

```bash
npm install
cp .env.example .env.local   # then fill in the same values as above
npm run dev
```
Visit `http://localhost:3000`. For Stripe webhooks locally, use the
[Stripe CLI](https://stripe.com/docs/stripe-cli) (`stripe listen --forward-to
localhost:3000/api/webhook`).

## How the admin dashboard is protected

`/admin` is a plain login page — it's the only admin route Google or a
visitor could stumble onto, and all it does is ask for a password.
`/admin/dashboard` and everything under `/api/admin/*` are blocked by
`middleware.js`, which runs before the page ever loads and checks for a
signed cookie that's only set after a correct password. No link to `/admin`
appears anywhere in the site's nav, footer, or sitemap.

## Project structure

```
app/                  pages (App Router)
  page.js             home
  shop/                shop grid
  product/[id]/        product detail
  checkout/            checkout form → Stripe
  success/             post-payment confirmation
  admin/               login (public) + dashboard (protected)
  api/                 checkout, Stripe webhook, admin data routes
components/           Nav, Footer, cart, product UI
lib/                  Supabase clients, product data helpers
supabase/schema.sql   run once to set up your database
public/images/        your real product + logo photos
middleware.js         gates /admin/dashboard and /api/admin/*
```

## Adding/editing products later

Easiest: use the **Products** tab in `/admin/dashboard` — add new items,
edit stock, and log Tapstitch Product IDs right from there. For swapping in
new photography, drop the image file into `public/images/`, redeploy, then
update that product's image path in the dashboard (or directly in Supabase's
Table Editor).
