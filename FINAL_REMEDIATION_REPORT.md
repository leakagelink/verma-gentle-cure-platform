# Verma Gentle Cure — Final Remediation Evidence

Checked 25 October 2026 UTC. **NOT RELEASE-READY.** This report does not certify legal, clinical, payment-provider or Google Play compliance.

## Implemented and observed
- Public deletion intake accepts a registered email/phone without sign-in; submissions remain unverified and never authorize destruction. A synthetic contact was submitted through the running UI and independently counted in the database (1 row); no page errors. Same contact/scope/day submissions deduplicate, distinct contacts no longer silently disappear behind a shared-IP key. Deployment-level abuse protection remains needed.
- Administrator-only, token-bound deletion processor: claim, freeze account, purge eligible database data under a retention fence, remove report files through Storage API, remove account credentials for account scope, verify readback, then record completion. Failures never generate a completion result; interrupted processing needs reconciliation. Data-only requests clear known personal Auth metadata and preserve sign-in identity. Repeated data-only requests retain the prior receipt in processing history.
- Medical/financial records and clinician/audit/assignment provenance block automated deletion. Concurrent dependency writes use the same advisory-lock fence and reject held accounts. This preserves required records rather than assuming a retention period or deleting cascades indiscriminately.
- Versioned prescription/audit assignment restrictions, prescription trigger, clinical assignment policies, case/note restrictions, report consent and overwrite prohibition. Private patient-reports bucket independently read back: public=false, 10 MB file limit.
- Server calls revalidate the current identity and durable deletion hold; database/storage holds cover direct access. Raw catch logging in src/start.ts replaced with a generic message.

## Actual tests and limitations
Command: `bunx vitest run src/lib/database-security.test.ts src/lib/payment-security.test.ts src/lib/privacy-rules.test.ts src/lib/upload-security.test.ts src/lib/deletion-processor.test.ts`
Result: **46 tests passed, 5 files**, final run 03:41:40 UTC. Database 25, payment 8, privacy 3, upload 2, deletion orchestration 8.
Concrete synthetic PostgreSQL evidence: eligible profile count was 1 before purge and 0 afterward; role count 0; wrong tokens and duplicate claims rejected; retained appointments/third-party assignments remained; completed data-only request reopened with one prior history receipt. Tests also cover underpriced checkout, appointment tampering, unauthorized payment creation, consent bypass, prescription/audit isolation, same-payment settlement idempotency and final-write rollback. Storage SQL test rejects missing consent and accepts a current server receipt.
**These are isolated PGlite tests, not hosted Auth/Storage/Android end-to-end tests.** Auth removal, full session revocation, metadata clearing and Storage API destruction remain unverified on disposable hosted accounts. Orchestration tests use fake operations and prove ordering/failure behavior, not real credential removal. No real patient records were deleted. No live payment was attempted. True multi-connection callback concurrency and provider refund/capture lifecycle were not exercised.
Changed-file ESLint command: `bunx eslint src/start.ts src/lib/privacy.functions.ts src/lib/deletion.server.ts src/lib/deletion-processor.ts src/lib/deletion-processor.test.ts src/lib/database-security.test.ts src/components/account/DeletionRequests.tsx src/routes/delete-account.tsx src/routes/privacy-policy.tsx src/routes/case-form.tsx` — exit 0.
Whole lint: `bunx eslint . --format json` — exit 1, 1022 formatting errors in seven protected generated integration files, 8 Fast Refresh warnings. Earlier run had 1378 errors; 53 non-generated files were read and formatted without suppressing rules. Generated protected files were deliberately not edited.
Automatic preview compilation: latest inspected entry **build OK**, 03:41:30 UTC. Manual production build/typecheck was not run: this environment delegates those to the harness; this is not proof of a signed native release or separate production artifact.
Public browser test: localhost /delete-account submitted synthetic unregistered contact, showed ownership-verification message, zero page errors. Published /delete-account and /privacy-policy returned HTTP 200. Published availability does not prove the newly edited version is live; no publish action was taken.
Hosted signed-in check: `lovable auth-session --json --self` failed because no app account matches the requesting identity. No other patient identity was selected.

