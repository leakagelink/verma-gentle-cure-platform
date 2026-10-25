# Final release blockers — verified results

**Verma Gentle Cure · 25 October 2026 · Release decision: NOT READY.** No production reset, account deletion, live payment, redundant migration or publication occurred.

## Changes in this review

1. `eslint.config.js`: added an exact-path exception for **only `prettier/prettier`** on seven integration-generated files. All configured TypeScript, React and security lint rules remain active. Generated files were not rewritten.
2. `AGENTS.md`: recorded that formatting-only lint policy and its regeneration rationale.
3. `roadmap.md`: recorded this review and remaining externally blocked tasks.
4. `FINAL_RELEASE_BLOCKERS_REPORT.md`: this evidence report.

No application UI or business rules changed. No migration was added. `.gitignore` was not changed: the managed edit tool again refused it as read-only.

## Results by requirement

| Requirement | Status | Actual evidence |
|---|---|---|
| `.env` no longer tracked / ignore works | **NOT FIXED** | `git ls-files -- .env` still returns `.env`; `git check-ignore -v --no-index .env` finds no rule. Read-only `.gitignore`; stateful Git mutations prohibited here. Local configuration preserved. |
| Placeholder-only `.env.example` | **FIXED AND TESTED** | Every assigned value is empty; no credentials printed. |
| Tracked/history private-credential scan | **FIXED AND TESTED** within stated scan scope | 711 reachable Git blobs scanned for private-key headers, long Razorpay/service-role assignments and service-role JWT claims; no matching findings. No rotation performed or claimed. Obfuscated/binary/unknown-name secrets are outside this bounded scan. |
| Hosted migrations through 0019 recorded | **FIXED AND TESTED** ledger inspection | SHA-256 for all 20 repository SQL files 0000–0019 matches an applied hosted ledger entry. There are 23 ledger entries: three additional historical hashes are not represented by these 20 files. No history was rewritten or replayed. |
| Existing hosted security catalog | **FIXED AND TESTED** for inspected invariants | All 19 public app tables have RLS; consent, appointment, case, prescription, financial and deletion-fence triggers present; clinical/financial scope policies restrictive. Stored gateway-order/payment uniqueness, owner/request checkout keys and gateway initiation keys present. Settlement and deletion completion execution restricted to service role; patient booking/checkout/submission require authenticated role. This is not complete schema equivalence certification. |
| Fresh clean hosted migration replay | **NOT VERIFIABLE** | No separately authorized clean hosted staging target available. PGlite baseline/shim replay is isolated test evidence only. Three extra historical ledger entries and provisioned baseline still require supported reconciliation. |
| Real disposable account deletion | **NOT VERIFIABLE** | `lovable auth-session --json --self` fails: no account matches requesting user. Preview and published app share backend; another patient's account was not selected. No disposable hosted Auth account/file was deleted. |
| Retained-record minimization / expiry | **NOT FIXED** | Existing retention block preserved; clinic-approved legal basis/categories/periods and redaction/archive design are absent. |
| Failure recovery worker | **NOT FIXED** | Token/idempotency safeguards exist, but interrupted jobs need authorized reconciliation; no safe automated lease/checkpoint/resume mechanism. |
| Public deletion/privacy/medical disclaimer pages | **FIXED AND TESTED** availability | All three published paths return HTTP 200. Local public deletion form renders with accurate request-not-completion disclosure; screenshot inspected; zero browser page errors. No queue submission was made this review. |
| Whole-repository lint | **FIXED AND TESTED** with explicit generated-format exception | `bun run lint`: before 1,041 errors/8 warnings, exit 1; after **0 errors/8 warnings**, exit 0. No silent blanket ignore. |
| Security/unit tests | **FIXED AND TESTED** locally | `bunx vitest run`: **61 passed, 7 files**, final run 04:26:08 UTC, duration 4.90 seconds. |
| Typecheck/production build | **FIXED AND TESTED** automatic preview harness only | Latest observed automatic log entry at 04:27:08 UTC: `build OK`. Manual `bun run build` and standalone typecheck not executed: environment instructions prohibit duplicating harness builds/typechecks. No standalone `typecheck` script exists. Signed/native release build remains unverified. |
| Production browser-bundle private credential scan | **NOT VERIFIABLE** | No persisted production bundle supplied; a successful build is not a leak certificate. |
| Android Studio project / signed AAB | **NOT VERIFIABLE** | Tracked-file inventory contains no native project, Gradle build, manifest, Capacitor config, APK or AAB. |
| Play declarations / professional credentials | **REQUIRES MANUAL CONFIGURATION** | No Play Console Data safety/Health declaration or verified registration evidence supplied. Technical tests cannot approve clinical/legal statements. |

## Lint classification and policy

Before the change all 1,041 errors were **formatting-only** in integration-managed files:

| File under `src/integrations/supabase/` | Formatting errors |
|---|---:|
| `auth-attacher.ts` | 7 |
| `auth-middleware.ts` | 41 |
| `client.server.ts` | 13 |
| `client.ts` | 15 |
| `cron-auth.ts` | 14 |
| `previewAuthStorage.ts` | 29 |
| `types.ts` | 922 |

The exact-path override exempts only generator-controlled formatting enforcement. It does **not** exclude files from linting or disable correctness/security rules. No application-owned lint errors were reported. Eight existing Fast Refresh mixed-export warnings remain in UI/auth/cart modules; these are development refresh/maintainability warnings, not demonstrated production/security defects, and were not hidden. A zero-warning check would still fail.

