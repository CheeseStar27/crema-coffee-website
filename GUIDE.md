# Crema — website guide

A five-page static site for a fictional coffee-shop app, built around a looping
espresso video, with a light/dark theme and a working (demo) ordering system on the
menu page. No build step, no framework, no dependencies to install: three shared
files (`styles.css`, `script.js`, the page HTML) served as plain files.

- **This guide** = how the site is put together and how to change it.
- **`crema-hero-spec.md`** = the original design spec (exact values, copy, layout
  decisions), written from the hero-section prompt template.
- **`shot-list.md`** = the storyboard for the espresso video clips.

---

## 1. Run it

```bash
python -m http.server 5179 --directory D:\tmp\coffee
```

Then open <http://localhost:5179> — `index.html` is served at `/`.

There is also a launch config at `D:\tmp\.claude\launch.json` under the name
`coffee`, used by the editor's preview pane.

**Caching gotcha.** `http.server` sends no cache headers, so browsers hold on to
old copies of `styles.css` and the pages. After editing, hard-refresh with
**Ctrl+F5**, or the change will not appear.

---

## 2. Files

| File | What it is |
|---|---|
| `index.html` | Home: hero over the video + two recommended items + footer |
| `menu.html` | The menu as cards in the Beans page layout, with **Add** buttons; "How ordering works" steps; the order button and cart drawer |
| `beans.html` | The four coffee beans + "farm to cup" steps |
| `rewards.html` | Loyalty scheme + interactive stamp card |
| `locations.html` | Six bars with live open/closed status |
| `styles.css` | Every style for every page (~1370 lines, sectioned by comment banners) |
| `script.js` | Every behaviour for every page; each block guarded by an element check |
| `espresso-combined.mp4` | Background video on the home page (1344×768, 24fps, 8.9s, loops) |
| `poster.jpg` | First frame of the video: poster + the still used when video is off |
| `flat-white.jpg` | Home feature image, a frame cut from the video |
| `croissant.svg` | Home feature image, a **placeholder drawing** |
| `shot-a-wide.mp4`, `shot-b-extraction.mp4` | Source clips, not used by the site |

---

## 3. Page structure

Every page shares the same shell, in this order in the HTML:

```text
<head>
  fonts, styles.css, and a small inline script (saved settings + skipped transitions)
<body>                     ← every page but home: class="subpage" (menu also "menu-page")
  .page-bg                 ← home only: fixed video + shade + grain
  aside.sidebar            ← fixed left navigation (drawer when narrow)
  .sidebar-scrim           ← dimmed backdrop behind the open drawer
  .settings-panel          ← floating Settings panel (hidden until opened)
  .page                    ← everything that scrolls
    header.topbar          ← wordmark, page links, "Get the app", menu button
    main                   ← the page's sections
    footer.footer          ← wordmark, socials, copyright
  (menu only) .cart-fab, .cart-scrim, aside.cart
  script.js
```

**Home vs subpages.** Home has the fixed video and its header floats over it
(`.topbar.is-overlay`). Menu, beans, rewards and locations set
`body class="subpage"`: a solid sidebar, a solid sticky header, and a flex-column
`.page` so a short page still pushes the footer to the bottom. Menu and Beans
share one layout: a heading block, a two-column grid of cards, then a darker
section of numbered steps.

**Stacking order (z-index).** `.page-bg` 0 → `.page` 1 → header 20 → drawer scrim
25 → sidebar 30 → settings panel 32 → order button 35 → cart scrim 39 → cart 40.

---

## 4. Design system

### Themes

Colours are **theme tokens**, not raw colours. Dark is the default on `:root`;
light overrides the same tokens on `:root[data-theme="light"]`.

Dark is espresso with crema accents; light is **khaki with mint accents**.

