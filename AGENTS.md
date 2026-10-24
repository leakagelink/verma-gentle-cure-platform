<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Account/data deletion uses verified-owner server functions and an administrator review queue; submission must never be presented as completed deletion because medical and financial retention requires human review.
- Health-data saving and uploads require explicit per-visit consent; keep the purpose, recipient and deletion links visible before collection.
- This repository is the web application, not an Android bundle; native SDK, manifest permissions and Play Console declarations must be verified separately before claiming store readiness.

- Commerce creation uses an authenticated atomic database RPC; browser totals are display-only because order integrity is a security boundary.
- Gateway confirmations bind the stored order to captured provider amounts before service-only atomic settlement; callbacks are not payment proof.
- Doctors require administrator-managed patient assignments; a verified role alone is not a clinical relationship.
- Patient booking, cancellation and payment attempts use authenticated narrow RPCs; direct financial writes are revoked to prevent field tampering.
- Health writes consume owner/purpose-bound server-issued consent receipts; clinical updates preserve evidence rather than deriving consent from read access.
- Checkout persists owner-bound request IDs and gateway initiation claims; ambiguous provider failures retain claims for manual reconciliation to prevent duplicate charging.
- Lovable's managed migration tool is the sole schema deployment path; legacy SQL is a baseline reference and must not be independently replayed against production.
- Deletion processing uses an administrator-authorized token claim, account freeze, storage/API removal and readback; medical/financial/clinician dependencies block automated processing until lawful retention is resolved, preventing cascading loss of required records.
