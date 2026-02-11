# Trace (Günlük) — Complete Implementation Roadmap
> **Motto:** "Ben muhasebeci değilim, sadece bugün ne kadar gitti onu bilmek istiyorum."

---

## 1. 📐 ARCHITECTURE OVERVIEW

### System Diagram
```
User Input (Touch/Gestures)
    ↓
React Native Components (Expo Router)
    ↓
Zustand Store (Global State)
    ↓
SQLite Database Layer (expo-sqlite)
    ↓
Local Device Storage
```

### Data Flow
1. **User Action** → Button press, swipe gesture, form input
2. **Component Handler** → Calls Zustand action
3. **Zustand Action** → Updates in-memory state + triggers DB write
4. **Database Layer** → Executes SQL query (INSERT/UPDATE/DELETE/SELECT)
5. **State Update** → Zustand notifies subscribed components
6. **UI Re-render** → Components reflect new state with animations

### Navigation Tree
```
(tabs) Layout
├── index (Bugün - Home)
│   └── Modal: add-expense
├── history (Geçmiş)
│   └── [date] (Day Detail)
└── settings (Ayarlar)
```

### State Management Strategy
**Zustand Store:** Today's expenses, daily/monthly totals, user settings, aggregated history
**Local Component State:** Form inputs, modal visibility, animation states, scroll positions

### Tech Stack (Locked)
| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | React Native (Expo SDK 52+, Managed Workflow) |
| Navigation   | Expo Router (file-based)                      |
| Styling      | NativeWind v4                                 |
| State Mgmt   | Zustand                                       |
| Database     | expo-sqlite (local persistence)               |
| Animations   | react-native-reanimated v3                    |
| Haptics      | expo-haptics                                  |
| Icons        | @expo/vector-icons                            |
| Date Utils   | date-fns                                      |

---

## 2. 🗄️ DATABASE DESIGN

### Schema
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT CHECK(category IN ('Yol', 'Yemek', 'Market', 'Diğer')),
  description TEXT NOT NULL,
  date TEXT NOT NULL,        -- ISO 8601: YYYY-MM-DD
  created_at INTEGER NOT NULL -- Unix timestamp
);

CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Seed Data
```sql
INSERT INTO settings (key, value) VALUES
  ('daily_limit', '500'),
  ('monthly_limit', '10000'),
  ('theme', 'dark');
```

### Query Patterns

**Home Screen:**
```sql
SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC;
SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?;
SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ? AND date <= ?;
```

**Add Expense:**
```sql
INSERT INTO expenses (amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?);
```

**History Screen:**
```sql
SELECT date, COUNT(*) as count, SUM(amount) as total
FROM expenses WHERE date >= date('now', '-30 days')
GROUP BY date ORDER BY date DESC;

SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= date('now', '-7 days');
SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= date('now', 'start of month');
```

**Day Detail:**
```sql
SELECT * FROM expenses WHERE date = ? ORDER BY created_at DESC;
```

**Settings & Delete:**
```sql
SELECT * FROM settings;
UPDATE settings SET value = ? WHERE key = ?;
DELETE FROM expenses;
DELETE FROM expenses WHERE id = ?;
```

### Migration Strategy
- Version stored in `settings` table as `db_version`
- Future migrations in `lib/db/migrations/`
- Check version on app start, run pending migrations sequentially

---

## 3. 📁 FILE & FOLDER STRUCTURE