| Token | Dark | Light | Used for |
|---|---|---|---|
| `--bg` | `#140d08` | `#efe9d8` light khaki | Page, sidebar, header, footer, cart |
| `--bg-raised` | `#1f150f` | `#e4dcc4` deeper khaki | Alternate sections, cart form |
| `--surface` | `#2a1c13` | `#faf7ee` cream-khaki | Cards |
| `--text` | cream `#f4ece1` | olive-brown `#2b2a1f` | Body text |
| `--text-muted` / `--text-faint` | 72% / 45% cream | 70% / 45% olive-brown | Secondary / tertiary text |
| `--line` / `--line-strong` | light hairlines | dark hairlines | Borders, dividers |
| `--accent` / `--accent-hover` | crema `#d99a4e` / `#e8b270` | mint `#8fd3b8` / `#a6ddc7` | Fills: primary buttons, Add, order button, switches, pressed toggles, filled stamps, logo dot |
| `--accent-ink` | espresso | `#1d2b25` | Text and icons on an `--accent` fill |
| `--accent-soft` / `--accent-line` | crema tints | mint tints | Current-page pill and sidebar highlight |
| `--accent-text` | `#e8b270` | deep mint `#356a58` | Italic accent words, eyebrows, icons |
| `--focus` | `#e8b270` | `#356a58` | Keyboard focus ring |
| `--glass` | dark 50% | light 76% | Cards over the video |
| `--sidebar-glass`, `--chrome-glass`, `--panel` | dark glass | khaki glass | Sidebar on home, scrolled header, settings panel |
| `--chip-*`, `--ok-*`, `--warn-*`, `--neutral-bg` | crema/green | mint/amber | Tags, open/closing-soon pills |
| `--inverse-bg` / `--inverse-text` | cream / espresso | olive-brown / khaki | Selected tabs, `btn-dark`, hover fills |

The deep mint for text (`#356a58`) is a shade darker than the button mint so
small text such as eyebrows keeps at least 4.5:1 contrast on khaki.

**Brand constants** are kept for things that never change with the theme:
`--crema`, `--crema-hi`, `--crema-deep` (the home hero's order card, which sits on
the video), `--cup-green` (ready/confirmed states), `--espresso`, `--cream`.

**On the video: `.on-media`.** Anything sitting directly on the home video (the
hero, the text around the home recommendations, and the header before you
scroll) must stay light-on-dark in both themes. `.on-media` re-declares the
dark token set on that element, so everything inside it resolves to dark values
whatever the theme. The unscrolled overlay header gets the same treatment by
selector. Cards *on* the video (`.feature-card`) are not `.on-media`: they become
light glass in the light theme.

**How the theme is chosen.** Settings → Theme (Dark/Light), saved as
`crema-settings.theme`. The inline script in every `<head>` sets
`data-theme="light"` before first paint, so a light page never flashes dark.

**Section classes.** `.section-light` now just means "the page background"
(`--bg`), and `.section-dark` means "the raised background" (`--bg-raised`). In
dark theme every page is dark like the home page; the older cream look is what
the light theme gives you.

### Type

Two families, loaded from Google Fonts:

- **Instrument Serif** — headings, prices, the wordmark, numerals in stat blocks.
  Always weight 400; italic is used for the accent word in every heading.
- **Inter** — everything else (400/500/600).

Headings use `clamp()` so they scale with the viewport, e.g. the home hero is
`clamp(3rem, 5.6vw, 6.25rem)` and section titles `clamp(2.5rem, 5vw, 4.25rem)`.

### Spacing and shape

- `--gutter: clamp(1.25rem, 4vw, 3.5rem)` — the page's side padding.
- `--max: 1320px` — content width, applied by `.section-inner`.
- `--sidebar-w: 248px` — the sidebar, and the left margin of `.page`.
- Radii: pills `999px`, inputs `12px`, cards `20px`, large cards `24px`.
- Sections: `padding-block: clamp(5rem, 10vw, 8rem)`.

### Motion

- `--ease: cubic-bezier(.2,.7,.2,1)` for everything.
- Hover 220ms · card/colour changes 300ms · entrance 900ms · drawers 350ms.

---

## 5. Components

Each has a banner comment in `styles.css` — search for `/* ---------- Name`.

