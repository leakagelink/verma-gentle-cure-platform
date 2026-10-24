# Verma Gentle Cure — security audit and remediation

Assessment: 24 October 2026. **BLOCKED / NOT VERIFIED for Google Play submission.** This is an existing web application; design and core features were preserved. No live payment was charged during this audit. Source fixes do not certify legal compliance or native Android readiness.

## Priority findings and resolution

| Severity | Finding / exploit | Root cause and resolution | Status |
|---|---|---|---|
| Critical | Replay a valid cheap gateway callback against a different internal payment | `razorpay.functions.ts` trusted callback order ID independently of the local payment. Now loads owner-scoped payment first, binds stored gateway order, verifies HMAC and captured INR amount, then calls atomic settlement | FIXED BUT NOT TESTED end-to-end; HMAC/amount rules unit-tested |
| Critical | Attach a second unauthorized bill to a payment | Both optional resource IDs accepted. Validator now requires exactly one matching bill; explicit owner and payable status checks | FIXED AND TESTED validator; live authorization checks not tested |
| High | Patient changes appointment fees, paid state or doctor notes | Ownership-only RLS. Database trigger derives fees, protects ownership/financial fields and limits patient updates to cancellation | FIXED BUT NOT TESTED as authenticated users |
| High | Browser creates paid/underpriced orders or appends free items | Direct financial inserts. Revoked ordinary order/item INSERT; atomic authenticated RPC prices active kits at ₹1,500, shipping ₹125, validates quantities/COD/coupons and reserves stock | FIXED BUT NOT TESTED authenticated flow; privilege revocation verified |
| High | Fabricated paid payment receipts | Ownership-only payment INSERT. Trigger forces patient references to pending/manual and derives bill amount/ownership | FIXED BUT NOT TESTED authenticated flow |
| High | Every doctor reads every patient | Role-only access. Restrictive clinical RLS requires admin-managed patient assignment; admin assignment form added to My account | FIXED BUT NOT TESTED multi-user access; assign existing treating relationships before staff use |
| High | Doctors manage unrelated financial records | Finance/order access now admin-only in policies and presentation | FIXED BUT NOT TESTED signed-in |
| High | Report upload controls browser-only | Private bucket confirmed, 10 MB bucket limit applied, type/size policy added and client allowlist tested | FIXED BUT NOT TESTED live storage; MIME is not file-content or malware validation |
| High | Health consent not persisted | Added timestamp/version to appointments/cases and server trigger requiring current notice evidence | FIXED BUT NOT TESTED live collection; upload-before-save consent remains client-gated |
| Medium | Paid callback downgraded to failed | Failure operation now targets pending Razorpay rows only; invalid signature never mutates payment | FIXED BUT NOT TESTED provider/database concurrency |
| Medium | Split parent/payment updates | Atomic settlement locks payment and bill; verifies user, resource, amount, payable state; unique gateway IDs prevent reuse | FIXED BUT NOT TESTED concurrent callbacks/forced database rollback |
| Medium | Raw errors/medical identifiers exported to diagnostics | Generic allowlisted diagnostic reporting; raw global captured errors removed; root does not log raw exception | FIXED BUT NOT TESTED production telemetry |
| Medium | Old account role/form remains on account switch | Role linked to resolved user ID; protected content remounts by identity | FIXED BUT NOT TESTED two-account browser flow |
| Medium | Orphan upload/removal errors | New upload rollback on save failure; attachment state updates after save; removal errors checked and metadata restoration attempted | FIXED BUT NOT TESTED injected failures; reconciliation still required |
| Medium | Fake ratings with zero reviews | Hide rating unless review count >0 | FIXED; independent testimonial/product evidence still required |
| High | Vulnerable dependencies | Updated Zod and targeted js-yaml/source-map-js overrides | FIXED AND TESTED advisory scan: no known production vulnerabilities in 54 checked packages |
| High | Deletion intake is not fulfillment | Verified-owner request queue remains deliberately non-destructive pending legal retention approval | REQUIRES MANUAL CONFIGURATION; full deletion not implemented |
| High | Native release unknown | No Android/Gradle/Capacitor project present | BLOCKED / NOT VERIFIED |

## Executed verification

