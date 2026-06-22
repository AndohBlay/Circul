# Circul — Admin Console

Staff-facing console for admin and superadmin roles: catalog management,
order fulfillment, dashboard stats, and (superadmin only) staff/client
management. Separate app from `frontend-client`, same Laravel API,
different subdomain.

## Stack
- React 19 + Vite
- Tailwind CSS v4 — same design tokens as the client app (`src/index.css`)
  so the two feel like one product, just different modes (storefront vs console)
- react-router-dom v7
- axios with bearer-token interceptor — token stored under a **different**
  localStorage key (`circul_admin_token`) than the client app so the two
  never collide if ever opened in the same browser

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Auth & roles
Admins log in through the same `/login` endpoint clients use — there's no
separate admin login route on the backend. The frontend then checks
`user.roles` to decide access:
- no `admin`/`superadmin` role → redirected to `/access-denied`
- `admin` → Dashboard, Products, Orders
- `superadmin` → all of the above, plus Admins and Clients

**Backend dependency**: `/login` and `/me` need to actually return the
user's roles for this to work. Right now `AuthController` returns the bare
`User` model, and Spatie's `HasRoles` trait doesn't auto-append a `roles`
array to JSON output unless it's eager-loaded or explicitly appended. You'll
want to either:
- `$user->load('roles')` before returning it in `login()`/`me()`, or
- add `protected $with = ['roles'];` on the `User` model, or
- append a `role_names` accessor via `getRoleNamesAttribute()` + `$appends`

`AuthContext.jsx` defensively handles roles as either `['admin']` or
`[{name: 'admin'}]` shape, so either fix works without frontend changes.

## Structure
```
src/
  api/            auth, admin (products/orders/dashboard), superadmin
  context/        AuthContext — session + role derivation
  components/     Sidebar, ConsoleLayout, StatRing, route guards
  pages/
    auth/         Login, AccessDenied
    dashboard/    KPI cards + recent orders, wired to /admin/dashboard
    products/     CRUD table + modal, wired to /admin/products
    orders/       list + inline status change, wired to /admin/orders
    superadmin/   Admins (create/deactivate/reactivate), Clients (search)
```

## Still to build
- Installment/overdue tracking views (`/admin/dashboard/overdue-installments`)
- Low-stock report view (`/admin/dashboard/low-stock`)
- Admin performance stats, individual admin activity log
- Superadmin profile editing, admin password reset flow (modal exists for
  create, not yet for reset)
- Product image upload (backend accepts `images[]` multipart — not wired yet)
