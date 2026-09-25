<p align="center"><img src="public/brand/valisan-logo.jpg" width="420" alt="Valisan"></p>

# Valisan — MVP prototype (fa-IR · RTL · Jalali)

Interactive, turnkey prototype for **Valisan**, an ultra-luxury boutique women's Pilates / Yoga / Wellness studio.
Everything runs in the browser against a persistent mock engine — **no backend, $0 hosting**.

| | |
|---|---|
| Stack | Next.js 15 (App Router, `output: 'export'`) · TypeScript · Tailwind CSS v4 · Lucide · Zustand (persist) → IndexedDB (`idb-keyval`) · `jalaali-js` |
| Fonts | Self-hosted Vazirmatn (variable) + Cormorant Garamond — no Google Fonts dependency |
| Tests | Vitest for the scheduling / Jalali / seed engine (`npm test`) |
| Hosting | Cloudflare Pages (primary) + GitHub Pages mirror via `.github/workflows/deploy.yml` |

## Run locally

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # static export → ./out
npx serve out      # preview the export
```

## Demo accounts (one tap on the login page)

| Role | Phone | Password | Explore |
|---|---|---|---|
| هنرجو (student) | `09120000001` | `demo1234` | package quota, timeline, reschedule / cancel (4 h cutoff), new booking |
| مربی (coach) | `09120000002` | `demo1234` | weekly matrix, attendee manifest, attendance, seat availability |
| مدیر ارشد (super-admin) | `09120000009` | `admin1234` | `/executive/` ledger, receipt audit queue, users, health records, settings, audit + SMS log |

## Stakeholder walkthrough (~7 min)

1. **Landing → عضویت و قیمت‌ها** → pick a package → «شروع ثبت‌نام».
2. **Health intake** (6 conversational steps, confidentiality banner on every step).
3. **Jalali picker → slot chips** with live seats («۲ از ۳ صندلی»).
4. **Checkout**: *پرداخت آنلاین* opens the ZarinPal-style simulator (success / cancel / insufficient funds / timeout) — or *کارت به کارت* with copy-to-clipboard, tracking number and drag-and-drop receipt → «در انتظار تأیید».
5. **Student portal**: quota ring, timeline, «جابه‌جایی» / «لغو» — try the session inside the 4-hour cutoff to see the lock.
6. **Bell + SMS toast** for every event (Kavenegar-style bubble, bottom-start).
7. Switch to **super-admin** → `/executive/queue/` → approve / reject with reason → switch back to see the SMS.
8. **Coach portal** shows the new attendee and updated seat count.
9. Executive header: **fast-forward clock** (30 min / 1 day) to watch the 2-hour reminder fire; **بازنشانی** re-seeds the demo world.

## Cloudflare Pages settings

| Setting | Value |
|---|---|
| Root directory | `valisan` |
| Build command | `npm ci && npm run build` |
| Output directory | `out` |
| Node | `NODE_VERSION=20` |

Data is stored per browser (IndexedDB, key `valisan-demo@v1`). Bump `SEED_VERSION` in `data/seed/build.ts` to invalidate every visitor's demo state on the next deploy.

## Layout

```
app/              routes (public · join funnel · pay · portal · coach · executive)
components/       ui primitives · layout · calendar · intake · payment · portal · coach · executive · marketing
domain/           types · jalali · scheduling engine · notifications · labels (Persian dictionary)
data/seed/        coaches · packages · users · content · deterministic demo-state builder
data/store.ts     Zustand store + IndexedDB persistence + all business actions
lib/              hooks (numerals, simulated clock) · RBAC guard
tests/            Vitest engine tests
```

Phase 3 (real backend): swap `data/store.ts` actions for a Supabase repository behind the same interfaces; the RBAC matrix in the Phase 1 blueprint maps 1:1 to Row-Level-Security policies.