- Vitest: **13 passed, 3 files**: privacy rules 3; payment security 8; report type/size rules 2.
- Payment tests cover exclusive bill selection, wrong bill type, wrong order/payment IDs, uncaptured status, INR currency, ₹1,625 vs 162,500 paise, invalid signatures and stored-order HMAC binding. Synthetic fixtures only.
- Latest harness build/typecheck: **build OK**. The harness runs these automatically; no separate manual production build was run.
- Browser: local home/privacy/deletion/shop/login pages HTTP 200; shop → one kit checkout shows ₹1,500 + ₹125 = ₹1,625; signed-out placement opens login; zero page errors. Screenshots inspected. This is NOT an authenticated checkout test.
- Deployed schema readback: clinical assignments, trusted-order RPC, settlement RPC and health-consent columns exist; patient-reports private. Ordinary authenticated order INSERT=false; anonymous and ordinary authenticated settlement EXECUTE=false. No existing duplicate Razorpay payment IDs found before unique indexes.
- Database linter: 4 authenticated SECURITY DEFINER execution warnings remain. These are intentional entry points (`has_role`, clinical-access helper, guarded order creation, admin-checked assignment); no anonymous execution warning. Warnings do not prove safety.
- Production advisory scan: no known vulnerabilities in 54 production dependencies after updates. Dev/toolchain vulnerabilities were not comprehensively certified.
- Whole-repository lint **failed**: 1,410 errors / 8 warnings at the recorded run, overwhelmingly existing formatting; one unnecessary regex escape subsequently corrected. No broad formatting rewrite performed. A later whole-repository lint success is not claimed.
- Self-account session mint failed because no app account matches the requesting user's identity. Do not select a different person's account silently. Signed-in end-to-end, role matrix, storage, destructive deletion and provider tests remain unverified.

## Changed source areas

- `src/lib/payment-security.ts`, `.test.ts`: validation, HMAC verification and capture integrity tests.
- `src/lib/commerce.functions.ts`: authenticated trusted-order wrapper.
- `src/lib/razorpay.functions.ts`: owner-bound initiation, unpaid-attempt reuse, verified captured settlement, conditional failure handling.
- `src/routes/checkout.tsx`, `billing.tsx`: trusted order call, bounded local coupon mapping, Razorpay constructor narrowing; retains immediate checkout window.
- `src/routes/book-appointment.tsx`, `case-form.tsx`, `src/lib/upload-security*`: consultation type, consent evidence, type limits and safer cleanup.
- `src/hooks/useAuth.tsx`: account-switch isolation and resolved-role state.
- `src/components/account/ClinicalAssignments.tsx`, `src/routes/account.tsx`: guarded doctor assignment control.
- `src/routes/admin.tsx`, `finance.tsx`: administrator-only finance; exact registered patient ID instead of silently charging staff's own account.
- `src/lib/error-capture.ts`, `lovable-error-reporting.ts`, `src/routes/__root.tsx`: sanitized diagnostics.
- `src/routes/privacy-policy.tsx`, `src/lib/site-data.ts`: truthful access disclosure.
- Medicine card/detail: no zero-review ratings; meaningful product image social metadata. Index social metadata uses actual displayed doctor image; auth noindex.
- `package.json`, `bun.lock`: targeted security dependency updates.
- `.env.example`, `AGENTS.md`, `roadmap.md`, this report: safe placeholders and security architecture/release gates.
- Database changes: clinical assignments/restrictive policies, write guards, trusted creation/settlement; consent/financial immutability; unique gateway IDs/cancelled-stock restoration. Applied schema was read back, not merely assumed.

## Migration-history blocker

The initial security migration tool reported success as `0006_security_trusted_orders_and_clinical_access.sql`, but that file/journal entry was absent later; its deployed schema/functions DO exist. The later consent migration was recorded as `0006_health_consent_and_financial_immutability.sql`. **The repository history cannot reproduce the deployed baseline reliably.** Do not hand-edit journals or recreate production tables. Reconcile the applied initial security migration and earlier base/case/storage definitions through the migration tooling before a clean environment or branch release. This discrepancy is unresolved and must not be hidden by the successful schema readback.

## Secrets and configuration

- `.env` is tracked; inspected entries contain publishable configuration, not a discovered private payment/service credential. Publishable keys are not secrets.
- Attempt to update `.gitignore` was refused as read-only. Owner must exclude `.env`/`.env.*` (retain `.env.example`) and remove the tracked file through their Git workflow. Do not put private values in it while tracked.
- No exposed private credential was established in inspected source; no automatic rotation was performed. Full historical credential scanning remains unverified. If private keys were ever committed, rotate/revoke the corresponding Razorpay or backend credentials securely; deleting the current file alone is insufficient.
- No change to email confirmation or auth settings was made. Hosted recovery redirect allowlist, CAPTCHA/rate limits and staff MFA need verification.
- Current provider keys may be live. Supply test credentials securely for provider tests, never in chat/source.

## Remaining release gates