```
Trace/
├── app/
│   ├── _layout.tsx                 # Root layout with theme provider
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Tab navigator layout
│   │   ├── index.tsx               # Home screen (Bugün)
│   │   ├── history.tsx             # History screen (Geçmiş)
│   │   └── settings.tsx            # Settings screen
│   ├── history/
│   │   └── [date].tsx              # Day detail screen
│   └── modal/
│       └── add-expense.tsx         # Add expense modal
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # Reusable button component
│   │   ├── Card.tsx                # Glassmorphic card container
│   │   ├── Input.tsx               # Text input with label
│   │   └── Badge.tsx               # Category badge
│   ├── expense/
│   │   ├── ExpenseItem.tsx         # Single expense list item (swipeable)
│   │   ├── ExpenseList.tsx         # Animated list of expenses
│   │   └── DailyTotal.tsx          # Hero total display
│   ├── limit/
│   │   ├── LimitBanner.tsx         # Warning banner component
│   │   └── LimitProgress.tsx       # Progress bar for limits
│   └── history/
│       ├── DaySummaryCard.tsx      # Day summary in history
│       └── PeriodSummary.tsx       # Weekly/monthly footer
├── lib/
│   ├── db/
│   │   ├── index.ts                # Database initialization
│   │   ├── schema.ts               # SQL schema definitions
│   │   └── queries.ts              # All SQL queries
│   ├── store/
│   │   ├── index.ts                # Zustand store definition
│   │   ├── types.ts                # TypeScript interfaces
│   │   └── actions.ts              # Store actions
│   ├── utils/
│   │   ├── date.ts                 # Date formatting helpers (date-fns)
│   │   ├── currency.ts             # Currency formatting (₺)
│   │   └── limits.ts               # Limit calculation logic
│   └── constants/
│       ├── colors.ts               # Design tokens: colors
│       ├── spacing.ts              # 8px grid spacing scale
│       └── categories.ts           # Category definitions
├── assets/
│   └── fonts/                      # Custom fonts if needed
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── tailwind.config.js              # NativeWind configuration
├── global.css                      # Tailwind directives
└── tsconfig.json                   # TypeScript config
```

---

## 4. 🧩 COMPONENT INVENTORY

### UI Components (Reusable: ✅)

| Component | Props | Used In | Key Behavior |
|-----------|-------|---------|--------------|
| **Button** | `label, onPress, variant: 'primary'\|'secondary'\|'danger', disabled?` | All screens | Haptic feedback on press |
| **Card** | `children, className?` | Home, History, Day Detail | Glassmorphic background with blur |
| **Input** | `label, value, onChangeText, placeholder?, keyboardType?` | Add Expense, Settings | Floating label animation |
| **Badge** | `category: Category, size?: 'sm'\|'md'` | ExpenseItem, Day Detail | Category with icon and color |

### Expense Components

| Component | Props | Used In | Key Behavior |
|-----------|-------|---------|--------------|
| **ExpenseItem** | `expense, onDelete?, showDate?` | Home, Day Detail | Swipe-to-delete (if onDelete) |
| **ExpenseList** | `expenses[], onDelete?, emptyMessage` | Home, Day Detail | Animated enter/exit, empty state |
| **DailyTotal** | `amount, limit, isToday` | Home | Hero number counting animation |

### Limit Components

| Component | Props | Used In | Key Behavior |
|-----------|-------|---------|--------------|
| **LimitBanner** | `percentage, type: 'daily'\|'monthly', limit` | Home | Slide in, auto-dismiss 3s |
| **LimitProgress** | `current, limit, type: 'daily'\|'monthly'` | Home, Settings | Animated progress bar with color |

### History Components

| Component | Props | Used In | Key Behavior |
|-----------|-------|---------|--------------|
| **DaySummaryCard** | `date, total, count, onPress` | History | Tappable card |
| **PeriodSummary** | `weeklyTotal, monthlyTotal` | History | Sticky footer summary |

---

## 5. 🎨 DESIGN SYSTEM & TOKENS

### Color Palette

| Token | Dark Mode (Primary) | Light Mode |
|-------|-------------------|------------|
| background | `#000000` | `#F5F5F7` |
| surface | `#1C1C1E` | `#FFFFFF` |
| surfaceGlass | `rgba(28,28,30,0.7)` | `rgba(255,255,255,0.7)` |
| text.primary | `#FFFFFF` | `#1D1D1F` |
| text.secondary | `#AEAEB2` | `#6E6E73` |
| text.tertiary | `#636366` | `#86868B` |
| accent | `#0A84FF` | `#007AFF` |
| success | `#30D158` | `#34C759` |
| warning | `#FF9F0A` | `#FF9500` |
| danger | `#FF453A` | `#FF3B30` |

