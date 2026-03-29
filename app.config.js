// app.config.js — dynamic Expo config
// Extends app.json and exposes PostHog env vars via expo-constants extras.
// Environment variables are read at build time from .env.

const appJson = require('./app.json')

export default {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
  },
}