## Remaining risks ranked
**High / release blockers**
1. Full deletion for patients with retained records is NOT IMPLEMENTED. Retention categories, lawful basis, expiration periods, eligible redaction/archive design and scheduled expiry processing need clinic/legal approval. Automation currently blocks those accounts; it does not anonymize retained clinical/financial records or remove their Auth identity.
2. Hosted disposable-account deletion, Auth metadata/session readback, Storage removal, partial-failure recovery and authenticated clinical/financial workflows NOT TESTED end-to-end. Failed jobs remain held; no self-service reconciliation/retry control.
3. Fresh canonical migration replay NOT FIXED: independent fixture-free replay of legacy files plus Drizzle fails at 0006: missing public.case_records. Current passing database suite supplies test-only baseline objects; never call that a clean staging deployment. Missing clinical baseline and early helper ordering require an authoritative schema export and supported managed migration baseline process.
4. Native Android project/AAB and Play Console evidence absent; release cannot be certified.
**Medium**
5. Environment exclusions/untracking NOT FIXED: .gitignore modification was refused read-only; stateful Git actions prohibited in this environment. Owner action required.
6. Public intake needs deployment-verified abuse/rate controls; unverified requests require staff contact verification and a documented no-sign-in manual fulfillment procedure. External verification/closure UI is not implemented.
7. Uploaded-file MIME metadata is not content scanning. Server receipt gates insertion but batch consent lasts 15 minutes; malicious content scanning and hosted storage isolation remain unverified. Previously issued signed download URLs may survive until their expiry.
8. Razorpay ambiguous initiation claims require manual reconciliation, no verified webhook; actual capture/refund/concurrency/provider failures unverified. Manual refunds are bookkeeping, not proof from provider.
9. Data-only credentials retain necessary email/identity and any unknown metadata outside the explicitly cleared personal keys; lawful retained-identity disclosure and full provider metadata inventory require review.
**Low**
10. Generated-file formatting debt and Fast Refresh warnings remain. Full repo lint does not pass.