**Category Colors (Dark):** Yol `#5E5CE6` · Yemek `#FF375F` · Market `#64D2FF` · Diğer `#98989D`

### Typography Scale

| Token | Size | Weight | Line Height |
|-------|------|--------|-------------|
| hero | 56px | 700 | 64px |
| title | 28px | 600 | 32px |
| headline | 20px | 600 | 24px |
| body | 16px | 400 | 24px |
| caption | 13px | 400 | 16px |
| footnote | 11px | 400 | 13px |

### Spacing Scale (8px Grid)
`xs: 8` · `sm: 16` · `md: 24` · `lg: 32` · `xl: 40` · `xxl: 48` · `xxxl: 64`

### Border Radius
`sm: 8` · `md: 16` · `lg: 24` · `full: 9999`

### Shadows
| Level | Offset | Opacity | Radius | Elevation |
|-------|--------|---------|--------|-----------|
| sm | 0, 2 | 0.10 | 4 | 2 |
| md | 0, 4 | 0.15 | 8 | 4 |
| lg | 0, 8 | 0.20 | 16 | 8 |

### Animation Specs
| Animation | Duration | Easing |
|-----------|----------|--------|
| countUp (number) | 800ms | out(cubic) |
| slideIn (banner) | 300ms | out(ease) |
| listEnter (items) | 250ms + 50ms stagger | out(quad) |
| swipe (delete) | 200ms | inOut(ease) |
| progress (bar) | 600ms | out(cubic) |

---

## 6. 📱 SCREEN-BY-SCREEN SPECIFICATION

### 6.1 Home (Bugün) — `app/(tabs)/index.tsx`

**Layout:** Header (title + date) → Hero total + progress bar → Warning banner (conditional) → Expense list → FAB

**Data:** Today's expenses, today total, daily/monthly limits, month total

**Interactions:**
- Tap FAB → Open add-expense modal
- Swipe expense left → Delete with confirmation + haptic
- Pull to refresh → Reload data

**Edge Cases:**
- Empty → "Henüz harcama eklemedin" mesajı
- Limit = 0 → Progress bar yerine "∞ Limit belirlenmedi" mesajı gösterilir
- Amount > 999,999 → "1.2M₺" formatı

**Accessibility:**
- Hero total: `accessibilityLabel="Bugünkü toplam {amount} lira"`
- FAB: `accessibilityLabel="Harcama ekle"`

---

### 6.2 Add Expense Modal — `app/modal/add-expense.tsx`

**Layout:** Header + close (X) → Amount input (₺ prefix) → Category chips → Description → Save button

**Validation:** Amount > 0 (required), Description (required), Category (optional)

**Edge Cases:**
- Amount = 0 → "Geçerli bir tutar girin"
- Decimal → Max 2 places via regex: `/^\d+(\.\d{0,2})?$/` + `parseFloat().toFixed(2)`
- Amount > 1,000,000 → "Emin misiniz?" uyarısı

---

### 6.3 History (Geçmiş) — `app/(tabs)/history.tsx`

**Layout:** Header → Period summaries (week/month, sticky) → Day cards (last 30 days)

**Data:** Daily summaries, weekly total, monthly total

**Interactions:** Tap day card → Navigate to day detail

---

### 6.4 Day Detail — `app/history/[date].tsx`

**Layout:** Header (date + back) → Total → Expense list (read-only, no swipe)

---

### 6.5 Settings (Ayarlar) — `app/(tabs)/settings.tsx`

**Layout:** Limits section → Theme picker (Light/Dark/Auto) → "Tüm Verileri Sil" button → Version

**Interactions:**
- Limit change → Debounced save (500ms)
- Theme change → Immediate save + apply
- Delete → Confirmation: "Emin misiniz? Bu işlem geri alınamaz."

---

## 7. 🔔 LIMIT & WARNING SYSTEM

### Thresholds & Messages

