# Verma Gentle Cure — Google Play release checklist

Policy review: 24 October 2026. This checklist is not an approval certificate. Recheck Google's current policy pages and Play Console before uploading.

## App changes in this repository
- Public account/data deletion resource: `https://vermagentlecure.com/delete-account`. Signed-in requests persist with verified owner identity; signed-out users can request through clinic call/WhatsApp without reinstalling. Account and mobile navigation link to it.
- Administrators can load deletion requests from My account. Requests are pending, not completed deletion. Staff must actually verify, remove eligible personal data and storage files, and communicate the result. Auth-only deletion is insufficient.
- Privacy policy explains operator, health/account/payment data, providers, file selection, local session/cart, guardian use and manual deletion/retention exceptions.
- Explicit account registration consent and health form save/upload consent; health disclaimer visible throughout the app.
- Physical-kit shipping policy aligned with ₹1,500 per kit and ₹125 per order.

## Owner decisions required before submission
- Confirm BHMS qualification, professional registration number, authority to offer consultation and dispense/sell kits, and applicable product regulations. Do not imply the app or medicines have regulatory approval unless substantiated.
- Approve specific medical, financial and backup retention periods and legal reasons; update the privacy policy accordingly. Current wording does not invent a legal duration or processing SLA.
- Assign an administrator to monitor and fulfil deletion requests. Test actual removal, retained-record restrictions, session revocation and the patient confirmation process. Never mark a request complete just because it was received.
- Verify all claims and genuine testimonials. Remove unverifiable treatment, efficacy, cure or certification claims. Disclaimer does not excuse misleading health claims.
- Confirm privacy contact and all third-party providers/SDKs for the final native build; disclose logging/diagnostics and any additional collection accurately.

## Play Console (owner access required)
1. Publish the updated website before entering policy URLs. Privacy: `https://vermagentlecure.com/privacy-policy`; deletion: `https://vermagentlecure.com/delete-account`. Confirm both open publicly with no login requirement.
2. Complete Health apps declaration for the actual consultation/health-record/health-information features. This app is not a medical device; do not claim automated diagnosis/treatment.
3. Complete Data safety using the actual web and native SDK flows: name, email, phone, profile details, health history/reports/photos, addresses, purchases and payment identifiers; review IP/diagnostics, session identifiers and provider logs. Mark required/optional and collection/sharing only after verifying actual practices and Google's service-provider definitions. Do not declare “no data collected.” Data is encrypted in transit; do not claim end-to-end encryption.
4. Provide reviewer access and instructions for patient and staff functionality. Do not put credentials in source or public documentation.
5. Set truthful target audience and content rating. Adults/guardians operate accounts; child patient records do not automatically make this a child-directed app. If targeting children, independently meet Families policies.
6. Use accurate store listing, real screenshots, official clinic assets, support details and non-guaranteed health copy. Complete any required organization verification and testing track requirements shown for your developer account.

## Android / Android Studio (not present in this repository)
- No `android/`, Gradle project or Capacitor configuration is currently checked in. A PWA manifest is not an Android App Bundle and does not establish Play compliance. Audit the actual Windows Android Studio project before submission.
- Verify current target SDK requirement: Google’s policy page reviewed for this task states API 36 for new phone apps/updates from 31 August 2026. Follow current Console requirements if changed. Build a signed release AAB, protect signing keys, version every update, and test release mode.
- Check 16 KB page-size compatibility for every native library and 64-bit ABI support when native code is included.
- Allow HTTPS only; disable cleartext traffic/debugging in release. Never include private payment/service keys in the bundle. Do not load untrusted URLs with native bridge access.
- Request no contacts/SMS/location/broad media permissions for this app's current file-picker flows. Use Android system file/photo picker; add camera/microphone only if actual in-app video requires it, with contextual disclosure and runtime consent. Audit merged manifest and every SDK/plugin.
- Verify native back navigation, external call/WhatsApp links, report upload/download, Razorpay open/return/cancel/retry, offline/error state, orientation, text scaling and accessibility. The server-rendered app must not be packaged as static output without an appropriate deployment strategy.
- An owned WebView is not automatically banned, but a broken or minimal website wrapper can fail minimum-functionality rules. Confirm meaningful patient appointment, report, prescription and commerce flows in the installed release app.

## Payments
- Razorpay is used for physical homeopathic kit orders. Google Play Billing must not be used for physical goods.
- Review the exact 1:1 clinical consultation against Google's current real-time person-to-person service exception (including whether replay recordings exist). Do not assume all online digital services are exempt. Paid digital features, subscriptions or replay content may require Play Billing.
- Test gateway behaviour with test mode/account where possible; do not charge real patients for release validation.

## Official policy sources
- Health: https://support.google.com/googleplay/android-developer/answer/16679511
- Health declaration: https://support.google.com/googleplay/android-developer/answer/14738291
- User data: https://support.google.com/googleplay/android-developer/answer/10144311
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Target SDK: https://support.google.com/googleplay/android-developer/answer/11926878
- Payments: https://support.google.com/googleplay/android-developer/answer/9858738
- WebViews: https://support.google.com/googleplay/android-developer/answer/9899034
- Minimum functionality: https://support.google.com/googleplay/android-developer/answer/9898783