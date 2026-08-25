# Design system — multi-vendor marketplace

A modern, bright, sans-serif design system. White-dominant surfaces, warm dark
neutrals for text and structure, sage teal as the single accent. No serif,
no gradients, no heavy shadows.

---

## 1. Color palette

| Token | Hex | Role |
|---|---|---|
| `background` | `#FCFCFC` | Page background, card surfaces |
| `surface-muted` | `#F0EAE3` | Image placeholders, subtle fills, input backgrounds |
| `border` | `#E5DED4` | Default hairline border on cards/inputs |
| `border-strong` | `#D6CCBD` | Hover / focus borders |
| `text-primary` | `#1C0221` | Headings, logo, primary body text (plum-black, not pure black) |
| `text-secondary` | `#4C2E05` | Brand/primary color — nav links, prices, primary buttons |
| `text-muted` | `#8A7E70` | Captions, timestamps, placeholder text |
| `accent` | `#2F6E5E` | Sage teal — the *only* pop color: CTAs, active states, badges |
| `accent-soft` | `#E2EFEB` | Accent background tint (badges, chips) |
| `accent-text-on-soft` | `#1B4438` | Text sitting on `accent-soft` |
| `danger` | `#B23A48` | Errors, delayed/failed states |
| `danger-soft` | `#FBEAEA` | Error background tint |
| `danger-text-on-soft` | `#8A2E2E` | Text on `danger-soft` |

### Usage rules
- **`#FCFCFC` is the only background** for pages and cards. Never pure white (`#FFFFFF`) or pure black anywhere.
- **`#4C2E05` (brown)** is the primary brand color — used for icon fills, logo mark, price text, and primary nav emphasis.
- **`#1C0221` (plum)** is the default text color for headings and body copy — it reads as near-black but is warmer than gray-900.
- **`#2F6E5E` (sage teal)** is reserved strictly as the accent. It should appear in no more than one or two places per screen: the primary CTA button, an active nav indicator, a cart badge, a "selected" state. If everything is teal, nothing is.
- Status pills (shipped / packed / delayed, etc.) use the soft tint + matching text pairing, never a solid fill with white text — keeps the UI calm.
- Never place `text-secondary` (brown) directly on `surface-muted` — contrast is too low. Use `text-primary` (plum) instead on muted surfaces.

### Tailwind setup (v4, CSS-first — no tailwind.config.js)

This project uses Tailwind v4, which configures everything as native CSS
custom properties via `@theme` inside `src/index.css` instead of a JS config
file. Tailwind auto-generates utility classes from these variables (e.g.
`--color-brand` → `bg-brand`, `text-brand`, `border-brand`).

**Install:**
```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.js`:**
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**`src/index.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600&display=swap');
@import "tailwindcss";

@theme {
  /* colors */
  --color-background: #FCFCFC;
  --color-surface: #FCFCFC;
  --color-surface-muted: #F0EAE3;

  --color-border: #E5DED4;
  --color-border-strong: #D6CCBD;

  --color-ink: #1C0221;         /* text-primary */
  --color-ink-muted: #8A7E70;   /* text-muted */

  --color-brand: #4C2E05;       /* text-secondary / primary brand */

  --color-accent: #2F6E5E;
  --color-accent-soft: #E2EFEB;
  --color-accent-text: #1B4438;

  --color-danger: #B23A48;
  --color-danger-soft: #FBEAEA;
  --color-danger-text: #8A2E2E;

  /* radius — override Tailwind's built-in rounded-md / rounded-lg values.
     Note: v4 has no "DEFAULT" special-case like v3's JS config — a variable
     name like --radius-default would literally generate a class called
     rounded-default, not the bare rounded. So we override real utility
     names instead, and use the built-in rounded-full for pills. */
  --radius-md: 0.5rem;   /* 8px — buttons, inputs, chips */
  --radius-lg: 0.75rem;  /* 12px — cards, modals */

  /* fonts */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Plus Jakarta Sans", "Inter", sans-serif;
}
```

**Usage in components:**
```jsx
<div className="bg-surface border border-border rounded-lg p-4">
  <p className="font-display text-ink text-xl">Card title</p>
  <span className="bg-accent-soft text-accent-text rounded-full px-2 py-0.5 text-xs">shipped</span>
  <button className="bg-accent text-white rounded-md px-4 py-2">Add to cart</button>
</div>
```

No `tailwind.config.js`, no `content: [...]` paths to maintain — v4's Vite plugin auto-detects source files.

---

## 2. Typography

- **Body / UI text:** `Inter` — clean, neutral, excellent at small sizes, the workhorse for tables, forms, nav, buttons.
- **Headings / display:** `Plus Jakarta Sans` — same sans family feel but slightly more geometric and confident, used for page titles, hero text, and section headers only. Don't use it below 18px.
- Both are Google Fonts, free, and load fast — pull via `@fontsource` or a `<link>` in `index.html`.
- **No serif anywhere.** No italics for emphasis — use weight or color instead.

### Scale

| Use | Font | Size | Weight |
|---|---|---|---|
| Page title | Plus Jakarta Sans | 28px | 600 |
| Section heading | Plus Jakarta Sans | 20px | 600 |
| Card title | Inter | 15px | 500 |
| Body text | Inter | 14px | 400 |
| Secondary / caption | Inter | 12px | 400 |
| Micro (badges, tags) | Inter | 11px | 500 |

Line height: `1.5` for body, `1.2` for headings. Only two weights per family in practice — `400` regular and `500`/`600` for emphasis. Avoid `700`+, it reads heavy against this palette.