## Secret hygiene evidence
Read-only history scan inspected 570 reachable blobs in 276 commits: no matches for scanned private-key/token signatures. This is not a guarantee against arbitrary/unrecognized secrets, unreachable or remote-only history. .env remains tracked; contents used publishable browser/server configuration, not evidence of an exposed privileged key. .env.example private values are empty placeholders. No credentials printed, no rotations claimed.
Owner PowerShell Git workflow (run locally after review; not executed here):
```powershell
Add-Content .gitignore "`n.env`n.env.*`n!.env.example`n*.pem`n*.key`n*.jks`n*.keystore"
git rm --cached -- .env
```
This removes tracking without deleting local configuration. Rotate/revoke a private credential only if actually identified as exposed; do not treat publishable keys as private secrets.

## Canonical migration deployment
Lovable's managed migration operation is the only supported schema deployment path. New 0014–0017 were reported applied and independent schema/policy/function readbacks confirmed their presence. Do not manually replay legacy files, edit journals or run a separate database push on production. No destructive production schema operation was executed.
A recovered bootstrap candidate passed isolated replay through 0014 in an earlier investigation, but its inferred baseline defaults/policies are not authoritative and scratch artifacts did not survive restart. A separate fixture-free history replay still fails at 0006. Clean hosted staging replay and migration hashes for the full final set are NOT VERIFIED. Obtain supported baseline installation/ledger handling; do not apply an inferred bootstrap over a populated database.

## Google Play / Android evidence still required
Official policy references reviewed; recheck Console for actual submission date:
- Target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878 — API 36 requirement for new phone apps/updates from 31 August 2026; verify any exception in Console.
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- User data: https://support.google.com/googleplay/android-developer/answer/10144311
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Health apps: https://support.google.com/googleplay/android-developer/answer/16679511
- Payments: https://support.google.com/googleplay/android-developer/answer/9858738
- 16 KB support: https://developer.android.com/guide/practices/page-sizes — inspect final ABI/native libraries and Console requirements, not merely the web manifest.
Needed: actual Android/Capacitor source; merged manifest and permissions/SDK inventory; target/compile API; release keystore ownership and signed AAB; signing certificate; installed-release device tests; non-debuggable/HTTPS/WebView navigation/file-chooser/security checks; 16 KB compatibility when applicable; Health apps declaration; accurate Data safety; public privacy/deletion URLs; app-access reviewer instructions/test account; verified clinician registration/qualification and responsible medical claims; lawful dispensing/service/payment classification. Physical medicine kits are not Play Billing digital goods; consultation exceptions must match the actual service, not a blanket exemption. No Android artifact or Console declaration was fabricated.

## Requirement status
| Requirement | Final status |
|---|---|
| Public unauthenticated intake | FIXED AND TESTED (synthetic UI/database intake only) |
| Administrator/token authorization, retention blocks, dependency fence, failure ordering | FIXED AND TESTED (isolated tests only) |
| Actual eligible hosted account/file/credential deletion and session revocation | FIXED BUT NOT TESTED |
| Deletion with legally retained records and expiry destruction | NOT FIXED; REQUIRES MANUAL CONFIGURATION/legal policy |
| Auth metadata clearing/data-only repeat cycles | FIXED BUT NOT TESTED hosted; SQL repeat generation tested |
| Environment exclusions/untracking | NOT FIXED; owner Git action required |
| Private credential history/rotation | No scanned exposure found; comprehensive absence NOT VERIFIABLE |
| Previous financial/consent/clinical rules | FIXED AND TESTED isolated; hosted/provider lifecycle unverified |
| Full fresh migration baseline | NOT FIXED |
| Changed-file lint/automatic preview compilation | FIXED AND TESTED |
| Whole lint | NOT FIXED in protected generated files |
| Native Android/AAB/Play Console readiness | NOT VERIFIABLE FROM THIS REPOSITORY |
| Credentials, retention, declarations, provider test mode | REQUIRES MANUAL CONFIGURATION |

## Exact changed files
Behavior/security changes: src/lib/privacy.functions.ts, src/lib/deletion-processor.ts, src/lib/deletion.server.ts, src/lib/deletion-processor.test.ts, src/lib/database-security.test.ts, src/components/account/DeletionRequests.tsx, src/routes/delete-account.tsx, src/routes/privacy-policy.tsx, src/routes/case-form.tsx, src/start.ts, AGENTS.md, roadmap.md.
Managed migrations: 0014–0017, their tool-generated snapshots/journal and regenerated integration types. Other listed app files received formatting-only changes. .gitignore was NOT changed.

Full changed-path list from read-only Git history since task start:
```text
AGENTS.md
drizzle/migrations/0014_verified_deletion_processing_and_public_intake.sql
drizzle/migrations/0015_version_clinical_scope_and_deletion_holds.sql
drizzle/migrations/0016_version_report_consent_and_clinical_baseline_policies.sql
drizzle/migrations/0017_deletion_retention_fence_and_processing_generations.sql
drizzle/migrations/meta/0014_snapshot.json
drizzle/migrations/meta/0015_snapshot.json
drizzle/migrations/meta/0016_snapshot.json
drizzle/migrations/meta/0017_snapshot.json
drizzle/migrations/meta/_journal.json
roadmap.md
src/components/account/ClinicalAssignments.tsx
src/components/account/DeletionRequests.tsx
src/components/home/MobileHome.tsx
src/components/layout/ClinicContact.tsx
src/components/layout/SiteFooter.tsx
src/components/layout/SiteHeader.tsx
src/components/shop/MedicineCard.tsx
src/components/ui-kit/PageHero.tsx
src/hooks/useAuth.tsx
src/integrations/supabase/types.ts
src/lib/appointments-data.ts
src/lib/billing.ts
src/lib/database-security.test.ts
src/lib/deletion-processor.test.ts
src/lib/deletion-processor.ts
src/lib/deletion.server.ts
src/lib/error-capture.ts
src/lib/lovable-error-reporting.ts
src/lib/payment-security.test.ts
src/lib/payment-security.ts
src/lib/privacy-rules.test.ts
src/lib/privacy-rules.ts
src/lib/privacy.functions.ts
src/lib/shop-data.ts
src/lib/site-data.ts
src/lib/upload-security.test.ts
src/lib/upload-security.ts
src/routes/about-doctor.tsx
src/routes/about.tsx
src/routes/accessibility.tsx
src/routes/account.tsx
src/routes/admin.tsx
src/routes/appointment-policy.tsx
src/routes/auth.tsx
src/routes/blog.$slug.tsx
src/routes/cart.tsx
src/routes/case-form.tsx
src/routes/contact.tsx
src/routes/corporate-information.tsx
src/routes/delete-account.tsx
src/routes/doctor.tsx
src/routes/index.tsx
src/routes/media-recognition.tsx
src/routes/medical-disclaimer.tsx
src/routes/medicines.$slug.tsx
src/routes/medicines.category.$slug.tsx
src/routes/medicines.index.tsx
src/routes/orders.tsx
src/routes/prescriptions.$id.tsx
src/routes/privacy-policy.tsx
src/routes/receipts.$id.tsx
src/routes/reset-password.tsx
src/routes/services.tsx
src/routes/testimonials.tsx
src/start.ts
```
