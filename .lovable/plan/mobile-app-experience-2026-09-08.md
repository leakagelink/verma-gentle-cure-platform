# Mobile app experience

## Goal
Make phone-sized screens feel like a polished healthcare app while preserving the existing desktop website and all current functionality.

## What will change
- Replace the mobile website header/menu treatment with a compact app bar that keeps the brand, cart, and secondary navigation easy to reach.
- Upgrade the bottom navigation with clearer active states, safe-area spacing, stable touch targets, and correct content clearance.
- Make page headers shorter on phones so the actual task starts sooner.
- Turn the medicine filters into a mobile bottom sheet and use a denser two-column product layout where practical.
- Make booking feel like an app flow with a compact progress indicator and a sticky bottom action area.
- Refine account, appointment, and order screens into scannable app-style lists while leaving desktop layouts intact.
- Reduce oversized mobile spacing and hide the large website footer on phones; keep legal and secondary links available through the mobile menu.
- Add install-ready web app metadata and a manifest so the experience has proper standalone display, app name, theme color, and icons.

## Validation
- Check the main mobile screens at 393×852 with no horizontal overflow or covered content.
- Verify Home, Shop, Consultation, Booking, Account, Appointments, and Orders at phone size.
- Confirm desktop navigation and layouts remain unchanged.
- Run the project checks after implementation.

## Technical details
- Changes stay in shared presentation components, route layout classes, and public app metadata; no database or business-rule changes.
- Existing brand colors, logo, typography, authentication, cart, appointments, prescriptions, and order flows remain unchanged.
- Touch controls will use existing design-system components and safe-area CSS.
