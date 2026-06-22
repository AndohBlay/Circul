# Circul — Client App

The customer-facing storefront: browse phones, sign up, verify by OTP, check
out, and manage installment plans. Separate from `frontend-admin`, talks to
the same Laravel API.

## Stack
- React 19 + Vite
- Tailwind CSS v4 (`@theme` tokens in `src/index.css` — colors, fonts)
- react-router-dom v7
- axios (`src/api/`) with a bearer-token interceptor (Sanctum personal access tokens)

## Setup
```bash
npm install
cp .env.example .env   # point VITE_API_URL at your Laravel backend
npm run dev
```

## Structure
```
src/
  api/         one file per backend resource (auth, products, orders, payments, identity)
  context/     AuthContext (session), CartContext (client-side cart, localStorage)
  components/  shared UI (Navbar w/ cart icon, FormField, AuthShell, CycleRing, ProductCard, ProtectedRoute)
  pages/
    auth/      SignUp, OTPVerify, SignIn, ForgotPassword, ResetPassword
    shop/      product browse + add to cart (protected — landing only shows a preview)
    cart/      Cart, Checkout (full payment or installment plan), PaymentCallback
    dashboard/ logged-in home (identity verification banner), VerifyIdentity (Ghana Card upload)
    orders/    TrackOrder (public, by order number)
```

## Payment flow (Paystack, hosted redirect)
1. `Checkout` creates a real `Order` via `POST /orders`, then either:
   - **Full payment**: `POST /payments/initialize` → redirect to the returned `payment_url`
   - **Installment**: `POST /installments/plan`, then initializes the first (down payment) schedule the same way
2. Paystack redirects back to your app with `?reference=...` after payment — that's handled by `/payment/callback`, which calls `/payments/verify` (or `/installments/verify` for installment plans) and clears the cart on success.
3. **Important**: the backend's `initializeFullPayment`/`initializeSchedulePayment` don't pass a `callback_url` to Paystack, so Paystack uses whatever default callback URL is set in your Paystack dashboard. Set that to `<your-client-app-url>/payment/callback` (e.g. `https://app.circul.com/payment/callback`), or ask me to add an explicit `callback_url` param to those two backend calls instead.

## Design tokens
Defined in `src/index.css` under `@theme`. Ink-navy base, amber accent for
financing/value, mint for paid/success states. The `CycleRing` component is
the brand's signature visual — a segmented progress ring representing
payment cycles, reused for the hero, plan cards, and (eventually) loading
states.

## Auth flow
Register → OTP verify → token issued → stored in `localStorage` as
`circul_token`/`circul_user` → attached as `Authorization: Bearer` on every
request via the axios interceptor in `src/api/client.js`. A 401 anywhere
clears the session and redirects to `/signin`.

## Still to build
- Order history, installment schedule management (view/pay individual installments after the first)
- Profile, change password
- Shop filtering/search UI (backend already supports category_id, price range, search, sort)