---

## 3. Spacing & layout

- Base unit: `4px`. Common gaps: `8px`, `12px`, `16px`, `24px`, `32px`.
- Card internal padding: `16px` (mobile), `20–24px` (desktop).
- Page gutters: `16px` mobile, `32–48px` desktop.
- Max content width: `1280px`, centered.
- Grid gaps between cards: `12–16px`.

---

## 4. Borders & radius

- Every card and input gets a **hairline border** (`1px solid border`), never a shadow-only card — shadows read as "AI-generated default," hairlines read as intentional and crisp.
- Radius: `8px` for buttons, inputs, small chips. `12px` for cards and modals. `999px` (pill) only for status badges and avatar containers.
- No border-radius mixing within one component — a card and its inner image block should share the same radius family (e.g. card `12px`, inner image `12px 12px 0 0` if it's a top-cropped image).

---

## 5. Shadows & elevation

- **Default: no shadow.** Borders do the separation work.
- The *only* place a shadow is allowed is a floating element that sits above content — a dropdown menu, a modal, a toast. Use a single soft shadow: `0 4px 16px rgba(28, 2, 33, 0.08)` (uses the plum at low opacity, not generic gray/black).
- Never stack a border + shadow on the same static card.

---

## 6. Icons

- Use a single outline icon set throughout (Tabler Icons or Lucide — pick one, don't mix).
- Icon color inherits from context: `text-primary` (plum) for neutral icons, `accent` (teal) only when the icon itself is interactive/active (e.g. filled cart, active tab).
- Standard sizes: `16px` inline with text, `20px` in buttons/nav, `24px` max for standalone decorative icons.

---

## 7. Components

### Navbar
- Background: `#FCFCFC`, `1px` bottom border in `border`.
- Logo mark: small rounded-square (`8px` radius) filled `brand` (`#4C2E05`) with a white icon.
- Nav links: `text-secondary` (brown), 13–14px, no underline; active link gets a small `accent` dot or bottom bar, not a full color change.
- Right-side icons (search, cart, avatar): `text-primary` (plum). Cart badge count: solid `accent` circle with `accent-soft`-toned text or white text, whichever passes contrast.
- **Role variants:** buyer-facing navbar stays on this default (white bg, plum/brown text). Vendor-facing navbar inverts the accent role — background stays white, but the active/primary indicator switches to `accent` more prominently (e.g. accent-filled "add product" button) so vendors get a distinct visual zone without introducing a new color.

### Product card
- Card: `#FCFCFC` surface, `1px border`, `12px` radius, overflow hidden.
- Image area: `surface-muted` background as placeholder/loading state, top corners match card radius.
- Category/type tag: small pill, `accent-soft` background + `accent-text-on-soft` text, 10–11px, `500` weight.
- Title: `text-primary`, 13–14px, `500`.
- Vendor byline: `text-muted`, 11px.
- Price: `text-secondary` (brand brown), 14px, `500` — price is the second-most prominent thing on the card after the image.
- Add-to-cart affordance: small `accent`-filled square/circle icon button, `8px` radius, white or `accent-soft` icon.

### List card / row item (orders, activity, etc.)
- Wrapping container: same card treatment as above (`12px` radius, `1px` border, `16px` padding).
- Each row: `1px` bottom border in `border` (last row has none), `8px` vertical padding.
- Row thumbnail: `surface-muted` square, `6px` radius.
- Row title: `text-primary`, 12px. Subtext (order #, date): `text-muted`, 10–11px.
- Status pill: soft-tint + matching text pairing —
  - success/shipped → `accent-soft` / `accent-text-on-soft`
  - neutral/packed → `surface-muted` / `text-secondary`
  - error/delayed → `danger-soft` / `danger-text-on-soft`

### Buttons
- Primary: `accent` fill, white text, `8px` radius, no shadow. Use sparingly — one primary button per view.
- Secondary: transparent fill, `1px border`, `text-primary` text, hover → `surface-muted` background.
- Destructive: `danger` fill or `danger` text with transparent background, depending on weight of the action.

### Forms / inputs
- Background: `#FCFCFC`, `1px border`, `8px` radius, `40–44px` height.
- Focus state: border → `accent`, plus a subtle `2px` outer ring in `accent-soft`.
- Label: `text-secondary` (brown), 12–13px, `500`, sits above the field.
- Placeholder text: `text-muted`.

---

## 8. Role-based theming (buyer vs vendor)

Since both roles share one codebase and one Redux-stored user instance:
- Keep the **base palette identical** for both — don't create a second color system.
- Differentiate by **which color leads**: buyer UI leans on brown/plum for structure with teal as an occasional accent; vendor UI can use `accent` more assertively (e.g. accent-colored primary actions like "Add product," "Fulfil order," dashboard stat highlights) so the two protected-route experiences feel distinct at a glance without a full re-theme.
- Never introduce a third brand color for "admin" if that role exists too — reuse `danger` sparingly for admin/moderation contexts if you need a third visual signal (e.g. flagged listings).

---

## 9. Accessibility notes

- `text-primary` (`#1C0221`) on `#FCFCFC` and `text-secondary` (`#4C2E05`) on `#FCFCFC` both pass AA for body text.
- Never place white text on `accent-soft` or `surface-muted` — those are light tints meant to pair with their matching dark "-text" token.
- All interactive elements need a visible focus ring (`accent` border + soft outer glow) — don't rely on color change alone.
- Status pills should never be color-only — pair with a short label (already the case above), not just a dot.