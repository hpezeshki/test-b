<p align="center"><img src="./assets/valisan-logo.jpg" alt="Valisan — Pilates | Yoga | Wellness" width="520"></p>

# VALISAN — Phase 1 Technical Blueprint

**Project:** Valisan (والیسان) — ultra-luxury boutique women's Pilates, Yoga & Wellness studio
**Deliverable:** Interactive, turnkey MVP prototype with rich mock data, live on a $0 HTTPS URL
**Aesthetic benchmarks:** gordanfitness.com · wewellness.ir
**Locale:** Native Persian (fa-IR), full RTL, Jalali (Solar Hijri) calendar, Persian numerals toggle
**Document status:** Phase 1 — Architecture & Blueprint (no production code). Awaiting stakeholder sign-off before Phase 2.
**Blueprint date:** 1405/07/03 (2026-09-25)

---

## Table of Contents

0. [Executive Summary](#0-executive-summary)
1. [Section 1 — Tech Stack Comparative Matrix & Final Recommendation](#section-1--tech-stack-comparative-matrix--final-recommendation)
2. [Section 2 — Zero-Cost ($0) Live Deployment Strategy](#section-2--zero-cost-0-live-deployment-strategy)
3. [Section 3 — Data Architecture & System Flow Diagrams](#section-3--data-architecture--system-flow-diagrams)
4. [Section 4 — Luxury Design System Specifications (Tokens)](#section-4--luxury-design-system-specifications-tokens)
5. [Appendix A — Persian UI String Dictionary](#appendix-a--persian-ui-string-dictionary)
6. [Appendix B — Phase 2 Repository Layout Preview](#appendix-b--phase-2-repository-layout-preview)
7. [Appendix C — Risk Register & Mitigations](#appendix-c--risk-register--mitigations)
8. [Decisions Requiring Confirmation](#decisions-requiring-confirmation)

---

## 0. Executive Summary

| Decision | Recommendation |
|---|---|
| **Stack** | **Next.js 15 (App Router, static export) + TypeScript + Tailwind CSS v4 + Lucide Icons + Zustand (persist) over IndexedDB**, with a swappable repository layer so Supabase (Postgres + RLS + Auth) can replace the mock engine in Phase 3 with zero UI changes. |
| **Hosting** | **Cloudflare Pages (free tier)** as the primary live URL, with **GitHub Pages** as a byte-identical fallback built from the same static export. Vercel Hobby is the upgrade path once a real backend is introduced. |
| **Why not WordPress** | Amelia/Bookly cannot reach the editorial, whitespace-driven Gordan/WeWellness aesthetic without fighting the plugins; Jalali + multi-coach capacity + dual-track payment + role-isolated health records require deep custom PHP that erases the CMS speed advantage; and the demo would need paid hosting or a fragile free host. |
| **Persistence** | Zustand `persist` middleware with an IndexedDB storage adapter (via `idb-keyval`). Versioned seed data, "Reset demo data" control, three demo accounts (student / coach / super-admin). |
| **Calendar** | `jalaali-js` (conversion, ~2 KB) + `date-fns-jalali` (formatting/arithmetic). Custom-built Jalali picker and weekly schedule matrix (Shanbeh → Jomeh) built on the design system rather than a third-party picker. |
| **Fonts** | Self-hosted **Vazirmatn** (variable woff2) for all Persian UI; **Cormorant Garamond** (self-hosted) for the Latin wordmark and editorial accents. No Google Fonts runtime dependency (blocked/unreliable inside Iran). |

Estimated Phase 2 delivery: **complete codebase, seed data and live URL in a single generation pass**, followed by one polish iteration after stakeholder feedback.

---

## Section 1 — Tech Stack Comparative Matrix & Final Recommendation

### 1.1 Candidate routes

| | Route A — CMS | Route B — Modern Headless / Jamstack |
|---|---|---|
| Core | WordPress 6.x + WooCommerce | Next.js 15 (App Router) + TypeScript |
| Booking | Amelia **or** Bookly (premium) | Custom scheduling & capacity engine (TypeScript domain module) |
| Calendar | WP-Parsidate / Persian Calendar add-ons + Amelia locale hacks | `jalaali-js` + `date-fns-jalali` + custom Jalali components |
| Content | ACF Pro + Gutenberg / Elementor | MDX blog + typed content collections (Phase 3: Supabase or a headless CMS) |
| Styling | Theme (Astra/GeneratePress/custom) + Elementor + custom CSS | Tailwind CSS v4 design tokens + Radix primitives + Framer Motion |
| Icons | Font Awesome / Elementor icon packs | Lucide (tree-shaken SVG) |
| Data | MySQL on hosting | Client-side persistent mock engine (Zustand + IndexedDB) → Supabase Free Tier in Phase 3 |
| Auth / RBAC | WP roles + Members plugin | Mock session with typed roles + route-group guards → Supabase Auth + RLS |

### 1.2 Six-criteria comparison (scored 1–5, 5 = best)

| # | Criterion | Route A — WordPress / WooCommerce + Amelia/Bookly | Score | Route B — Next.js + Tailwind + Zustand/IndexedDB (→ Supabase) | Score |
|---|---|---|---|---|---|
| 1 | **Speed to a high-fidelity interactive demo** | Fast to a *generic* booking site, but every deviation (multi-step intake before checkout, card-to-card receipt upload, pending-verification state, coach manifests, super-admin audit queue) is a custom PHP plugin or paid add-on. Needs a paid host or a slow free host for the demo. Elementor page-by-page assembly is manual. | 3 | The entire app, seed data and mock flows are generated as one coherent TypeScript codebase. Rich mock data is a JSON seed. Every journey is code, not configuration. Deploys to a static CDN in minutes. | **5** |
| 2 | **Luxury aesthetic (Gordan Fitness / We Wellness)** | Achievable only by overriding Amelia/Bookly/Woo markup and CSS (their booking widgets are opinionated and hard to restyle to editorial minimalism). Glassmorphism, micro-interactions and typographic rhythm fight the theme. RTL in premium plugins is frequently partial. | 2 | Pixel-level control: design tokens, `logical` CSS properties for RTL, Framer Motion micro-interactions, editorial grid, image-led hero blocks. Nothing to override. | **5** |
| 3 | **Long-term maintenance & client content updates** | Strong for non-technical content editing (posts, pages, coach bios in ACF). Weak for logic: plugin update conflicts, PHP security patching, Woo + Amelia + calendar add-on version drift; Persian add-ons are small-maintainer projects. | 4 (content) / 2 (logic) | Content editing in the MVP is via typed seed files; Phase 3 adds Supabase tables or a headless CMS (Sanity/Payload free tiers) with an admin UI. Logic is versioned TypeScript with tests; dependency surface is small. | 3 (MVP) / 4 (Phase 3) |
| 4 | **Native Jalali calendar & multi-coach capacity logic** | Amelia/Bookly do not natively support the Jalali calendar in their pickers; add-ons convert display text but the underlying week/month grid stays Gregorian. Per-slot capacity exists but coach-specific capacity, package quota deduction, cutoff-based self-service rescheduling and quota refunds require hooking into plugin internals. | 2 | Calendar math is a pure TypeScript module (`jalaali-js`), grid rendered natively Shanbeh → Jomeh, Farvardin → Esfand. Capacity engine is a domain service with unit tests: coach capacity × slot × package quota × cutoff. | **5** |
| 5 | **Isolation & security of medical / financial data** | Health records would live as post meta / ACF fields in a shared `wp_postmeta` table; role isolation depends on plugin capability mapping; WordPress is the most attacked CMS surface on the web. | 2 | MVP: data partitioned by store, role-guarded route groups, isolated `/executive` admin, audit trail. Phase 3: Supabase Row-Level Security so the database itself enforces that only `super_admin` can read `health_assessments` and `transactions` — enforcement is server-side, not just UI. | 4 (MVP) / **5** (Phase 3) |
| 6 | **Zero-cost live demo** | Needs PHP + MySQL hosting. Free WordPress hosts inject ads, block plugins or are slow; Amelia/Bookly are paid licenses. | 1 | Static export to Cloudflare Pages / GitHub Pages: $0, global CDN, HTTPS, no server. | **5** |
| | **Total** | | **14–16 / 30** | | **27–29 / 30** |

### 1.3 Definitive recommendation — Route B

**Stack:** Next.js 15 (App Router, `output: 'export'`) · TypeScript 5 (strict) · Tailwind CSS v4 · Lucide React · Radix UI primitives (accessible dialogs, tabs, popovers, toasts) · Framer Motion · Zustand 5 with `persist` + IndexedDB adapter (`idb-keyval`) · `jalaali-js` + `date-fns-jalali` · Zod (form/schema validation) · React Hook Form · Vitest (domain-logic tests) · Playwright (smoke journeys).

**Engineering rationale**

1. **The demo *is* the product's UI layer.** Every screen, token and interaction built now is kept when the backend is added. Route A would be discarded or heavily rewritten to reach the target aesthetic.
2. **Domain logic must be testable.** Coach capacity, quota deduction, cutoff enforcement and quota refunds are business rules the client will scrutinize live. A pure TypeScript `scheduling` module with unit tests is the only way to guarantee "zero runtime errors" under stakeholder click-through.
3. **Repository pattern = zero-rewrite upgrade.** All data access goes through `repositories/*.ts` interfaces. Phase 2 ships `MockRepository` (IndexedDB). Phase 3 ships `SupabaseRepository` behind the same interface. The UI never changes.
4. **RTL is first-class, not retrofitted.** Tailwind v4 logical utilities (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`), `dir="rtl"` at `<html>`, and Radix primitives which honor `dir` — no `.rtl` override stylesheet.
5. **Static export keeps hosting at $0 and Iran-accessible.** No server functions are needed for a mock engine. Everything runs in the visitor's browser, so the client can demo on any device with just a link.

**Known trade-off (stated honestly):** with a static export there is no server-side role enforcement in the MVP — RBAC guards are client-side and the data is per-browser. This is acceptable for a mock-data prototype (there is no real PII) and is fully resolved in Phase 3 by Supabase Auth + RLS. The blueprint designs the guards so the switch is a one-line adapter change.

---

## Section 2 — Zero-Cost ($0) Live Deployment Strategy

### 2.1 Platform decision

| Platform | Free tier | Iran reachability (client demo) | Verdict |
|---|---|---|---|
| **Cloudflare Pages** | Unlimited sites, 500 builds/month, unlimited bandwidth, `*.pages.dev` HTTPS, custom domain | Generally reachable; Cloudflare edge is the most common CDN in front of Iranian sites | **Primary** |
| **GitHub Pages** | 1 GB, 100 GB/month, `*.github.io` HTTPS, custom domain | Reachable | **Fallback / mirror** (same build artifact) |
| Vercel Hobby | 100 GB bandwidth, previews, serverless | `*.vercel.app` intermittently unreachable from Iranian ISPs; Hobby is non-commercial only | Upgrade path once Supabase/server features are added; deploy behind a custom domain |
| Netlify | 100 GB, 300 build-minutes | Similar to Vercel | Not needed |

Both primary and fallback are driven by **one GitHub Actions workflow** that builds once and publishes to both targets, so the client always has two live links.

### 2.2 Build configuration

`next.config.ts`

```ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',            // pure static HTML/JS/CSS — no server required
  trailingSlash: true,         // /pricing/ → /pricing/index.html (GitHub Pages friendly)
  images: { unoptimized: true }, // next/image without the image-optimization server
  reactStrictMode: true,
  // basePath is only set for the GitHub Pages mirror (repo sub-path), injected by CI:
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
};
export default config;
```

**Cloudflare Pages settings**

| Setting | Value |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm ci && npm run build` |
| Build output directory | `out` |
| Node version | `NODE_VERSION=20` |
| Environment variables | `NEXT_PUBLIC_APP_ENV=demo`, `NEXT_PUBLIC_SEED_VERSION=1` |
| Production branch | `main` (preview deployments for every PR — free) |
| Custom domain (optional, $0 if client already owns one) | `demo.valisan.ir` → CNAME to `valisan.pages.dev` |

**GitHub Pages mirror** — Actions workflow `deploy.yml`: `actions/setup-node@v4` → `npm ci` → `NEXT_PUBLIC_BASE_PATH=/valisan npm run build` → `actions/upload-pages-artifact` (`out/`) → `actions/deploy-pages`. Add an empty `.nojekyll` to `out/` so `_next/` is served.

**Static-export routing rules** (enforced in Phase 2 code review):
- No `middleware.ts`, no Route Handlers, no Server Actions, no `dynamic = 'force-dynamic'`.
- Dynamic segments (`/coaches/[slug]`, `/blog/[slug]`) use `generateStaticParams()` over seed data.
- Portal pages (`/portal/**`, `/coach/**`, `/executive/**`) are client components wrapped in a `RoleGuard` that reads the mock session.

### 2.3 Mock data persistence (no backend, no bills)

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  ┌──────────────┐   persist()   ┌──────────────────────────┐ │
│  │ Zustand store│ ────────────▶ │ IndexedDB  (idb-keyval)  │ │
│  │  (in-memory) │ ◀──────────── │  db: "valisan-demo"      │ │
│  └──────┬───────┘   hydrate     │  key: "state@v{SEED}"    │ │
│         │                       └──────────────────────────┘ │
│  ┌──────▼───────┐                                            │
│  │ repositories │  Mock*Repository — same interface as the   │
│  │ (interfaces) │  future SupabaseRepository (Phase 3)       │
│  └──────┬───────┘                                            │
│  ┌──────▼───────┐                                            │
│  │ seed/*.json  │  first-run seed: coaches, packages, slots, │
│  │              │  bookings, blog, transactions, users       │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

- **Why IndexedDB over LocalStorage:** LocalStorage is capped at ~5 MB and is synchronous; receipt-image uploads (stored as `Blob`/data URL) and ~90 days of generated session slots comfortably exceed it. IndexedDB is asynchronous and effectively unlimited for demo purposes.
- **Seed versioning:** the persisted key includes `NEXT_PUBLIC_SEED_VERSION`. Bumping the version on deploy invalidates every client's stale demo state automatically — no "please clear your cache" instructions.
- **Reset control:** an unobtrusive "بازنشانی داده‌های نمایشی" (Reset demo data) action in the footer and in the super-admin suite wipes IndexedDB and re-seeds.
- **Deterministic clock:** the seed generator anchors "today" to the real date (Jalali) so upcoming/past sessions always look live, and reminders "2 hours before" are simulated by a client-side scheduler that checks bookings every 30 s against a mock clock (with a "fast-forward" control in the admin suite so the client can *see* reminders fire).
- **Cross-device note (documented for the client):** because state is per browser, a booking made on the client's phone will not appear on their laptop. This is expected in Phase 2 and disappears with Supabase in Phase 3. Supabase Free Tier (500 MB Postgres, 50k MAU auth, 1 GB storage) remains $0 for the pilot.

### 2.4 Client walkthrough guide (for the stakeholder demo)

The live URL opens on the public landing page. Demo accounts are shown on the login screen in a "حساب‌های نمایشی" (demo accounts) card — one tap fills the form.

| Role | Persian label | Phone (username) | Password | What to explore |
|---|---|---|---|---|
| Student | هنرجو | `09120000001` | `demo1234` | Dashboard, package quota, timeline, reschedule/cancel |
| Coach | مربی | `09120000002` | `demo1234` | Weekly schedule, attendee manifests, seat availability |
| Super-Admin | مدیر ارشد | `09120000009` | `admin1234` | Ledger, receipt audit queue, user & health records |

**Journey script (mobile or desktop, ~7 minutes):**

1. **Landing (صفحه اصلی)** — hero, modalities, coach roster, pricing teaser, testimonials, blog. Toggle Persian/Latin numerals from the header (۱۲۳ ⇄ 123).
2. **Pricing (عضویت و قیمت‌ها)** — choose an 8 / 12 / 16-session monthly package or a single session (جلسه تکی). Tap "شروع ثبت‌نام".
3. **Health & Lifestyle Intake (فرم ارزیابی سلامت)** — 6 conversational steps with progress bar and the confidentiality reassurance. Data is stored to the isolated health store.
4. **Coach & schedule selection (انتخاب مربی و زمان)** — Jalali calendar picker → weekly matrix → slot chips showing remaining seats (e.g. "۲ از ۴ صندلی باقی‌مانده").
5. **Checkout (پرداخت)** — Track A: "پرداخت آنلاین" opens the ZarinPal-style gateway simulator; choose *success* or *failure*. Track B: "کارت به کارت" shows the studio card number with copy-to-clipboard, enter a tracking number, drag-and-drop a screenshot → status **در انتظار تأیید** (Pending Verification).
6. **Student dashboard (پنل هنرجو)** — see trainer, remaining quota, timeline; tap an upcoming session → "جابه‌جایی" (reschedule) or "لغو" (cancel). Try one within 4 hours to see the cutoff rule block it.
7. **Notifications (اعلان‌ها)** — bell shows booking confirmation; a simulated SMS toast styled as a Kavenegar message appears bottom-start.
8. **Switch to Super-Admin** — `/executive` → approve or reject the pending card-to-card receipt with a reason; switch back to the student to receive the SMS toast + bell notification of the decision.
9. **Switch to Coach** — see the new attendee on the manifest and the updated seat count.

Mobile: open the link in Safari/Chrome; the UI is mobile-first. "Add to Home Screen" installs it as a PWA-style icon (web manifest included, no service worker required for the demo).

---

## Section 3 — Data Architecture & System Flow Diagrams

### 3.1 Entity relationship overview

```
 User 1───∞ Membership ∞───1 Package
  │             │
  │             └──∞ Booking ∞──1 SessionSlot ∞──1 Coach
  │                    │
  │                    └──0..1 Transaction
  │
  ├──1 HealthAssessment   (isolated store, super_admin read)
  ├──∞ Notification
  └──(role = coach) 1 Coach profile
```

### 3.2 TypeScript entity schema

```ts
// ─── Shared primitives ────────────────────────────────────────────────────────
export type ID = string;                       // nanoid / uuid
export type ISODateTime = string;              // '2026-09-25T10:30:00+03:30' (Asia/Tehran)
export type JalaliDate = `${number}/${number}/${number}`; // '1405/07/03'
export type Toman = number;                    // integer, IRT (تومان)

export type Role = 'student' | 'coach' | 'super_admin';
export type Locale = 'fa-IR';
export type NumeralSystem = 'persian' | 'latin';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: ID;
  role: Role;
  phone: string;                 // '09120000001' — login identifier (Iranian mobile)
  passwordHash: string;          // mock only; Phase 3 → Supabase Auth
  firstName: string;             // 'سارا'
  lastName: string;              // 'محمدی'
  avatarUrl?: string;
  birthDate?: JalaliDate;
  preferences: {
    numerals: NumeralSystem;     // Persian numerals toggle
    smsReminders: boolean;
    reminderLeadMinutes: 120;    // "2 hours before"
  };
  assignedCoachIds: ID[];        // student → coaches
  status: 'active' | 'suspended';
  createdAt: ISODateTime;
  lastLoginAt?: ISODateTime;
}

// ─── Coach ────────────────────────────────────────────────────────────────────
export type Modality =
  | 'pilates_reformer' | 'pilates_mat' | 'yoga_hatha' | 'yoga_vinyasa'
  | 'corrective' | 'postpartum' | 'mobility' | 'strength';

export interface Certification {
  title: string;                 // 'STOTT Pilates® Level 2'
  issuer: string;
  year: number;                  // Gregorian year of issue
}

export interface WeeklyAvailability {
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;   // 0 = شنبه (Saturday) … 6 = جمعه (Friday)
  windows: Array<{ start: string; end: string }>; // '09:00' – '13:00' (studio local time)
  slotMinutes: 60;                       // session length
}

export interface Coach {
  id: ID;
  userId: ID;                    // FK → User (role = 'coach')
  slug: string;                  // 'sara-mohammadi'
  displayName: string;           // 'سارا محمدی'
  title: string;                 // 'مربی ارشد پیلاتس'
  bio: string;                   // editorial paragraph
  modalities: Modality[];
  certifications: Certification[];
  studioHours: WeeklyAvailability[];
  capacity: {
    private: 1;                  // strict concurrent client limits per slot
    semiPrivate: 2 | 3 | 4;
    group: 5 | 6;
  };
  defaultSessionType: 'private' | 'semi_private' | 'group';
  photoUrl: string;
  rating: number;                // 4.9 (mock)
  isAcceptingNewClients: boolean;
}

// ─── Package ──────────────────────────────────────────────────────────────────
export type PackageKind = 'monthly_membership' | 'drop_in';

export interface Package {
  id: ID;
  slug: 'drop-in' | 'monthly-8' | 'monthly-12' | 'monthly-16';
  kind: PackageKind;
  title: string;                 // 'عضویت ماهانه ۱۲ جلسه'
  subtitle?: string;             // 'محبوب‌ترین انتخاب'
  sessionQuota: 1 | 8 | 12 | 16;
  validityDays: 1 | 30;          // drop-in valid for the booked day; memberships 30 days
  sessionType: 'private' | 'semi_private' | 'group';
  priceToman: Toman;             // e.g. 18_000_000
  compareAtToman?: Toman;        // strike-through price
  perks: string[];               // ['ارزیابی وضعیت بدنی رایگان', ...]
  isFeatured: boolean;
  isActive: boolean;
}

// ─── Membership (a purchased Package instance) ────────────────────────────────
export interface Membership {
  id: ID;
  userId: ID;
  packageId: ID;
  startsAt: ISODateTime;
  expiresAt: ISODateTime;
  quotaTotal: number;
  quotaUsed: number;             // confirmed + attended bookings
  quotaHeld: number;             // bookings awaiting payment verification
  status: 'pending_payment' | 'active' | 'expired' | 'exhausted' | 'cancelled';
  transactionId: ID;
}

// ─── SessionSlot ──────────────────────────────────────────────────────────────
export interface SessionSlot {
  id: ID;
  coachId: ID;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  jalaliDate: JalaliDate;        // denormalised for grid rendering, e.g. '1405/07/05'
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  sessionType: 'private' | 'semi_private' | 'group';
  modality: Modality;
  capacity: number;              // copied from Coach.capacity at generation time
  bookedCount: number;           // derived cache, recomputed by the engine
  status: 'open' | 'full' | 'cancelled' | 'past';
  room?: 'Reformer Studio' | 'Mat Studio' | 'Yoga Loft';
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export type BookingStatus =
  | 'pending_verification'       // card-to-card receipt awaiting admin review
  | 'confirmed'
  | 'attended'
  | 'no_show'
  | 'cancelled_by_student'
  | 'cancelled_by_studio'
  | 'rescheduled';               // terminal state of the *original* booking

export interface Booking {
  id: ID;
  userId: ID;
  membershipId: ID;
  slotId: ID;
  coachId: ID;
  status: BookingStatus;
  bookedAt: ISODateTime;
  cutoffAt: ISODateTime;         // slot.startsAt − StudioSettings.modificationCutoffHours
  rescheduledFromBookingId?: ID;
  rescheduledToBookingId?: ID;
  cancellationReason?: string;
  attendance?: { checkedInAt: ISODateTime; byCoachId: ID };
  reminders: { sent2hBefore: boolean; sentConfirmation: boolean };
}

// ─── HealthAssessment (isolated store) ────────────────────────────────────────
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'athlete';
export type Goal = 'hypertrophy' | 'mobility' | 'posture' | 'postpartum_recovery' | 'fat_loss' | 'stress_relief';

export interface HealthAssessment {
  id: ID;
  userId: ID;                    // FK → User; read access: owner (write-once) + super_admin
  submittedAt: ISODateTime;
  version: 1;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  cardioMetabolic: {
    hypertension: boolean;
    diabetes: boolean;
    heartCondition: boolean;
    thyroid: boolean;
    notes?: string;
  };
  injuries: Array<{ area: 'neck' | 'shoulder' | 'lower_back' | 'hip' | 'knee' | 'ankle' | 'wrist' | 'other'; description: string; year?: number }>;
  jointLimitations: string[];    // ['محدودیت چرخش گردن']
  pregnancy: { isPregnant: boolean; isPostpartum: boolean; weeksPostpartum?: number };
  lifestyle: {
    sleepHours: number;
    activityDaysPerWeek: number;
    deskHoursPerDay: number;
    stressLevel: 1 | 2 | 3 | 4 | 5;
    smoking: boolean;
    diet: 'balanced' | 'low_carb' | 'vegetarian' | 'vegan' | 'other';
  };
  consent: {
    confidentialityAccepted: true;   // must be true to submit
    acceptedAt: ISODateTime;
    textVersion: 'v1';               // reassurance copy version shown to the user
  };
  reviewedBy?: { adminId: ID; at: ISODateTime; recommendedCoachId?: ID; recommendedLevel?: FitnessLevel };
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export type PaymentTrack = 'ipg' | 'card_to_card';
export type TransactionStatus =
  | 'initiated' | 'succeeded' | 'failed'           // IPG
  | 'pending_verification' | 'approved' | 'rejected' // card-to-card
  | 'refunded';

export interface Transaction {
  id: ID;
  userId: ID;
  membershipId: ID;
  packageId: ID;
  amountToman: Toman;
  track: PaymentTrack;
  status: TransactionStatus;
  createdAt: ISODateTime;
  settledAt?: ISODateTime;
  ipg?: {
    provider: 'zarinpal' | 'shepa';
    authority: string;           // 'A0000000000000000000000000000123456789' (mock)
    refId?: string;              // gateway reference on success
    cardPanMasked?: string;      // '6037-99**-****-1234'
    failureCode?: 'user_cancelled' | 'insufficient_funds' | 'gateway_timeout';
  };
  cardToCard?: {
    studioCard: { bank: 'ملت' | 'سامان'; pan: string; iban: string; holder: string };
    trackingNumber: string;      // شماره پیگیری entered by the student
    receiptImage?: { name: string; dataUrl: string; sizeKb: number };
    submittedAt: ISODateTime;
    review?: { adminId: ID; at: ISODateTime; decision: 'approved' | 'rejected'; reason?: string };
  };
  audit: Array<{ at: ISODateTime; by: ID | 'system'; from: TransactionStatus; to: TransactionStatus }>;
}

// ─── Notification (in-app bell + simulated SMS) ───────────────────────────────
export type NotificationKind =
  | 'booking_confirmed' | 'class_reminder_2h' | 'reschedule_confirmed' | 'cancellation_confirmed'
  | 'payment_pending' | 'payment_approved' | 'payment_rejected' | 'membership_expiring';

export interface Notification {
  id: ID;
  userId: ID;
  kind: NotificationKind;
  channel: 'in_app' | 'sms';
  smsProvider?: 'kavenegar' | 'farazsms';
  title: string;
  body: string;                  // Persian, pre-rendered from a template
  createdAt: ISODateTime;
  readAt?: ISODateTime;
  deepLink?: string;             // '/portal/bookings/bk_123'
}

// ─── StudioSettings (single document) ─────────────────────────────────────────
export interface StudioSettings {
  modificationCutoffHours: 4;    // configurable — enforced by the scheduling engine
  timezone: 'Asia/Tehran';
  weekStartsOn: 0;               // شنبه
  weekend: [6];                  // جمعه closed by default
  currency: 'IRT';
  studioCard: { bank: 'ملت' | 'سامان'; pan: string; iban: string; holder: string }; // shown on the card-to-card screen
  smsSenderName: 'VALISAN';
}
```

### 3.3 Scheduling & capacity engine — rules (pure functions, unit-tested)

| Rule | Definition |
|---|---|
| **Slot generation** | For each coach, for each day in the next 60 days, expand `studioHours[weekday].windows` into `slotMinutes` slots; skip `weekend` and studio holidays; `capacity = coach.capacity[sessionType]`. |
| **Availability** | `remaining = slot.capacity − count(bookings where slotId = slot.id and status ∈ {confirmed, pending_verification, attended})`. Slot is `full` when `remaining = 0`. |
| **Book** | Preconditions: membership `active` (or `pending_payment` for card-to-card, which *holds* quota), `quotaUsed + quotaHeld < quotaTotal`, slot `open`, `slot.startsAt` within `membership.expiresAt`, student has no other booking overlapping the slot time. Effect: create booking, increment `bookedCount`, hold or use quota. |
| **Cutoff** | `canModify(booking, now) = now < booking.cutoffAt` where `cutoffAt = slot.startsAt − settings.modificationCutoffHours`. UI disables the action and shows the exact deadline in Jalali ("تا ساعت ۰۸:۳۰ شنبه ۵ مهر"). |
| **Cancel** | If `canModify`: status → `cancelled_by_student`, quota refunded (`quotaUsed−1`), seat released. If past cutoff: blocked (UI explains the rule). |
| **Reschedule** | Atomic: validate target slot via **Book** preconditions, then original → `rescheduled` (linked by `rescheduledToBookingId`), new booking `confirmed`; quota unchanged; both seat counts updated. Fails without side effects if the target is full. |
| **Card-to-card approval** | Admin *approve*: transaction → `approved`, membership → `active`, held bookings → `confirmed`, `quotaHeld → quotaUsed`. Admin *reject*: transaction → `rejected` (reason required), membership → `cancelled`, held bookings → `cancelled_by_studio`, seats released. Both emit notifications. |
| **Reminder** | Client-side scheduler emits `class_reminder_2h` once per booking when `now ≥ slot.startsAt − 120 min`. |

### 3.4 RBAC matrix (client-side guards now; Supabase RLS policies in Phase 3 use the same table)

| Resource | student | coach | super_admin |
|---|---|---|---|
| Public content (pages, blog, coaches, pricing) | R | R | R |
| Own User profile | R/W | R/W | R/W |
| All Users | — | R (assigned clients only, non-sensitive fields) | R/W |
| Own Bookings | R/W (cutoff-bound) | — | R/W |
| Bookings on own slots | — | R + attendance write | R/W |
| SessionSlots | R (availability only) | R/W (own) | R/W |
| Memberships | R (own) | R (assigned clients: quota only) | R/W |
| **HealthAssessment** | W once + R own | **—** (sees only the admin's `recommendedLevel`) | R/W + review |
| **Transactions / ledger** | R own (status only) | — | R/W + approve/reject |
| StudioSettings | — | R | R/W |

Route groups: `(public)`, `(student)/portal`, `(coach)/coach`, `(admin)/executive`. The admin group is **not linked from any public navigation**; `RoleGuard` redirects unauthenticated or under-privileged sessions to `/login?next=…` and logs the attempt to the audit store.

### 3.5 User journey flowchart

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  PUBLIC                                                                              │
│                                                                                      │
│  [Landing /]                                                                         │
│    hero · modalities · coach roster · pricing teaser · testimonials · blog · CTA     │
│         │                                                                            │
│         ▼                                                                            │
│  [Pricing /pricing]  ── select ──▶  Drop-in (1)  |  Monthly 8  |  Monthly 12  |  16  │
│         │                                                                            │
│         ▼  "شروع ثبت‌نام"                                                             │
│  [Auth /login or /register]  (phone + OTP simulator; demo accounts one-tap)          │
│         │                                                                            │
└─────────┼────────────────────────────────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  ONBOARDING FUNNEL  /join/[packageSlug]/…                                            │
│                                                                                      │
│  Step 1  [Health & Lifestyle Intake]  /join/…/assessment                             │
│           ┌────────────────────────────────────────────────────────────────┐        │
│           │ 1 سطح تجربه  → 2 اهداف  → 3 سابقه قلبی/متابولیک  →              │        │
│           │ 4 آسیب‌ها و محدودیت مفاصل → 5 سبک زندگی → 6 تأیید محرمانگی       │        │
│           └────────────────────────────────────────────────────────────────┘        │
│           (skipped if a HealthAssessment already exists; editable from portal)       │
│         │                                                                            │
│         ▼                                                                            │
│  Step 2  [Coach & Slot Selection]  /join/…/schedule                                  │
│           Jalali month picker ──▶ weekly matrix (شنبه…جمعه) ──▶ slot chips           │
│           each chip: time · modality · "۲ از ۴ صندلی" · disabled when full/past      │
│           Drop-in: pick 1 slot.  Membership: pick first slot now, rest from portal.  │
│         │                                                                            │
│         ▼                                                                            │
│  Step 3  [Checkout]  /join/…/checkout        summary · price · terms                 │
│         │                                                                            │
│         ├──── Track A: پرداخت آنلاین (IPG) ──────────────────────────────────┐       │
│         │      [Gateway simulator /pay/ipg/[authority]]                      │       │
│         │        ZarinPal-styled page · masked card · "پرداخت" / "انصراف"    │       │
│         │        ┌── success ──▶ refId generated ─▶ Transaction.succeeded    │       │
│         │        │               Membership.active · Booking.confirmed       │       │
│         │        └── failure ──▶ failureCode ─▶ [Retry | Switch to Track B]  │       │
│         │                                                                    │       │
│         └──── Track B: کارت به کارت ─────────────────────────────────────────┤       │
│                [Manual transfer /pay/card]                                   │       │
│                  studio card (copy) · IBAN (copy) · amount (copy)            │       │
│                  tracking-number input · drag-and-drop receipt image         │       │
│                  ──▶ Transaction.pending_verification                        │       │
│                      Membership.pending_payment · Booking.pending_verification│      │
│                      quota HELD · seat HELD                                  │       │
│                                                                              ▼       │
│  [Confirmation /join/…/done]  ← bell + SMS toast (booking_confirmed | payment_pending)│
└──────────────────────────────────────────────────────────────────────────────────────┘
          ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STUDENT DASHBOARD  /portal                                                          │
│                                                                                      │
│  ▸ assigned coach card   ▸ package validity ring + "۹ از ۱۲ جلسه باقی‌مانده"          │
│  ▸ timeline: past (attended / no-show) ─ today ─ upcoming (confirmed / pending)      │
│  ▸ book next session (membership) → reuses Step 2 picker                            │
│  ▸ notifications bell                                                                │
│         │                                                                            │
│         ▼  tap upcoming booking                                                      │
│  [Booking detail]                                                                    │
│     now < cutoffAt ?                                                                 │
│       ├── YES ─▶ [جابه‌جایی]  ─▶ picker (target slots) ─▶ confirm ─▶ new booking     │
│       │                              original → rescheduled · seats updated          │
│       │                              bell + SMS "reschedule_confirmed"               │
│       │          [لغو]      ─▶ confirm dialog ─▶ cancelled_by_student · quota +1      │
│       └── NO  ─▶ actions disabled + rule copy:                                       │
│                  "مهلت تغییر این جلسه (۴ ساعت قبل از شروع) به پایان رسیده است."        │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐   ┌───────────────────────────────────────────────────┐
│  COACH PORTAL  /coach        │   │  SUPER-ADMIN SUITE  /executive  (unlinked, guarded)│
│  ▸ today / week schedule     │   │  ▸ KPI: revenue (day/week/month), active members  │
│  ▸ per-slot manifest         │   │  ▸ ledger table: filter by track/status           │
│    (names, level, seat n/N)  │   │  ▸ receipt audit queue: image · tracking no.      │
│  ▸ mark attended / no-show   │   │      [✓ تأیید]  [✗ رد + دلیل]  → notifications     │
│  ▸ assigned clients list     │   │  ▸ users DB · health records (read + review)      │
└──────────────────────────────┘   │  ▸ audit log · settings (cutoff hours, capacity)  │
                                   │  ▸ demo tools: fast-forward clock · reset seed    │
                                   └───────────────────────────────────────────────────┘
```

### 3.6 Mock notification pipeline

```
domain event ─▶ notificationService.emit(kind, userId, payload)
                   ├─▶ Notification{channel:'in_app'}  → bell badge + drawer
                   └─▶ Notification{channel:'sms'}     → SmsToast (Kavenegar-styled bubble,
                                                         sender "VALISAN", 4 s, bottom-start)
```

SMS template examples (Persian, documented for the client):

| Kind | Template |
|---|---|
| `booking_confirmed` | `والیسان: رزرو شما برای {weekday} {jalaliDate} ساعت {time} با {coach} تأیید شد. لغو/جابه‌جایی تا {cutoffHours} ساعت قبل.` |
| `class_reminder_2h` | `والیسان: یادآوری؛ جلسه شما امروز ساعت {time} با {coach} برگزار می‌شود. منتظرتان هستیم.` |
| `reschedule_confirmed` | `والیسان: جلسه شما به {weekday} {jalaliDate} ساعت {time} منتقل شد.` |
| `payment_approved` | `والیسان: پرداخت کارت‌به‌کارت شما تأیید شد. عضویت شما فعال است.` |
| `payment_rejected` | `والیسان: پرداخت شما تأیید نشد. دلیل: {reason}. لطفاً با استودیو تماس بگیرید.` |

---

## Section 4 — Luxury Design System Specifications (Tokens)

### 4.1 Color tokens

All values verified for the ivory background `#FCFBF7`. Text tokens meet WCAG AA at their intended sizes.

| Token | Role | HEX | HSL | Usage |
|---|---|---|---|---|
| `--color-brand-50` | Blush wash | `#F9EBEA` | `hsl(4, 56%, 95%)` | Section backgrounds, hover fills, selected calendar cells |
| `--color-brand-100` | Powder pink | `#F5D5D8` | `hsl(354, 62%, 90%)` | Chips, badges, soft borders on brand surfaces |
| `--color-brand-300` | Rose | `#E8A598` | `hsl(10, 64%, 75%)` | Primary brand signature: accents, progress, focus rings, icons |
| `--color-brand-500` | Rose deep | `#C77B6D` | `hsl(9, 45%, 60%)` | Secondary buttons, active states, large headings on ivory |
| `--color-brand-700` | Rose ink | `#A8574B` | `hsl(8, 38%, 48%)` | Links, small brand text on ivory (AA 4.9:1) |
| `--color-gold-400` | Satin gold | `#C9A96E` | `hsl(39, 46%, 61%)` | Premium touches: dividers, "featured" ribbon, star ratings, thin frame lines |
| `--color-gold-600` | Muted brass | `#B08D57` | `hsl(36, 36%, 52%)` | Gold text on ivory, hover on gold accents |
| `--color-bg` | Ivory | `#FCFBF7` | `hsl(48, 45%, 98%)` | Page background |
| `--color-surface` | White | `#FFFFFF` | `hsl(0, 0%, 100%)` | Cards, sheets, inputs |
| `--color-surface-2` | Warm sand | `#F7F3EE` | `hsl(33, 36%, 95%)` | Alternating sections, table headers, calendar header |
| `--color-surface-glass` | Glass | `rgba(255,255,255,0.62)` + `backdrop-blur(16px)` | — | Sticky header, floating booking summary, SMS toast |
| `--color-border` | Border | `#EDE6E0` | `hsl(28, 27%, 90%)` | Default 1px borders |
| `--color-border-strong` | Border strong | `#DCD3CB` | `hsl(28, 20%, 83%)` | Inputs at rest, table rules |
| `--color-text` | Charcoal | `#1E1E1E` | `hsl(0, 0%, 12%)` | Body & headings (16.5:1) |
| `--color-text-2` | Secondary | `#5C544E` | `hsl(26, 8%, 33%)` | Supporting copy (8.4:1) |
| `--color-text-muted` | Warm neutral | `#8C827A` | `hsl(27, 7%, 51%)` | Captions, placeholders, metadata (4.6:1 — AA at ≥ 13px) |
| `--color-text-on-brand` | Ivory on rose | `#FCFBF7` | — | Text on `brand-500`/`brand-700`/charcoal buttons |
| `--color-success` | Sage | `#6E9A7A` | `hsl(136, 18%, 52%)` | Confirmed, approved, attended |
| `--color-warning` | Amber | `#D9A441` | `hsl(39, 67%, 55%)` | Pending verification, expiring soon, low seats |
| `--color-danger` | Terracotta | `#C2554B` | `hsl(5, 49%, 53%)` | Rejected, cancelled, no-show, validation errors |
| `--color-info` | Charcoal-soft | `#5C544E` | `hsl(26, 8%, 33%)` | Neutral system notices |

**Primary CTA rule:** primary buttons are **charcoal `#1E1E1E` with ivory text**, pink is never used as a full-width primary button fill (contrast and luxury restraint). Rose `brand-300/500` is reserved for accents, secondary buttons, and selection states. Gold appears only as hairlines and small marks, never as fills wider than 4 px.

**Shadows & glass**

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(30,30,30,0.04), 0 1px 1px rgba(30,30,30,0.03)` |
| `--shadow-md` | `0 8px 24px -12px rgba(30,30,30,0.12)` |
| `--shadow-lg` | `0 24px 48px -24px rgba(30,30,30,0.18)` |
| `--shadow-brand` | `0 12px 32px -12px rgba(232,165,152,0.45)` (hover on selected slot / featured package) |
| `--glass` | `background: var(--color-surface-glass); backdrop-filter: blur(16px) saturate(140%); border: 1px solid rgba(255,255,255,0.6)` |

### 4.2 Typography

**Font stack**

| Token | Family | Source | Role |
|---|---|---|---|
| `--font-fa` | **Vazirmatn** (variable, wght 100–900) | self-hosted `/public/fonts/Vazirmatn[wght].woff2` (OFL) | All Persian UI and body copy |
| `--font-fa-display` | Vazirmatn wght 300 with `letter-spacing: -0.01em` | same file | Display headings (editorial lightness; matches WeWellness restraint) |
| `--font-latin` | **Cormorant Garamond** 400/500/600 italic | self-hosted (OFL) | "VALISAN" wordmark, Latin taglines (PILATES · YOGA · WELLNESS), decorative section numerals |
| `--font-mono` | JetBrains Mono / ui-monospace | system | Transaction IDs, card numbers, tracking numbers |

Fallback chain: `'Vazirmatn', 'Shabnam', 'Segoe UI', Tahoma, sans-serif`. Fonts are preloaded via `<link rel="preload" as="font" crossorigin>` and `font-display: swap`.

**Pairing rules**
1. Persian and Latin are never mixed inside one heading; the Latin wordmark sits on its own line or as a small caps eyebrow.
2. Numerals inherit the surrounding font. Persian numerals are produced by string conversion (not `font-feature-settings`) so the toggle is reliable across fonts.
3. Body Persian is never bolder than 500; emphasis is achieved by weight 500 + `color-text`, not bold.
4. Prices use tabular alignment via `font-variant-numeric: tabular-nums` (Vazirmatn supports it) with the unit "تومان" at weight 400 muted.

**Type scale (mobile → desktop, `clamp()`)**

| Token | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| `display` | 40 → 64 px | 1.15 | 300 | Hero headline |
| `h1` | 32 → 44 px | 1.25 | 300 | Page titles |
| `h2` | 26 → 32 px | 1.3 | 400 | Section titles |
| `h3` | 22 → 24 px | 1.4 | 500 | Card titles, step titles |
| `h4` | 18 → 20 px | 1.5 | 500 | Sub-headings, coach names |
| `body-lg` | 17 → 18 px | 1.9 | 400 | Editorial paragraphs, blog |
| `body` | 15 → 16 px | 1.8 | 400 | Default UI copy (Persian needs ≥1.75 for diacritic clearance) |
| `small` | 13 → 14 px | 1.7 | 400 | Meta, captions, table cells |
| `caption` | 12 px | 1.6 | 500 | Badges, eyebrows (`letter-spacing: 0.06em` for Latin only) |
| `eyebrow-latin` | 11 → 12 px | 1 | 500 caps | "PILATES · YOGA · WELLNESS" |

Paragraph measure: max `68ch` for editorial content, `52ch` for forms.

### 4.3 Spacing, radius, motion

| Category | Tokens |
|---|---|
| Spacing scale | 4-pt base: `1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64, 20=80, 24=96, 32=128` px. Sections use 80–128 px vertical rhythm on desktop, 48–64 px on mobile. |
| Radius | `--radius-xs: 6px` (chips), `--radius-sm: 10px` (inputs, buttons), `--radius-md: 14px` (cards), `--radius-lg: 20px` (sheets, modals), `--radius-xl: 28px` (hero image masks), `--radius-pill: 999px` (tags, slot chips). Never mix more than two radii in one component. |
| Borders | 1 px `--color-border` by default; `--color-gold-400` at 1 px for "featured"/premium framing only. |
| Motion | `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`; durations `fast 150ms`, `base 240ms`, `slow 420ms`. Page transitions: 12 px fade-up. Hover: `translateY(-2px)` + shadow-md. Respect `prefers-reduced-motion`. |
| Layout | Container `max-w: 1200px`, gutters 16 px (mobile) / 32 px (tablet) / 48 px (desktop). Grid: 4 / 8 / 12 columns. Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. |
| RTL | `dir="rtl"` on `<html>`; only logical properties (`padding-inline-start`, `inset-inline-end`); icons with direction (chevrons, arrows) are mirrored via `rtl:rotate-180`. |

### 4.4 Component state guidelines

#### Calendar cells (Jalali month picker & weekly matrix)

| State | Persian label / hint | Visual |
|---|---|---|
| Default (available day) | — | Surface white, text charcoal, 1 px border transparent; hover → `brand-50` fill |
| Today | «امروز» | Ivory fill, 1 px `gold-400` ring, small gold dot beneath the number |
| Selected | — | `brand-300` fill, charcoal text, `shadow-brand`; adjacent range days `brand-50` |
| Has booking (student) | dot + tooltip «رزرو شده» | Sage dot under the numeral |
| Low seats (slot chip) | «۱ صندلی باقی‌مانده» | Amber hairline border, amber text for count |
| Full | «تکمیل» | `surface-2` fill, `text-muted`, strikethrough time, `cursor: not-allowed` |
| Past / before today | — | `text-muted` at 50 % opacity, non-interactive |
| Past cutoff (for reschedule targets) | «خارج از مهلت» | Same as Full + lock icon (Lucide `lock`) |
| Weekend / closed (جمعه) | «تعطیل» | Diagonal hatch in `border` color at 40 % |
| Holiday (official) | name of holiday on hover | Rose-ink numeral, no fill |
| Focus (keyboard) | — | 2 px `brand-300` outline, offset 2 px |

Weekday header order (always): **ش · ی · د · س · چ · پ · ج** (شنبه → جمعه). Month navigation uses `chevron-right` for *previous* and `chevron-left` for *next* in RTL.

#### Booking cards

| State | Badge (Persian) | Card styling |
|---|---|---|
| Upcoming · confirmed | «تأیید شده» sage | White, border, actions «جابه‌جایی» / «لغو» enabled; countdown to cutoff in `small` muted |
| Upcoming · pending verification | «در انتظار تأیید پرداخت» amber | Amber hairline start-border (4 px), actions disabled, link to payment status |
| Upcoming · locked (past cutoff) | «قفل شده» muted | Actions disabled with lock icon and rule copy |
| Today | «امروز» gold | Gold 1 px frame, subtle glass background, «مسیر استودیو» quick link |
| Past · attended | «حضور» sage | `surface-2`, 80 % opacity, check icon |
| Past · no-show | «غیبت» danger | `surface-2`, danger dot |
| Cancelled | «لغو شده» muted | Strikethrough title, `text-muted` |
| Rescheduled (original) | «منتقل شده» info | Collapsed row with link «به جلسه جدید» |
| Hover | — | `translateY(-2px)`, `shadow-md` |
| Skeleton | — | Shimmer on `surface-2` (never spinners for lists) |

#### Intake form (multi-step, conversational)

| Element | States |
|---|---|
| Stepper | 6 steps as thin segmented bar; **done** = `brand-300`, **current** = charcoal with gold dot, **upcoming** = `border-strong`. Step title reads «گام ۲ از ۶ · اهداف شما». |
| Question card | One question per screen; `h3` question, `body` helper; enters with fade-up 240 ms; previous answer chip shown above («سطح: مبتدی ✎»). |
| Choice chips (single/multi) | rest: white + border; hover: `brand-50`; selected: `brand-100` fill + `brand-700` text + check icon; focus: 2 px ring; disabled: `surface-2`. |
| Toggle (yes/no medical items) | Radix Switch: off `border-strong`, on `brand-300`; with «بله / خیر» labels inline-start. |
| Text/Number input | rest `border-strong`; focus `brand-300` ring; error `danger` border + message «لطفاً این مورد را تکمیل کنید»; success (validated) subtle sage check. |
| Reassurance banner | Persistent on every step, glass card with `shield-check` icon in gold: **«اطلاعات وضعیت سلامت شما صرفاً جهت شخصی‌سازی تمرینات و انتخاب بهترین مربی و سطح کلاس توسط کادر تخصصی بررسی می‌شود و کاملاً محرمانه خواهد بود.»** |
| Consent step | Required checkbox «مطالعه کردم و می‌پذیرم»; submit disabled until checked; submit button charcoal «ثبت و ادامه». |
| Navigation | «مرحله قبل» ghost (start side), «ادامه» charcoal (end side); autosaves each step to the isolated store so refresh does not lose progress. |
| Completion | Confetti-free: a serene checkmark animation + «سپاس؛ ارزیابی شما ثبت شد» then auto-advance to schedule selection. |

#### Buttons (global)

| Variant | Rest | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary | charcoal / ivory text | `#2A2A2A` + shadow-md | `#141414` | 40 % opacity |
| Secondary | `brand-100` fill / `brand-700` text | `brand-300` fill / charcoal | `brand-500` | 40 % |
| Ghost | transparent / charcoal | `brand-50` | `brand-100` | 40 % |
| Gold hairline | transparent / charcoal, 1 px `gold-400` | `gold-400` at 10 % fill | — | 40 % |
| Destructive | transparent / danger, 1 px danger | danger 8 % fill | — | 40 % |

Height 44 px (mobile tap target), 40 px desktop; radius `--radius-sm`; icon size 18 px with 8 px gap; loading state replaces label with a 3-dot pulse, width preserved.

---

## Appendix A — Persian UI String Dictionary

| Key | Persian | English |
|---|---|---|
| `nav.home` | صفحه اصلی | Home |
| `nav.about` | درباره استودیو | About the Studio |
| `nav.coaches` | مربیان | Coaches |
| `nav.classes` | کلاس‌ها | Class Modalities |
| `nav.pricing` | عضویت و قیمت‌ها | Pricing & Memberships |
| `nav.blog` | مجله سلامت | Wellness Journal |
| `nav.faq` | پرسش‌های متداول | FAQ |
| `nav.contact` | تماس و آدرس | Contact & Location |
| `cta.join` | شروع ثبت‌نام | Start enrollment |
| `cta.book` | رزرو جلسه | Book a session |
| `auth.login` | ورود | Log in |
| `auth.phone` | شماره موبایل | Mobile number |
| `auth.otp` | کد تأیید | Verification code |
| `role.student` | هنرجو | Student |
| `role.coach` | مربی | Coach |
| `role.admin` | مدیر ارشد | Super-Admin |
| `pkg.dropIn` | جلسه تکی | Single session |
| `pkg.monthly8` | عضویت ماهانه ۸ جلسه | Monthly · 8 sessions |
| `pkg.monthly12` | عضویت ماهانه ۱۲ جلسه | Monthly · 12 sessions |
| `pkg.monthly16` | عضویت ماهانه ۱۶ جلسه | Monthly · 16 sessions |
| `pkg.remaining` | {n} از {total} جلسه باقی‌مانده | {n} of {total} sessions left |
| `slot.seats` | {n} از {cap} صندلی باقی‌مانده | {n} of {cap} seats left |
| `slot.full` | تکمیل ظرفیت | Full |
| `session.private` | خصوصی | Private |
| `session.semiPrivate` | نیمه‌خصوصی | Semi-private |
| `session.group` | گروهی | Group |
| `booking.reschedule` | جابه‌جایی جلسه | Reschedule |
| `booking.cancel` | لغو جلسه | Cancel |
| `booking.cutoffRule` | تغییر یا لغو جلسه تا {h} ساعت قبل از شروع امکان‌پذیر است. | Changes allowed up to {h} hours before start. |
| `booking.cutoffPassed` | مهلت تغییر این جلسه به پایان رسیده است. | The modification window for this session has closed. |
| `status.confirmed` | تأیید شده | Confirmed |
| `status.pendingVerification` | در انتظار تأیید | Pending verification |
| `status.attended` | حضور | Attended |
| `status.noShow` | غیبت | No-show |
| `status.cancelled` | لغو شده | Cancelled |
| `status.rescheduled` | منتقل شده | Rescheduled |
| `pay.title` | پرداخت | Checkout |
| `pay.ipg` | پرداخت آنلاین (درگاه بانکی) | Online payment (IPG) |
| `pay.card` | کارت به کارت | Card-to-card |
| `pay.cardNumber` | شماره کارت | Card number |
| `pay.iban` | شماره شبا | IBAN |
| `pay.copy` | کپی شد | Copied |
| `pay.tracking` | شماره پیگیری | Tracking number |
| `pay.upload` | تصویر رسید را اینجا رها کنید یا انتخاب کنید | Drop or choose the receipt image |
| `pay.success` | پرداخت با موفقیت انجام شد | Payment successful |
| `pay.failed` | پرداخت ناموفق بود | Payment failed |
| `pay.refId` | شماره پیگیری بانک | Bank reference |
| `admin.ledger` | دفتر مالی | Financial ledger |
| `admin.queue` | صف بررسی رسیدها | Receipt audit queue |
| `admin.approve` | تأیید | Approve |
| `admin.reject` | رد | Reject |
| `admin.rejectReason` | دلیل رد | Rejection reason |
| `admin.users` | کاربران | Users |
| `admin.health` | پرونده‌های سلامت | Health records |
| `intake.title` | فرم ارزیابی سلامت و سبک زندگی | Health & Lifestyle Assessment |
| `intake.reassurance` | اطلاعات وضعیت سلامت شما صرفاً جهت شخصی‌سازی تمرینات و انتخاب بهترین مربی و سطح کلاس توسط کادر تخصصی بررسی می‌شود و کاملاً محرمانه خواهد بود. | Confidentiality reassurance |
| `intake.level` | سطح تجربه تمرینی | Fitness experience level |
| `intake.goals` | هدف اصلی شما | Primary goals |
| `goal.hypertrophy` | افزایش حجم و قدرت عضلانی | Hypertrophy |
| `goal.mobility` | انعطاف و دامنه حرکتی | Mobility |
| `goal.posture` | اصلاح وضعیت بدنی | Posture |
| `goal.postpartum` | بازتوانی پس از زایمان | Postpartum recovery |
| `goal.fatLoss` | کاهش چربی | Fat loss |
| `intake.cardio` | سابقه قلبی‌عروقی و متابولیک | Cardiovascular / metabolic history |
| `intake.injuries` | آسیب‌های قبلی | Previous injuries |
| `intake.joints` | محدودیت مفاصل | Joint limitations |
| `intake.lifestyle` | عادت‌های سبک زندگی | Lifestyle habits |
| `notif.bell` | اعلان‌ها | Notifications |
| `notif.sms` | پیامک | SMS |
| `numerals.toggle` | اعداد فارسی | Persian numerals |
| `demo.reset` | بازنشانی داده‌های نمایشی | Reset demo data |
| `blog.cat.nutrition` | تغذیه | Nutrition |
| `blog.cat.corrective` | حرکات اصلاحی | Corrective Exercise |
| `blog.cat.mindfulness` | ذهن‌آگاهی | Mindfulness |
| `blog.cat.recovery` | ریکاوری | Recovery |

**Calendar vocabulary**

| | |
|---|---|
| Weekdays (index 0–6) | شنبه، یکشنبه، دوشنبه، سه‌شنبه، چهارشنبه، پنجشنبه، جمعه |
| Short | ش، ی، د، س، چ، پ، ج |
| Months (1–12) | فروردین، اردیبهشت، خرداد، تیر، مرداد، شهریور، مهر، آبان، آذر، دی، بهمن، اسفند |
| Date format (long) | `جمعه ۳ مهر ۱۴۰۵` |
| Date format (numeric) | `۱۴۰۵/۰۷/۰۳` |
| Time | `۱۰:۳۰` (24-hour) |
| Currency | `۱۸٬۰۰۰٬۰۰۰ تومان` (Persian thousands separator U+066C when Persian numerals are on) |

---

## Appendix B — Phase 2 Repository Layout Preview

```
valisan/
├── app/
│   ├── (public)/            # /, about, coaches/[slug], classes, pricing, blog/[slug], faq, contact, login
│   ├── (funnel)/join/[packageSlug]/{assessment,schedule,checkout,done}/
│   ├── (funnel)/pay/{ipg/[authority],card}/
│   ├── (student)/portal/{bookings/[id],membership,profile,notifications}/
│   ├── (coach)/coach/{schedule,clients,slots/[id]}/
│   ├── (admin)/executive/{ledger,queue,users,health/[userId],settings,audit}/
│   ├── layout.tsx           # <html lang="fa-IR" dir="rtl">, fonts, providers
│   └── globals.css          # Tailwind v4 @theme tokens (Section 4)
├── components/{ui,layout,calendar,booking,intake,payment,admin,marketing}/
├── domain/
│   ├── scheduling/          # capacity engine, cutoff rules (pure TS + Vitest)
│   ├── payments/            # IPG simulator, card-to-card state machine
│   ├── notifications/       # templates + emitter
│   └── jalali/              # conversion, formatting, numerals
├── data/
│   ├── repositories/        # interfaces + MockRepository (IndexedDB)
│   ├── store/               # Zustand slices: session, catalog, bookings, ledger, health, notifications
│   └── seed/                # coaches.json, packages.json, users.json, blog/*.mdx, generateSlots.ts
├── lib/{rbac,clock,format}/
├── public/fonts/            # Vazirmatn[wght].woff2, CormorantGaramond-*.woff2
├── public/brand/            # valisan-logo.jpg (this file), mark.svg
├── tests/{unit,e2e}/
├── .github/workflows/deploy.yml
├── next.config.ts · tailwind.config.ts (v4 @theme in CSS) · package.json · README.md
```

---

## Appendix C — Risk Register & Mitigations

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | `*.pages.dev` or `*.vercel.app` unreachable from some Iranian ISPs during the stakeholder demo | Demo blocked | Dual publish (Cloudflare Pages + GitHub Pages); optional custom sub-domain the client owns; instruct client to test both links the day before |
| 2 | Google Fonts blocked in Iran | Broken typography | Self-host all fonts (Section 4.2) |
| 3 | Jalali edge cases (leap years, Esfand 30, Nowruz week) | Wrong dates in demo | `jalaali-js` is astronomically accurate through 1500 SH; unit tests for 1403–1410 boundaries |
| 4 | Per-browser mock state confuses stakeholder ("my booking vanished on my laptop") | Perceived bug | Documented in walkthrough; on-screen "Demo mode — data is stored on this device" pill; Phase 3 Supabase resolves |
| 5 | Static export = no server RBAC | Security perception | Stated openly (Section 1.3); admin route unlinked + guarded + audited; Phase 3 RLS policies drafted from the RBAC matrix (3.4) |
| 6 | Reminder "2 hours before" not observable in a short demo | Feature not demonstrated | Admin "fast-forward clock" control + seeded booking starting in 1h55m at first load |
| 7 | Receipt uploads bloat IndexedDB | Slow demo | Client-side resize to ≤ 1280 px / ≤ 300 KB before storing |
| 8 | Vercel Hobby non-commercial clause | Compliance | Not used for the client-facing demo; Cloudflare Pages has no such clause |

---

## Decisions Requiring Confirmation

Please confirm (or amend) the following so Phase 2 can generate the complete, production-ready codebase and seed data in one pass:

1. **Stack:** Next.js 15 App Router (static export) + TypeScript + Tailwind v4 + Lucide + Zustand/IndexedDB mock engine, with a repository layer for a Phase 3 Supabase swap. *(Recommended.)*
2. **Hosting:** Cloudflare Pages primary + GitHub Pages mirror, both $0, built by one GitHub Actions workflow. *(Recommended.)* Alternative: Vercel Hobby only.
3. **Persistence scope for the MVP:** browser-local (per device) mock data with seed versioning and a reset control — versus wiring Supabase Free Tier now (adds ~1 day, gives cross-device state but introduces an external dependency for the demo).
4. **Cutoff default:** 4 hours before class start, editable by the super-admin in settings.
5. **Coach capacity defaults:** private 1 · semi-private 3 · group 6 (each coach overridable).
6. **Packages & mock pricing (Toman):** drop-in 1,900,000 · monthly-8 12,800,000 · monthly-12 18,000,000 (featured) · monthly-16 22,400,000. Amend to the studio's real price points if available.
7. **Blog seed:** 8 editorial articles (2 per category: تغذیه، حرکات اصلاحی، ذهن‌آگاهی، ریکاوری) with royalty-free imagery placeholders.
8. **Coach roster seed:** 4 coaches (Reformer Pilates, Mat Pilates + Corrective, Hatha/Vinyasa Yoga, Postpartum & Mobility).
9. **Demo accounts:** the three accounts listed in Section 2.4.
10. **Brand assets:** use the supplied logo (`docs/valisan/assets/valisan-logo.jpg`) and derive an SVG mark for the favicon and header; supply any additional photography if available, otherwise curated placeholder imagery in the blush/ivory palette will be used.

Upon approval, Phase 2 delivers: the full repository per Appendix B, seed data, unit tests for the scheduling engine, the CI/CD workflow, and the live URLs.
