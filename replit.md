# Trace (Gunluk App) - Replit Configuration

## Project Overview
"Trace" is a mobile journaling/expense tracking app built with Expo React Native. It uses Firebase for authentication and cloud sync, with local SQLite storage via expo-sqlite.

## Architecture
- **Framework**: Expo SDK ~54 with expo-router (file-based routing)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Authentication**: Firebase Auth with Google Sign-In
- **Database**: expo-sqlite (local) + Firebase Firestore (cloud sync)
- **Error Tracking**: Sentry

## Project Structure
```
app/                    # Expo Router pages
  _layout.tsx           # Root layout with providers
  auth/                 # Authentication screens
  onboarding/           # Onboarding flow
  (tabs)/               # Main tab navigation
  history/              # History screens
  modal/                # Modal screens
components/             # Reusable UI components
lib/
  constants/            # Design tokens, app constants
  db/                   # SQLite database helpers
  firebase/             # Firebase config, auth, sync
  hooksstore/           # Zustand store + hooks
  translations/         # i18n translations
  utils/                # Utility functions
assets/                 # Images, fonts, icons
plugins/                # Custom Expo build plugins
```

## Running the App
- **Workflow**: "Start application" runs `npx expo start --web --port 5000`
- **Web**: Accessible at port 5000 (webview)
- **Mobile**: Scan QR code from the Expo Metro Bundler output with Expo Go app

## Environment Variables
Copy `.env.example` to `.env` and fill in Firebase values:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_SENTRY_DSN` (optional)

## Notes
- Firebase native modules gracefully degrade when unavailable (Expo Go fallback)
- App uses anonymous auth or Google Sign-In
- Local SQLite data can sync to Firestore when authenticated
