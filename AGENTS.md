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