| Component | Where | Notes |
|---|---|---|
| **Sidebar** (`.sidebar`) | all pages | Wordmark, five icon links, Settings gear, "Get the app" pinned to the bottom. Glass on video pages, solid on subpages. Becomes a drawer ≤900px. |
| **Header** (`.topbar`) | all pages | CSS grid `1fr auto 1fr` keeps the links centred. Fixed and transparent on video pages, sticky and solid on subpages; gains a blurred background once scrolled (`.is-scrolled`). |
| **Current-page pill** (`.top-indicator`) | header | An empty `<span>` inside the current link, marked `aria-current="page"`. Its `view-transition-name` makes it slide to the new link during page changes. |
| **Buttons** (`.btn`) | all | `btn-primary` (crema fill), `btn-ghost` (outline), `btn-dark` (inverse of the ground), `btn-outline` (header CTA), `btn-quiet`. All lift 2px on hover. |
| **Form controls** (`.field`, `.input`, `.select`) | cart | Themed inputs; `.select` wraps a native `<select>` and draws its own chevron so it follows the theme. |
| **Hero** (`.hero`) | home | Full-screen, content pinned to the bottom, over the fixed video. |
| **Order card** (`.order-card`) | home hero | Glass card with a 2:00 countdown that loops: Ordered → Brewing → Ready at the bar. |
| **Feature rows** (`.feature`) | home | Two recommended items. Image left, 50%-transparent card right, equal widths and heights, capped at 62rem and centred. Stacks ≤760px. |
| **Menu cards** (`.menu-item`) | menu | The bean-card pattern: category icon in a circle, category line, name, description, note chips (tag + the bean's tasting notes), facts (price, and the bean or what it pairs with), then an optional milk `<select>` and **Add**. The card rules are shared with `.bean-card` in `styles.css` (selector lists), so the two pages always match. Filtered by the tabs. |
| **Order button** (`.cart-fab`) | menu | Floating bottom-right: bag icon, "Your order", item count. Bumps when something is added. |
| **Cart drawer** (`.cart`) | menu | Slides in from the right. Lines with −/+ steppers, then name, pick-up bar, when (ASAP/15/30 min), total and Place order; replaced by a confirmation view once placed. See §6b. |
| **Tabs** (`.tab`) | menu, locations | Pill toggles. Menu tabs are a real ARIA tablist with arrow-key support; the locations one is a pressed-state filter button. |
| **Stamp card** (`.stamp-card`) | rewards | 3×3 grid; filled stamps get a CSS-drawn check mark, the 9th is the free cup. |
| **Location cards** (`.loc-card`) | locations | Address, hours, and a live status pill. |
| **Bean cards** (`.bean-card`) | beans | Bean drawing tinted by roast (`--roast` inline per card), tasting-note chips, a 5-step roast meter, facts. |
| **Journey** (`.journey`) | beans, menu | Four auto-numbered steps (CSS counters, `01`–`04`): "farm to cup" on Beans, "How ordering works" on Menu. |
| **Settings panel** (`.settings-panel`) | all pages | Opened from the gear in the sidebar. Four preferences. See §6a. |
| **Footer** (`.footer`) | all pages | Wordmark, four social icons, copyright with the year filled in by script. |

---

## 6. JavaScript

`script.js` is one IIFE. Every block starts by looking for an element and exits
if it is not on this page, so the same file serves all five pages. Blocks, in
order:

1. **Entrance reveals** — adds `.js` to `<html>`, then reveals banner elements on
   load and each `[data-reveal-group]` when it scrolls into view
   (IntersectionObserver, threshold 0.12).
2. **Copyright year** — fills every `[data-year]`.
3. **Header scroll state** — toggles `.is-scrolled` past 16px.
4. **Sidebar drawer** — open from ☰, close via ✕, the scrim, or Esc; focus moves
   to the close button on open and back to ☰ on close.
5. **Settings panel** — see §6a.
6. **Page-transition fallback** — only for browsers without cross-document view
   transitions (see §7).
7. **Background video** — paused when the visitor's system prefers reduced motion.
8. **Order card countdown** (home).
9. **Menu tabs** (menu).
10. **Ordering** (menu) — see §6b.
11. **Stamp card** (rewards).
12. **Opening hours** (locations) — see §9.

Separately, a small **inline script in every `<head>`** runs before first paint.
It applies saved settings (theme, text size, motion, video) so nothing flashes,
and claims skipped page-transition promises (§7).

---

## 6a. Settings

The gear under the sidebar links opens a floating panel (bottom-left on desktop,
above the drawer on narrow screens). Four preferences, saved to `localStorage`
as `crema-settings`:

| Setting | Applied as | Effect |
|---|---|---|
| Theme | `data-theme="light"` on `<html>` | Swaps every theme token (§4). Dark when absent |
| Background video | `.no-video` | Hides the `<video>`; `poster.jpg` stays as the still, and the element is paused |
| Reduce motion | `.reduce-motion` | Mirrors the `prefers-reduced-motion` rules: no fades, hover movement, page transitions, drawer or cart animation |
| Text size | `.text-large` | Root font-size 112.5%, so every `rem`-based size steps up |

Defaults: dark, video on, motion full, text normal. Reading and writing are
wrapped in `try/catch`, so private mode or a corrupt value falls back to
defaults. The system-level `prefers-reduced-motion` still wins for the video.

Panel behaviour: opens and closes from the gear, closes on Esc, on the ✕, or on a
click outside; focus moves to ✕ on open and back to the gear on close.

## 6b. Ordering (menu page)

**This is a front-end demo.** Nothing is sent anywhere and no payment is taken;
both the drawer and the confirmation say so.

**The menu is the data.** Each card carries its own details:

```html
<li class="menu-item" data-category="milk" data-id="flat-white"
    data-name="Flat white" data-price="340">
```

Prices are in **pence**. A card with a milk choice contains
`<select data-milk>`; the chosen milk is stored with the line, and a flat white
with oat milk is a separate line from one with whole milk
(key = `id|milk`).

**Flow.**

1. **Add** puts one of the item in the cart, flashes "Added" on the button for
   1.2s, bumps the order button, and announces the change through a hidden
   `role="status"` region.
2. The **order button** opens the drawer. The page stops scrolling behind it,
   focus moves to ✕, and Tab is kept inside the drawer.
3. **−/+** change quantities; going below 1 removes the line.
4. **Place order** checks there is at least one item and a name. Errors show
   under the total and focus moves to the name field.
5. On success the drawer shows the **confirmation**: an order number
   (`C` + 3 digits), name, bar, ready time (now + 5/15/30 minutes, in the
   visitor's local time), total and the items. The cart is then emptied.
6. **Start a new order** resets the drawer and closes it.

The cart persists in `localStorage` as `crema-cart`, so it survives a reload or a
trip to another page.

**To connect a real backend**, replace the body of the `submit` handler in the
Ordering block of `script.js`: send `lines`, the name, bar and time to your API,
and show the confirmation from its response.

## 7. Animation

**Entrance.** Anything marked `data-reveal` starts at `opacity: 0` and 24px down,
then fades up over 900ms. Siblings stagger by 90ms via a `--i` custom property
set in script. Groups are wrapped in `[data-reveal-group]` so they trigger when
scrolled to.

**Page transitions.** `@view-transition { navigation: auto; }` animates real
navigations in Chrome, Edge and Safari 18.2+: the old page fades and lifts 16px
(280ms), the new one rises 20px into place (520ms). `.sidebar` and `.topbar` have
their own `view-transition-name`, so they stay put while the content changes, and
`.top-indicator` slides between links (450ms).

*Fallback:* where `PageRevealEvent` is missing (e.g. Firefox), script intercepts
same-site link clicks, adds `body.is-leaving` to fade the page out over 240ms, and
then navigates.

*Skipped transitions:* a transition is dropped if the tab is hidden or the window
resizes mid-navigation, which otherwise logs an uncaught `AbortError`. The inline
head script claims the transition's promises on **both** the page being left
(`pageswap`) and the page being opened (`pagereveal`). It has to run before first
paint, which is why it lives in the head rather than in `script.js`.

**Other motion.** Buttons and cards lift 2–3px on hover; the sidebar drawer and
cart drawer slide in 350ms; the order button bumps when an item is added; the
header background and status pills cross-fade 300ms.

**Reduced motion.** With `prefers-reduced-motion: reduce` (or the setting),
entrance animations, hover transforms, view transitions and both drawer
transitions are switched off, and the video is paused on its poster.

---

## 8. Responsive behaviour

Four breakpoints, all `max-width`:

| Width | What changes |
|---|---|
| **≤1100px** | Header "Get the app" hides; hero copy and order card stack; rewards copy and stamp card stack |
| **≤900px** | Sidebar becomes a slide-in drawer (`min(300px, 84vw)`); `.page` loses its left margin; header shows the wordmark and ☰; settings panel spans the width |
| **≤760px** | Header page links hide (the drawer covers navigation); home feature cards stack under their images |
| **≤640px** | Hero shade darkens, CTA buttons share the row, stats tighten, order button moves closer to the corner |

The menu cards use `auto-fill` with a 17rem minimum, so they go from several
columns to one on their own. The cart drawer is `min(27rem, 100vw)` — full width
on a phone.

---

## 9. Data conventions

**Menu items** — see §6b (`data-id`, `data-name`, `data-price` in pence,
`data-category`, optional `select[data-milk]`).

**Opening hours** are declared in the HTML, on each `.loc-card`:

```html
data-hours="[[8,18],[7,19],[7,19],[7,19],[7,19],[7,19],[8,18]]"
```

Seven entries, **Sunday first**, each `[open, close]` in 24-hour decimals
(`6.5` = 06:30), or `null` for a closed day. Script compares them against the
current time in `Europe/London` (so the status is correct wherever the visitor
is), rewrites the pill every minute, and powers the "Open now" filter.

**Current page** is marked twice per page — once in the sidebar link and once in
the header link — with `aria-current="page"`. The header's current link also
contains `<span class="top-indicator">`.

**Browser storage** (per device, `localStorage`): `crema-settings` (§6a) and
`crema-cart` (§6b).

---

## 10. How to make common changes

**Add a page**

1. Copy the closest existing page (`locations.html` is the plainest).
2. Change `<title>`, the description meta, and the `<main>` contents. Keep the
   inline `<head>` script and the settings panel markup.
3. Add the link to the sidebar (`.side-links`, with a 24×24 stroke icon) and the
   header (`.top-links`) **on all pages** — six files.
4. On the new page only, move `aria-current="page"` and the `.top-indicator`
   span onto its own two links.

**Add or change a menu item** — copy an existing `<li class="menu-item">` in
`menu.html` from the same category (so the icon matches). Keep `data-id` unique,
`data-price` in pence and matching the price in the facts, and `data-category` one
of `espresso`, `milk`, `slow`, `bakes`. Add a
`<label class="select">…<select data-milk>` inside `.menu-actions` if it takes
milk. If you change which bean a drink uses, update its note chips to that bean's
tasting notes on `beans.html`.

**Add a pick-up bar** — add an `<option>` to `#orderBar` in `menu.html` (and a
card to `locations.html`).

**Change a theme colour** — edit the token in the dark block (`:root, .on-media,
…`) and/or the light block (`:root[data-theme="light"]`) at the top of
`styles.css`. Avoid raw colours in component rules; use a token so both themes
stay correct.

**Change the home recommendations** — edit the two `<article class="feature">`
blocks in `index.html`. Keep prices in step with `menu.html`.

**Swap a feature image** — replace `flat-white.jpg` / `croissant.svg`, keeping the
filenames, or point the `<img src>` somewhere else. Landscape works best.

**Change the video** — replace `espresso-combined.mp4` and regenerate
`poster.jpg` from its first frame.

---

## 11. Placeholders to replace before this goes live

- **Ordering is a demo.** No backend, no payment, nothing is sent (§6b).
- **The brand is invented.** "Crema", all copy, prices, addresses, opening hours,
  bean origins and the farm story are written as plausible placeholders.
- **Social links** in the footer point at `#`.
- **"Get the app" / "Download the app"** links go nowhere — there are no store
  links yet.
- **`croissant.svg` is a drawing**, not a photograph.
- **`flat-white.jpg` is a frame from the espresso video**, so it is really an
  espresso being poured, not a flat white.
- **Locations says "Showing 6 of our 12 bars"** but only six exist in the markup.
- **Stats** ("2 min", "9th cup", "12") and the stamp card are illustrative.

---

## 12. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Edits don't show up | Browser cached the old file — **Ctrl+F5** |
| A colour is wrong in one theme | A rule is using a raw colour instead of a theme token — switch it to a token (§4) |
| Text on the video is dark in light theme | The element is missing `.on-media` |
| Theme flashes on load | The inline `<head>` script is missing or edited on that page |
| `Transition was skipped` in the console | A page animation was dropped (tab hidden, window resized). Handled by the head script on both pages; old messages persist in the console across page loads |
| Cart looks stale | It is saved in `localStorage` as `crema-cart`; clear it in dev tools |
| Video doesn't play | Must stay `muted` for autoplay; also paused by the video setting or reduced motion. Background browser tabs pause it too |
| Sidebar overlaps content | `.page` needs `margin-left: var(--sidebar-w)`; it is removed ≤900px |
| Fonts look wrong offline | Google Fonts is the only external dependency; the stack falls back to Georgia / system sans |

---

## 13. Accessibility notes

Landmarks (`aside`/`nav`, `header`, `main`, `footer`) are labelled; the current
page uses `aria-current`; both drawers manage focus and close on Esc; the cart
drawer is `role="dialog"` with `aria-modal`, keeps Tab inside, and announces
additions and removals through a `role="status"` region; every Add, −, + and
milk control has a name that includes the item; the menu tabs implement the ARIA
tab pattern with arrow keys; switches use `role="switch"`; icons are
`aria-hidden` with text labels alongside; focus rings are visible
(`:focus-visible`, 2px crema). Colour pairings are defined per theme so text keeps
its contrast in both.

Worth doing before launch: a screen-reader pass, and real keyboard testing of both
drawers on a touch device.