| Level | Trigger | Message (TR) | Color | Haptic |
|-------|---------|--------------|-------|--------|
| 50% | daily ≥ 50% | "Günlük limitinin yarısını geçtin" | Yellow | Light |
| 80% | daily ≥ 80% | "Günlük limitinin %80'ine ulaştın" | Orange | Medium |
| 100% | daily ≥ 100% | "Günlük limitini aştın! (X₺ / Y₺)" | Red | Heavy |
| M-80% | monthly ≥ 80% | "Aylık limitinin %80'ine ulaştın" | Orange | Medium |
| M-100% | monthly ≥ 100% | "Aylık limitini aştın!" | Red | Heavy |

### Logic Flow
1. Calculate percentages on **expense add only** (not delete, not app open)
2. Check daily first (priority over monthly)
3. If daily < 50%, then check monthly
4. Show banner → slide in from top, auto-dismiss after 3s
5. Tap or swipe-up to dismiss early
6. Trigger haptic based on severity level

### Color Transitions on Progress Bar
- **0-49%:** Green (`success`)
- **50-79%:** Yellow (`warning` light)
- **80-99%:** Orange (`warning`)
- **100%+:** Red (`danger`)

---

## 8. 🔄 ZUSTAND STORE DESIGN

### State Shape
```typescript
interface Expense {
  id: number;
  amount: number;
  category: 'Yol' | 'Yemek' | 'Market' | 'Diğer' | null;
  description: string;
  date: string;
  created_at: number;
}

interface DaySummary {
  date: string;
  count: number;
  total: number;
}

interface Settings {
  daily_limit: number;
  monthly_limit: number;
  theme: 'light' | 'dark' | 'auto';
}

interface AppStore {
  todayExpenses: Expense[];
  todayTotal: number;
  monthTotal: number;
  history: DaySummary[];
  weekTotal: number;
  settings: Settings;
  isLoading: boolean;

  init: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadDayExpenses: (date: string) => Promise<Expense[]>;
  updateSetting: (key: keyof Settings, value: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  calculateTotals: () => Promise<void>;
}
```

### Initialization Flow
```
App Start → Zustand.init() → Open DB → Run Schema (IF NOT EXISTS)
→ Load Settings → Load Today's Expenses → Calculate Totals
→ Set isLoading = false → Render UI
```

### Action Side Effects
| Action | DB Operation | State Updates |
|--------|-------------|---------------|
| `init()` | SELECT expenses, settings | Hydrate all state |
| `addExpense()` | INSERT | Add to array, recalc totals, trigger limit check |
| `deleteExpense()` | DELETE | Remove from array, recalc totals |
| `loadHistory()` | SELECT GROUP BY | Update history, weekTotal, monthTotal |
| `updateSetting()` | UPDATE | Update settings object |
| `clearAllData()` | DELETE all | Reset all arrays and totals to 0 |

---

## 9. 🗓️ IMPLEMENTATION PHASES (Sprint Plan)

### Phase 0: Project Setup ✅
**Goal:** Initialize Expo project with all dependencies
**Complexity:** Simple
**Files:** `package.json`, `app.json`, `tailwind.config.js`, `tsconfig.json`, `babel.config.js`, `global.css`
**Status:** DONE — user must run `npm install`

---

### Phase 1: Database Layer & Constants
**Goal:** Create database schema, queries, and design tokens
**Complexity:** Medium
**Files:**
- `lib/db/index.ts` — DB initialization
- `lib/db/schema.ts` — SQL schema
- `lib/db/queries.ts` — All queries
- `lib/constants/colors.ts` — Color tokens
- `lib/constants/spacing.ts` — Spacing scale
- `lib/constants/categories.ts` — Category definitions
**Dependencies:** Phase 0
**Definition of Done:** DB creates tables on first run, queries work, constants export correctly

---

### Phase 2: Zustand Store & Utilities
**Goal:** Build global state management
**Complexity:** Complex
**Files:**
- `lib/store/types.ts` — TypeScript interfaces
- `lib/store/index.ts` — Zustand store
- `lib/store/actions.ts` — Store actions
- `lib/utils/date.ts` — Date helpers
- `lib/utils/currency.ts` — Currency formatting
- `lib/utils/limits.ts` — Limit calculations
**Dependencies:** Phase 1
**Definition of Done:** Store initializes, add/delete works, totals calculate correctly

