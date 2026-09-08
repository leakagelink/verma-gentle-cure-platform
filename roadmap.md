# Verma Gentle Cure — build roadmap

## Phase 1 — Foundation (done)
- [x] Logo-derived design system (navy/teal/forest/leaf/lime/mint/ivory tokens, Fraunces + Manrope)
- [x] Mobile-first shell: sticky header, app-like mobile menu, bottom tab bar, premium footer
- [x] Public site: home (12 sections), about doctor, services, consultation, treatments, blog + article,
      FAQ, contact, shop + category + product, cart, checkout, 4 legal pages
- [x] Per-route SEO metadata, canonical links, JSON-LD
- [x] Replace placeholder wordmark with the official logo file
- [x] Enable Lovable Cloud: auth (patient/doctor/admin roles), database schema, RLS, secure storage buckets

## Phase 2 — Consultation platform (done)
- [x] Persist appointments to the database
- [x] Patient dashboard (appointments, status, cancel, prescriptions)
- [x] Doctor dashboard (confirm / complete / notes / issue prescription)
- [x] Digital prescriptions with printable layout (/prescriptions/:id)
- [ ] File uploads (reports) — moves to Phase 3 with storage buckets

## Phase 3 — Commerce (done)
- [x] Products, cart and orders in the database (products, orders, order_items, store_settings)
- [x] Checkout saves real orders with items, coupon, delivery fee and totals
- [x] Customer order tracking (/orders) and store admin order management (/admin)
- [x] COD configurable (on/off, min/max order) plus delivery fee and free-delivery threshold
- [ ] Payment gateway integration layer (Razorpay / Cashfree / UPI) once credentials are supplied
- [ ] File uploads (reports) with storage buckets

## Mobile app experience (done)
- [x] Compact app header, secondary navigation sheet and safe-area-aware bottom tabs
- [x] Short mobile page introductions and hidden desktop footer on phones
- [x] Two-column medicine browsing with filter sheet and touch-friendly product cards
- [x] Compact booking progress with sticky action controls
- [x] Mobile-optimized account, appointment and order layouts
- [x] Standalone web-app manifest and mobile device metadata


## Phase 4 — Admin & operations
- [ ] Admin dashboard with charts and all management modules
- [ ] CMS for homepage, services, conditions, testimonials, FAQ, blog, SEO fields
- [ ] Notification layer (email / SMS / WhatsApp / push) behind an integration interface
