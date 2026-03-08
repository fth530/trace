# Trace – Antigravity S-Class Expense Tracker

Trace is a premium, extremely fast, and completely secure personal finance and expense tracking application built on the **Antigravity S-Class Architecture**. It features an uncompromising **0ms Optimistic UI Update Engine**, SQLite data-persistence with background sync, and a meticulous *Cyberpunk / Minimalist* glowing-neon design language.

## 🚀 Features

- **Blazing Fast 0ms Updates:** Zustand is fully integrated with SQLite for instant UI reflections. You don't wait for disk interactions.
- **S-Class Mechanics Engine:** Highly optimized background synchronization (`AppState` awareness) ensures your balances are perfectly synchronized across midnight rollovers. Spam-tap and multi-threading race conditions are resolved by memory-level data validation.
- **Offline-First & Cloud Ready:** Runs 100% offline out of the box with `expo-sqlite`, while keeping hooks ready for Firebase user authentication.
- **Premium Aesthetics:** Implements a strict `neonColors` design token system, `react-native-reanimated` spring physics, curved layout transitions, and high-fidelity haptics (`expo-haptics`).

## 🛠 Tech Stack

- **Framework:** React Native / Expo Router (v3)
- **Language:** TypeScript (Strict)
- **State Management:** Zustand
- **Local Database:** SQLite (`expo-sqlite`)
- **UI & Animations:** NativeWind (Tailwind CSS) & `react-native-reanimated`
- **Feedback & Routing:** Expo Haptics & Expo Router

## 📂 Project Structure

```bash
📦 Trace
 ┣ 📂 app              # Expo Router core layout & screens (tabs, modals, auth)
 ┣ 📂 components       # Modular, reusable S-Class UI building blocks
 ┣ 📂 lib              # Core Engine: DB, Zustand Store, Types, Constant Design Tokens
 ┃ ┣ 📂 constants      # Colors, tokens, categories (The Aesthetic System)
 ┃ ┣ 📂 db             # SQLite Schema, Queries & Async Logic
 ┃ ┣ 📂 store          # Global Zustand Store 
 ┃ ┗ 📂 utils          # Date parsers, formatters, logging
 ┣ 📂 __tests__        # Unit and Engine State testing
 ┗ 📜 tailwind.config  # Styling engine parameters
```

## 🔋 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Metro bundler:
   ```bash
   npx expo start
   ```
3. Run on your device using Expo Go or build locally.

---
*Built with absolute zero-bug tolerance and strict mathematical precision by the AI Product Factory.*
