# PostHog Analytics Integration Report

## Summary

PostHog analytics has been integrated into the Recurlly Expo app. This document covers what was installed, which files were modified, all events being tracked, and the dashboard created.

---

## Installation

**Package**: `posthog-react-native` (and `expo-file-system`, `expo-application` as peer dependencies)

**Package manager**: Detected automatically at install time.

---

## Configuration

### Environment Variables

Add the following to your `.env` file:

```
POSTHOG_PROJECT_TOKEN=phc_your_project_token_here
POSTHOG_HOST=https://us.i.posthog.com
```

> `POSTHOG_HOST` is optional — omit it to use the PostHog default.

### `app.config.js`

The `app.config.js` dynamic config reads these env vars at build time and injects them as `extra` fields accessible via `expo-constants`:

```js
extra: {
  posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
  posthogHost: process.env.POSTHOG_HOST,
}
```

### `lib/posthog.ts`

Singleton PostHog client. Reads config from `Constants.expoConfig?.extra` — never from hardcoded values. Analytics is automatically disabled if the token is missing or is the placeholder value, so the app functions normally without a configured token.

---

## Files Modified

| File | Change |
|------|--------|
| `app.config.js` | Created — dynamic Expo config that injects env vars as `extra` fields |
| `lib/posthog.ts` | Created — singleton PostHog client with safe no-op fallback |
| `app/_layout.tsx` | Added `PostHogProvider`, manual screen tracking via `usePathname` |
| `app/onboarding.tsx` | Added `posthog.capture("onboarding_get_started")` |
| `app/(auth)/sign-up.tsx` | Added identify + capture on sign-up success and failure |
| `app/(auth)/sign-in.tsx` | Added identify + capture on sign-in success and failure |
| `app/(tabs)/index.tsx` | Added `posthog.capture("subscription_expanded")` on card expand |

---

## Events Tracked

### Screen Views (automatic)

Every route change is captured automatically via `posthog.screen()` in `app/_layout.tsx`. The `previous_screen` property is included for navigation flow analysis. Only safe, non-sensitive URL params (`id`, `tab`, `view`) are forwarded.

### Custom Events

| Event | File | Properties | Notes |
|-------|------|------------|-------|
| `onboarding_get_started` | `app/onboarding.tsx` | _(none)_ | Fires when user taps "Get Started" on the onboarding screen |
| `user_signed_up` | `app/(auth)/sign-up.tsx` | _(none)_ | Fires after email verification is complete |
| `user_sign_up_failed` | `app/(auth)/sign-up.tsx` | `error_message` | Fires when the sign-up API call returns an error |
| `user_signed_in` | `app/(auth)/sign-in.tsx` | _(none)_ | Fires after successful password sign-in or MFA verification |
| `user_sign_in_failed` | `app/(auth)/sign-in.tsx` | `error_message` | Fires when the sign-in API call returns an error |
| `subscription_expanded` | `app/(tabs)/index.tsx` | `subscription_name`, `category`, `status`, `billing` | Fires only when expanding a card (not collapsing) |

### User Identification

`posthog.identify()` is called in both sign-in and sign-up flows immediately before the corresponding capture event. It links the authenticated user's identity to all subsequent events, and sets person properties (`email`, `sign_up_date` or `first_sign_in_date`) via `$set` and `$set_once`.

**Important**: identity and person properties are passed exclusively to `posthog.identify()`. No personal data appears in any `posthog.capture()` call.

---

## Security Decisions

- **No PII in `capture()` calls.** Email addresses and other personal data are passed only to `posthog.identify()`, never as properties of `capture()` events.
- **No hardcoded PostHog host URLs.** The host is read exclusively from `process.env.POSTHOG_HOST` — no fallback URL is embedded in source code.
- **Graceful degradation.** If `POSTHOG_PROJECT_TOKEN` is not set (or is the placeholder), the PostHog client is instantiated with `disabled: true` so all calls are no-ops and the app behaves normally.
- **Safe param forwarding.** Screen tracking only forwards URL params whose keys are in an allowlist (`id`, `tab`, `view`) to avoid accidentally capturing sensitive query string values.

---

## PostHog Dashboard

**Dashboard**: "Analytics basics"
**URL**: https://us.posthog.com/project/360582/dashboard/1409175

### Insights

| # | Name | Type | Description |
|---|------|------|-------------|
| 1 | Acquisition Funnel: Onboarding → Sign Up | Funnel | Conversion from `onboarding_get_started` → `user_signed_up` |
| 2 | Sign Ups & Sign Ins over time | Trends | Daily totals for `user_signed_up` and `user_signed_in` |
| 3 | Subscription Engagement by Category | Trends | `subscription_expanded` broken down by `category` property |
| 4 | Authentication Failures | Trends | Daily totals for `user_sign_in_failed` and `user_sign_up_failed` |
| 5 | Daily New Users | Trends | Unique users who fired `user_signed_up` per day |
