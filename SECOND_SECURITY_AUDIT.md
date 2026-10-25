# Verma Gentle Cure — second audit results

24 October 2026. **Not ready for Google Play submission.** Existing design retained; no real patient data deleted and no real payment charged.

## Changes and evidence

| Issue | Root cause | Actual remediation | Verification |
|---|---|---|---|
| Appointment tampering | Owner UPDATE policy and client booking fields | Removed patient UPDATE policy; revoked direct authenticated INSERT. Booking/cancellation RPCs derive owner, validate schedule and charge; clinical relationship scope retained | Isolated PostgreSQL tests prove fee unchanged, foreign cancellation rejected and foreign records hidden; deployed grants/policy readback checked |
| Payment forgery | Direct patient and staff financial INSERT/UPDATE | Revoked direct INSERT/UPDATE. Patient references derive payable amount and stay pending; admin counter entry checks role; manual settlement is service-only after server admin check and atomically updates its bill | Direct paid INSERT rejected in isolated PostgreSQL; deployed privileges false; live admin/counter UI not verified |
| Checkout integrity | Trusted creation existed only in live database; retries not serialized | Versioned trusted pricing/stock-locking function. Owner/request-bound durable checkout RPC rejects protected financial fields, reuses same request result. UI keeps request ID across in-place retries | Isolated actual SQL: one kit ₹1,500 + ₹125 = ₹1,625; repeated request returns same ID; stock decreases once; forged total rejected |
| Gateway concurrency | Reuse lookup races before gateway order persistence | Durable unique user/resource initiation claim before provider request; existing gateway attempt reused | Applied schema verified. Concurrent provider requests not executed; ambiguous timeout retains claim for manual reconciliation instead of opening another charge |
| Missing settlement SQL | Function existed deployed, absent from repository | Recovered exact `pg_get_functiondef` into 0008; explicit service-only execution. No blind replacement | Isolated SQL verifies duplicate settlement, wrong order binding, paid bill/payment readback, and final-write failure rolls bill update back |
| Consent forgery | Client version/time accepted as evidence; access helper used for bypass | Server records authenticated explicit acceptance into private owner/purpose receipts. Patient writes consume current receipt once, stamp server time; own-account clinicians do not bypass; clinical changes preserve existing evidence | Missing/version/stale/future/replay/self-access cases tested in PostgreSQL; authorized assigned-clinician evidence preservation tested |
| Environment tracking | `.env` remains tracked and `.gitignore` is managed read-only | Safe `.env.example` retained; attempted exclusions refused. No workaround or private values printed | Tracked-source pattern scan: zero matches for inspected private-key/Razorpay-secret patterns; history and comprehensive secret scanning not certified |

## Applied files

- `drizzle/migrations/0008_version_verified_gateway_settlement.sql`: recovered settlement and execution grants.
- `0009_trusted_patient_actions_and_consent_receipts.sql`: consent receipts, booking/cancel/reference/counter/review functions and revoked direct writes.
- `0010_durable_checkout_and_gateway_initiation.sql`: persistent request and initiation coordination.
- `0011_checkout_result_binding.sql`: correct local variable/result binding.
- `0012_version_clinical_and_commerce_guardrails.sql`: versioned fee, schedule, clinical scope and pricing/stock guardrails; validates missing delivery fields.
- `0013_trusted_manual_settlement_and_amounts.sql`: trusted amount derivation and admin-verified atomic manual settlement; provider refund evidence cannot be manually invented.
- `src/lib/trusted-actions.functions.ts`: authenticated narrow wrappers; admin verified before privileged manual settlement; accepted consent version fixed, timestamp server-generated.
- `src/lib/commerce.functions.ts`, `src/routes/checkout.tsx`: request-bound checkout and double-click suppression.
- `src/lib/razorpay.functions.ts`: resource initiation claim before provider order creation; stored-attempt reuse retained.
- `src/routes/book-appointment.tsx`, `appointments.tsx`: trusted booking/cancellation instead of direct writes.
- `src/routes/case-form.tsx`: server-issued consent receipt per save.
- `src/routes/billing.tsx`, `finance.tsx`: trusted reference and admin finance actions instead of direct payment writes.
- `src/lib/database-security.test.ts`, `src/lib/__tests__/verified-baseline.sql`: isolated database tests plus verified historical function fixture; test fixture is not a deployment migration.
- `package.json`, `bun.lock`: development-only PGlite for PostgreSQL tests; not used in server/runtime code.
- `AGENTS.md`, `roadmap.md`: deployment/security boundaries and unresolved gates.

## Executed checks