---

### Phase 3: UI Components
**Goal:** Build reusable component library
**Complexity:** Medium
**Files:** `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Badge.tsx`
**Dependencies:** Phase 1 (constants)
**Definition of Done:** Components render in isolation, dark mode works, haptics on Button

---

### Phase 4: Home Screen (Core Loop)
**Goal:** Build main expense tracking interface
**Complexity:** Complex
**Files:**
- `app/(tabs)/_layout.tsx` — Tab navigator
- `app/(tabs)/index.tsx` — Home screen
- `components/expense/DailyTotal.tsx`
- `components/expense/ExpenseList.tsx`
- `components/expense/ExpenseItem.tsx`
**Dependencies:** Phase 2, 3
**Definition of Done:** Today's expenses display, hero total correct, empty state renders

---

### Phase 5: Add Expense Flow
**Goal:** Enable expense creation
**Complexity:** Medium
**Files:** `app/modal/add-expense.tsx`, `app/_layout.tsx` (update)
**Dependencies:** Phase 4
**Definition of Done:** Modal opens from FAB, validation works, saves to DB, appears in list

---

### Phase 6: Limit System & Warnings
**Goal:** Implement warning banners and progress bars
**Complexity:** Complex
**Files:** `components/limit/LimitBanner.tsx`, `components/limit/LimitProgress.tsx`
**Dependencies:** Phase 5
**Definition of Done:** Banner at correct thresholds, haptics fire, colors transition

---

### Phase 7: History & Day Detail
**Goal:** Build expense history views
**Complexity:** Medium
**Files:**
- `app/(tabs)/history.tsx`
- `app/history/[date].tsx`
- `components/history/DaySummaryCard.tsx`
- `components/history/PeriodSummary.tsx`
**Dependencies:** Phase 4
**Definition of Done:** Last 30 days display, totals correct, navigation works

---

### Phase 8: Settings Screen
**Goal:** User preferences and data management
**Complexity:** Simple
**Files:** `app/(tabs)/settings.tsx`
**Dependencies:** Phase 2
**Definition of Done:** Limits persist, theme changes apply, clear data with confirmation

---

### Phase 9: Animations & Polish
**Goal:** Add micro-interactions
**Complexity:** Medium
**Files:** Update existing components
**Dependencies:** Phase 4-8
**Definition of Done:** Number counting animates, list stagger, smooth swipe-to-delete

---

### Phase 10: Final QA & Edge Cases
**Goal:** Test edge cases and fix all bugs
**Complexity:** Simple
**Dependencies:** All previous phases
**Definition of Done:** All edge cases handled, no crashes, performance OK with 100+ expenses

---

### Phase 11: Backup & Export (Gelecek — Opsiyonel)
**Goal:** Veri kaybını önlemek için CSV export özelliği
**Complexity:** Medium
**Files:** `lib/utils/export.ts`, Settings ekranına "Dışa Aktar" butonu
**Dependencies:** Phase 8
**Definition of Done:** Tüm harcamalar CSV olarak dışa aktarılabilir, Share sheet ile paylaşılabilir
**Not:** Bu faz MVP scope'unda değil, ileride eklenecek

---

## 10. ⚠️ RISK REGISTER & TECHNICAL DECISIONS

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| SQLite query perf with large datasets | 🟡 Orta | Indexes on `date`, limit history to 30 days, FlashList for >50 items |
| Swipe gesture conflicts with scroll | 🔴 Kritik | `GestureHandlerRootView` ile wrap et, `Swipeable` component'te `friction={2}`, `rightThreshold={40}`, `overshootRight={false}` |
| Number animation jank (56px hero) | 🟡 Orta | `useNativeDriver: true`, `Animated.Text` kullan (`TextInput` değil), reduce to 30fps if needed |
| Theme flash on app start | 🔴 Kritik | `expo-splash-screen` ile theme DB'den yüklenene kadar splash göster, `SplashScreen.preventAutoHideAsync()` |
| Decimal input validation | 🟢 Düşük | Regex `/^\d+(\.\d{0,2})?$/` + `toFixed(2)` formatı |

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Zustand** over Context | Better performance (selective re-renders), simpler async actions |
| **expo-sqlite** over AsyncStorage | Structured queries (SUM, GROUP BY), relational model |
| **NativeWind v4** | Familiar Tailwind syntax, TypeScript support, smaller bundle |
| **Raw SQL** over Drizzle ORM | Simpler for this scope, pre-designed queries, less abstraction |
| **Faz sırası korundu** | Limit sistemi uygulamanın ana özelliği, animasyonlardan önce gelmeli |

