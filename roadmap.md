# Verma Gentle Cure — build roadmap

## Uploaded security audit
- [x] Inspect repository and deployed authorization policies.
- [x] Apply trusted commerce and clinical-access protections.
- [x] Run available security tests and public checks; deliver SECURITY_AUDIT.md with actual results and release gates.
- [ ] Restore reproducible migration history — initial applied security migration missing from managed journal/files.
- [ ] Captured-payment reconciliation/webhook, initiation lock and privileged settlement regression tests — require safe provider test setup and signed-in verification.
- [ ] Authenticated end-to-end checks — requesting user has no matching signed-in account.
- [ ] Deletion fulfillment, legal retention, Android AAB and Play declarations — require owner decisions and native project.

## Google Play policy readiness
- [x] Add public and in-app account/data deletion request flow with staff review queue.
- [x] Update health disclosures, privacy details and registration consent.
- [x] Verify public flows and provide Android / Play Console submission checklist.
- [ ] Verify authenticated deletion submission/read-back — requesting user must sign in; managed self-session mint found no matching account.
- [ ] Final Android bundle, verified clinical credentials, retention policy and Play Console declarations — require owner inputs.

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
- [x] Payment gateway (Razorpay UPI/cards/net-banking) live — keys stored securely, verified with a real order
- [ ] File uploads (reports) with storage buckets

## Mobile app experience (done)
- [x] Compact app header, secondary navigation sheet and safe-area-aware bottom tabs
- [x] Short mobile page introductions and hidden desktop footer on phones
- [x] Two-column medicine browsing with filter sheet and touch-friendly product cards
- [x] Compact booking progress with sticky action controls
- [x] Mobile-optimized account, appointment and order layouts
- [x] Standalone web-app manifest and mobile device metadata
- [x] Reduced mobile page height with denser sections and swipeable content rows


## Digital case-taking (done)
- [x] Patient case form (/case-form): complaint, history, generals, lifestyle, mind, women's and child sections
- [x] Report/prescription/photo uploads to the private patient-reports bucket
- [x] Care-team case review (/case-records) with confidential clinical notes and assessment

## Phase 4 — Admin & operations

- [ ] Admin dashboard with charts and all management modules
- [ ] CMS for homepage, services, conditions, testimonials, FAQ, blog, SEO fields
- [ ] Notification layer (email / SMS / WhatsApp / push) behind an integration interface

## Payment & billing (done)
- payments table with receipt numbers, RLS, refund fields, attempts
- /billing patient view: pending fees, UPI/card/net-banking submission, retry, receipts, refund status
- /receipts/$id printable receipt & invoice with share/download
- /finance admin dashboard: collections, cash entry at desk, refund status, notes

- Razorpay online payment wired and verified: keys saved (secure store), test order created successfully
- note: user supplied a LIVE key (rzp_live_...) — real money is charged; switch to a test key while testing