- **30 tests passed, 4 files**: database security 17, payment integrity 8, privacy 3, uploads 2.
- Direct INSERT forgery for payments/orders/items rejected; appointment UPDATE may return zero affected rows under RLS rather than an error. Test verifies stored fee remains **700**.
- Settlement rollback test injects a failing final payment constraint after the bill update, then asserts the bill remains pending.
- Isolated PostgreSQL uses synthetic accounts, local auth helper functions and recovered baseline fixtures. It is **not** a hosted API or complete clean-staging replay test.
- Changed-file ESLint: passed for the ten changed application/test files.
- Whole repository lint: **failed: 1,378 errors, 8 warnings** (formatting debt outside the scoped fixes). No clean whole-repository lint claim.
- Latest automatic compilation/typecheck signal: **build OK at 15:08:06 UTC**. No separate manual production build was run because the platform runs it automatically.
- Deployed readback: authenticated direct appointment/order/item/payment INSERT=false; payment UPDATE=false; gateway/manual settlement execution=false.
- Migration hashes compared against `drizzle.__drizzle_migrations`: **0000–0013 all match applied hashes**. Specifically 0005, 0006 and 0007 match. Environment is the connected shared backend, not independently verified staging.
- Completed deep scan found two critical underpayment findings (orders/consultations) and quick scan retains public store-settings warning. New guards/grant revocations and versioned SQL address their paths, but findings are not cleared and no post-change deep-scan clearance is claimed.

## Deployment process and reproducibility

Use **Lovable's managed database migration operation only** for schema changes. Do not run a separate CLI database push or manually edit migration journals. The legacy `supabase/migrations` files are historical baseline reference; Drizzle files are registered through the managed migration tool. A plain CLI push does not automatically apply the Drizzle journal.

The connected backend contains historical changes not reproducibly established by the checked-in chronological baseline. In particular 0006 depends on clinical structures/helpers introduced outside its preceding registered files; later forward recovery does not repair that dependency for a blank database. Case-record/storage baseline is incomplete. **Fresh-staging reproducibility remains blocked**, despite applied-hash matching and recovered settlement. Tests intentionally reconstruct a minimal historical baseline before replay; do not confuse that with a clean release replay. Resolve a complete managed baseline/staging provisioning through platform migration tooling before creating a new environment; do not destructively replay production DDL.

Verification queries (run through the backend's read-only query operation):

```sql
SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at;
SELECT pg_get_functiondef('public.settle_gateway_payment(uuid,uuid,text,text,integer,text)'::regprocedure);
SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename='appointments';
SELECT has_table_privilege('authenticated','public.payments','INSERT'),
       has_table_privilege('authenticated','public.payments','UPDATE'),
       has_function_privilege('authenticated','public.settle_gateway_payment(uuid,uuid,text,text,integer,text)','EXECUTE');
```

PowerShell local verification:

```powershell
bun install --frozen-lockfile
bunx vitest run src/lib/database-security.test.ts src/lib/payment-security.test.ts src/lib/privacy-rules.test.ts src/lib/upload-security.test.ts
bun run lint
bun run build
```

## Remaining blockers and limitations

1. Signed-in hosted booking, case save, storage upload, counter payment and patient payment readback remain unverified: requesting identity has no matched app account. Never test as another patient without authorization.
2. Gateway claim intentionally remains on uncertain provider failure. Staff must reconcile whether an order was created before resetting it; automated verified webhook/reconciliation is still absent. Provider capture/refund and concurrent network tests require safe test-mode setup.
3. Browser-refresh retry does not yet preserve the checkout request key in persistent storage. Same in-place request/double-click deduplicates; a new session may intentionally or accidentally create a new order. No global duplicate-order guarantee.
4. Consent records prove authenticated acknowledgement received by server, not human comprehension. Upload itself still relies on prior UI consent and bucket policies; dedicated server-side upload receipt enforcement/content scanning remains outstanding.
5. Full migration baseline, storage policies and clean staging replay remain unresolved as above.
6. `.gitignore` exclusions are blocked by managed read-only protection; `.env` is still tracked. Owner must change exclusion/tracking through their own Git workflow; private key history/rotation unverified. No discovered private credential value is exposed in this report.
7. Deletion fulfillment/retention, public live deletion URL (previously 404), clinician credentials, native Android project and Play declarations remain gates from the first audit. Nothing was published in this turn.
8. Existing rescheduling was not implemented in the inspected patient UI. Cancellation/booking preserved; a dedicated safe rescheduling workflow is still outstanding.
9. Admin cash receipt without linked resource remains a standalone ledger receipt; it does not silently mark a consultation paid. Refund bookkeeping for manual records remains operator-reported rather than provider proof.

**FIXED AND TESTED:** listed isolated database integrity/consent rules and payment helpers; changed-file lint; current automatic build.

**FIXED BUT NOT TESTED END-TO-END:** hosted booking/clinical/storage/finance workflows and gateway initiation coordination.

**REQUIRES MANUAL CONFIGURATION:** ambiguous gateway reconciliation, correct clinical assignments, lawful retention/operator decisions, native build and store declarations.

**BLOCKED / NOT VERIFIED:** clean-staging migration reproducibility, tracked environment exclusions, full lint, hosted signed-in/API tests, actual provider lifecycle and Google Play readiness.