### Known Gotchas
- **Expo Router modals:** Must use `presentation: 'modal'` in layout config
- **NativeWind dark mode:** Requires custom theme provider setup
- **SQLite date functions:** Always use ISO 8601 format (`YYYY-MM-DD`)
- **Reanimated plugin:** Must be LAST in babel plugins array
- **GestureHandler:** Root layout'ta `<GestureHandlerRootView>` ile sarmala

---

## 11. 🧪 TESTING STRATEGY

### Manual Testing Per Phase

**Phase 4 (Home):**
- [ ] Empty state displays when no expenses
- [ ] Add expense via FAB
- [ ] Swipe to delete works
- [ ] Total updates immediately

**Phase 5 (Add Expense):**
- [ ] Cannot save with amount = 0
- [ ] Cannot save with empty description
- [ ] Decimal input works (12.50)
- [ ] Category selection optional

**Phase 6 (Limits):**
- [ ] Banner shows at 50%, 80%, 100%
- [ ] Haptics fire correctly
- [ ] Colors transition smoothly
- [ ] Banner auto-dismisses after 3s

**Phase 7 (History):**
- [ ] Last 30 days load
- [ ] Weekly/monthly totals correct
- [ ] Day detail shows all expenses

**Phase 8 (Settings):**
- [ ] Limit changes persist after restart
- [ ] Theme changes apply immediately
- [ ] Clear data shows confirmation dialog

### Critical User Flows
1. **İlk kullanım:** Aç → Boş ekran → Harcama ekle → Listede gör
2. **Günlük takip:** Birkaç harcama ekle → Toplamı kontrol et → Limit uyarısı gör
3. **Geçmiş inceleme:** Geçmiş → Güne tıkla → Detayları gör
4. **Limit ayarlama:** Ayarlar → Limit değiştir → Ana ekrana dön → Progress güncel

### Edge Cases Checklist
- [ ] Amount = 0 reddedilmeli
- [ ] Amount > 1,000,000 düzgün formatlanmalı
- [ ] Emoji içeren açıklama çalışmalı
- [ ] 500+ karakter açıklama
- [ ] Limit = 0 → "∞ Limit belirlenmedi" mesajı gösterilmeli
- [ ] Negatif limit reddedilmeli
- [ ] Son harcamayı sil → boş ekrana dön
- [ ] Gece yarısı harcama ekleme (tarih sınırı)
- [ ] Ay sonu geçişi (31 Ocak → 1 Şubat)
- [ ] Tüm verileri sil onay diyaloğu
- [ ] Uygulama yeniden başlatma (veri kalıcılığı)
- [ ] Tema değişikliği (tüm ekranlar güncellensin)
- [ ] Çok eski harcamalar (performans kontrolü)

---

## 📋 ÖZET

| Metrik | Değer |
|--------|-------|
| Toplam Faz | 11 (Phase 0-10 + Phase 11 opsiyonel) |
| Toplam Dosya | ~40 |
| Ekran Sayısı | 5 (Home, Add, History, Day Detail, Settings) |
| Komponent Sayısı | 13 |
| Tahmini Süre | 2-3 hafta (solo dev) |
| Roadmap Puanı | 8.5/10 (Reviewed) |

**Mimari Öncelikler:**
1. **Sadelik:** Gereksiz mühendislik yok, minimal bağımlılık
2. **Performans:** Optimize sorgular, native animasyonlar
3. **UX:** Akıcı etkileşimler, net geri bildirim
4. **Bakım:** Temiz separation of concerns, TypeScript güvenliği