1. Complete actual account/data deletion with approved retention matrix, staff ownership verification, eligible file/data removal, restricted retained records, expiry, session revocation and patient outcome notification. Current pending/in-review intake is not deletion. Keep legal records intact until reviewed.
2. Verify real clinician registration, BHMS, authority to consult/dispense, product licences/labels/ingredients and truthful testimonials/awards. Client-editable prescription identity and signature codes are not verified regulatory credentials or cryptographic PDF signatures.
3. Extend prescription audit to credentials/signature/mode fields and verify doctor identity on issuance. Existing audit covers core clinical content only.
4. Verified webhook/reconciliation path is still missing. Browser-close or delayed capture can leave captured payments pending locally; no endpoint or webhook configuration is claimed. Add raw-body signature verification and idempotent settlement/retry using a separately configured webhook secret.
5. Concurrent initiation can still create two gateway orders before the reusable pending attempt is persisted. Add durable resource-level initiation locking/idempotency before release. Unique gateway IDs alone do not solve duplicate initiation.
6. Manual-reference/counter settlement and refunds need a narrow auditable transactional workflow. Refund fields are bookkeeping, not evidence Razorpay returned money. Existing legacy financial rows must be reviewed before trusting stored totals.
7. Add and run authenticated REST/RPC tests: patient A/B cross-read/write, privileged field tampering, doctor assignment, storage paths, role escalation, duplicate confirmation, callback delay, database failures, deletion dependencies/retention. No test credentials are requested in chat.
8. Upload content validation/malware handling, quotas, orphan reconciliation and server-side upload consent must be completed; MIME can be spoofed.
9. Approve privacy grievance contact, legal retention periods, provider diagnostic practices and incident response. Do not fabricate the appointed officer or a legal SLA.
10. Resolve lint debt and migration-history reproducibility. Confirm production headers/cache restrictions and rate limits; no global CSP change made that could break payment checkout.

## Official policy/engineering sources

- Razorpay Standard Checkout: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps
- Razorpay best practices: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/best-practices
- Google health: https://support.google.com/googleplay/android-developer/answer/16679511
- Data safety: https://support.google.com/googleplay/android-developer/answer/10144311
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Target SDK: https://support.google.com/googleplay/android-developer/answer/11926878
- Payments: https://support.google.com/googleplay/android-developer/answer/9858738
- DPDP phased commencement notification: https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf
- CERT-In directions: https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf
- NCH professional circular: https://nch.org.in/upload/NCH(BERH)%20Circular%2029.01.2026.pdf
- AYUSH advertising/label advisory: https://ayush.gov.in/assets/pdf/quality_standards/Advisory.pdf

Legal review: health/medical records fall under India's sensitive-data framework. Review SPDI consent, necessity, withdrawal/correction, retention, transfer and grievance obligations with counsel. DPDP substantive obligations are phased; do not assume all commenced by this assessment date. CERT-In incident/log obligations do not justify retaining raw health content in app logs. This audit is not legal advice.

## Google Play checklist

- [ ] Public privacy/deletion URLs verified after updated web deployment; current local pages are not proof of published changes.
- [ ] Actual deletion fulfilled and retention explained.
- [ ] Data safety accurately covers account/contact/health/uploads/address/payment identifiers and all native/provider diagnostics.
- [ ] Health apps declaration and required responsible disclaimer; no automated diagnosis/regulatory claim without evidence.
- [ ] Real clinician and medicine authorization/labels/claims verified.
- [ ] AAB merged manifest, SDK inventory, permissions, cleartext, exported components, bridge navigation, backups, signing, 16 KB/64-bit compatibility audited.
- [ ] New phone app/update target satisfies current Console requirement; policy research states API 36 from 31 August 2026. Recheck intended submission date and any granted extension.
- [ ] Physical kits keep appropriate external payments; separately assess 1:1 clinical-service exception, recordings and any digital products/subscriptions against Play Billing.
- [ ] Reviewer access, audience/content rating, listing screenshots and organization verification completed.

## Windows PowerShell verification/release commands

Run in the cloned web repository (Bun installed):

```powershell
bun install --frozen-lockfile
bunx vitest run src/lib/privacy-rules.test.ts src/lib/payment-security.test.ts src/lib/upload-security.test.ts
bun run lint
bun run build
```

Do not package server-rendered output as a static Android app. No Android release project exists here. In the actual audited Android Studio project, after target/configuration/signing review:

```powershell
Set-Location .\android
.\gradlew.bat lintRelease testReleaseUnitTest bundleRelease
```

Typical AAB location: `app\build\outputs\bundle\release\app-release.aab`; confirm the actual module/variant. Use Android Studio Generate Signed Bundle with protected signing credentials; these commands alone do not configure signing or guarantee an artifact. Do not create an unreviewed native wrapper simply to claim compliance.

## Final status

**FIXED AND TESTED:** payment validation helpers, upload rules, existing privacy tests, advisory updates, public browser flow and current harness build.

**FIXED BUT NOT TESTED:** authenticated clinical/payment/storage protections and provider/transaction concurrency behavior.

**REQUIRES MANUAL CONFIGURATION:** clinical assignments, lawful retention/deletion operator, credentials/evidence, hosted auth settings, native release/Console declarations.

**BLOCKED / NOT VERIFIED:** complete deletion, migration reproducibility, signed-in E2E, captured-payment reconciliation, Android compliance and ready-for-submission status.