## Hosted evidence and limits

Read-only catalog tools inspected application table ACLs/RLS, security functions, installed triggers, indexes, restrictive policies, extensions and migration hashes. Installed extensions include `plpgsql`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements` and the managed vault extension. Presence is not proof of fresh provisioning.

All current 0000–0019 file hashes were compared with the returned ledger hashes. The extra three ledger hashes represent unrepresented historical changes; their SQL must be recovered or their provisioned schema provenance documented before declaring an empty hosted deployment reproducible. The legacy folder plus recovered test fixtures is not a second production deployment runner. Do not install synthetic Auth/Storage shims into a hosted environment.

No hosted signed-in authorization attack, real captured payment, account lifecycle, upload deletion or session revocation scenario was executed. Local suites exercise those rules in isolated PostgreSQL/logic tests, not remote provider behavior.

## Exact executed checks

```powershell
bun run lint
bunx vitest run
git ls-files -- .env .env.example
git check-ignore -v --no-index .env
lovable auth-session --json --self
```

Additional checks were read-only catalog queries via managed tools, SHA-256 calculation of migration file bytes, a non-outputting-credentials Python Git-history scan, and:

`python3 /tmp/browser/release-blockers/check_release_pages.py`

That temporary browser script inspected local deletion rendering, published page status and directly fetched the official target-API page. It did not authenticate or submit deletion. Automatic build evidence came from `/tmp/observability/build-errors.log`; no manual build claim is made.

## Owner-side steps and missing artifacts

### 1. Fix Git tracking in your Windows checkout

Run these in the connected repository outside the managed editor, review the changes, and use the normal repository workflow to save/sync them. **Keep the local `.env` file.** These commands have not been executed here:

```powershell
Add-Content -Path .gitignore -Value "`n# Local environment and credentials"
Add-Content -Path .gitignore -Value @('.env', '.env.*', '!.env.example', '*.pem', '*.key', '*.p12', '*.pfx', '*.jks', '*.keystore')
git rm --cached -- .env
git check-ignore -v --no-index .env
git ls-files -- .env
git diff -- .gitignore
git diff --cached --name-only
```

Expected: ignore command identifies a matching rule; `git ls-files -- .env` prints nothing; `.env` still exists locally. Do not rewrite published Git history. If future scans find private credentials, rotate/revoke with the provider; public configuration is not a private credential.

### 2. Provide a separate non-production hosted target

A separately authorized clinic testing project/environment with synthetic data is needed; do not assume preview is isolated. A data-free remix can provide copied table structure, but **does not prove fresh migration replay**. Fresh replay needs a supported provisioned baseline with provenance, the three historical ledger changes accounted for, and canonical managed migration deployment in the clean target. There is no safe generic manual database-push command to substitute for that supported workflow.

Use only the managed migration tool for schema deployment. Never blindly run `drizzle-kit migrate`, legacy SQL or the PGlite shim against this shared production backend. Inspect staging columns, defaults, nullability, constraints, indexes, policies/grants, trigger/function bodies and ledger after deployment, then perform actual authenticated rules tests. This remains unverified, not automatically repaired by another appended migration.

### 3. Test actual deletion only in that authorized target

Provide synthetic patient/admin accounts there, without pasting credentials in chat. Exercise empty, uploaded-file, retained-medical and retained-financial cases; duplicate submissions, partial failures and unauthorized attempts. Prove Auth `user_not_found`, independent empty owner Storage listing, eligible row removal, accurate final receipt, old-access-token rejection, refresh failure and sign-in failure after account deletion. Retained records must remain controlled and accurately disclosed. A status update alone is not proof.

Clinic approval is separately required for retention categories, lawful basis, durations, minimal remaining data and expiry handling. Failed jobs must remain held until authorized reconciliation; do not force-reset a claim to make tests pass.

### 4. Supply exact native release artifacts

Upload a source ZIP containing the **Android project (`android/`, Gradle files, manifests, WebView/Capacitor configuration and dependency declarations)**, excluding private keys/passwords, plus the **signed release AAB** for inspection. Do not include signing keystores or credential files. Provide intended release date and the Play Console Data safety/Health declaration drafts or screenshots without sensitive identifiers. Verified doctor registration/qualification and clinic-approved claims are also needed.

Conditional Windows release commands after the native project is available and reviewed:

```powershell
.\gradlew.bat lintRelease
.\gradlew.bat bundleRelease
```

Those native commands were not run. Effective target SDK, merged permissions, exported components, deep links, network/WebView security, SDK collection, signing and packaged disclosures cannot be certified from this web repository.

## Current Google Play policy check

The official target API page was directly fetched this review and states: new ordinary mobile apps and updates must target **Android 16 / API 36** from 31 August 2026. An extension is not assumed. [Official target policy](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en).

Other applicable official requirements remain: [Health policy](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en), [Health declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en), [account deletion](https://support.google.com/googleplay/android-developer/answer/13327111), [Payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en). Physical medicine orders do not use Play Billing; paid 1:1 non-replay consultations may qualify for the narrow exception, but other digital offerings require separate classification. Play Console answers, actual SDK behavior, testimonials/medical evidence and professional registration have not been verified.

**Summary:** lint now exits successfully with a documented formatting-only generated-source exception; 61 local tests pass and deployed migration hashes/security invariants were checked. `.env` tracking, clean hosted replay, real disposable deletion, retention/recovery design and Android/Play evidence remain release blockers.