# Crema — Hero Section Prompt (filled from template)

## BUILD INSTRUCTION
Build this hero/landing page now. Static HTML/CSS/JS, no build step.
**Universal rule:** Reconstruct, don't redesign. Treat every measurement as a spec.

---

## 1. Asset Map
```
ASSET_ID: {{ASSET_01}}
PUBLIC_URL: ./espresso-combined.mp4
MIME: video/mp4
TYPE: video
USAGE: Hero background video (1344x768, 24fps, 8.92s, loops; wide machine shot → extraction macro)

ASSET_ID: {{ASSET_02}}
PUBLIC_URL: ./poster.jpg
MIME: image/jpeg
TYPE: image
USAGE: Video poster + reduced-motion still (frame 0 of {{ASSET_01}})
```

## 2. Stack / Setup
- Static `index.html` + `styles.css` + `script.js`
- Serve over HTTP (e.g. `python -m http.server 5179 --directory D:\tmp\coffee`)
- Provenance: `<meta name="generator" content="Crema hero spec v1">` + HTML comment in `<head>`, never rendered

## 3. External Dependencies
- `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap`

## 4. Fonts
| Role | Family | Weight | Size | Line-height | Tracking |
|---|---|---|---|---|---|
| Headline | Instrument Serif | 400 (+ italic span) | `clamp(3rem, 5.6vw, 6.25rem)` | 0.95 | -0.02em |
| Wordmark | Instrument Serif | 400 | 1.75rem | 1 | -0.01em |
| Eyebrow | Inter | 500 | 0.75rem | 1 | 0.14em, uppercase |
| Body | Inter | 400 | `clamp(1rem, 1.25vw, 1.125rem)` | 1.6 | 0 |
| Buttons / nav | Inter | 500 | 0.9375rem | 1 | 0 |
| Stat value | Instrument Serif | 400 | 2rem | 1 | 0 |
| Stat label / card meta | Inter | 400 | 0.8125rem | 1.4 | 0 |

## 5. Global/Root Styling
- Colors: espresso `#140d08`, roast `#2a1c13`, cream `#f4ece1`, cream-muted `rgba(244,236,225,.72)`, crema `#d99a4e`, crema-hi `#e8b270`, cup-green `#2f5d45`, line `rgba(244,236,225,.18)`, glass `rgba(20,13,8,.48)`
- Gradients (hero shade, top→bottom stack):
  - `linear-gradient(180deg, rgba(20,13,8,.6) 0%, rgba(20,13,8,0) 24%)`
  - `linear-gradient(0deg, rgba(20,13,8,.94) 0%, rgba(20,13,8,.62) 36%, rgba(20,13,8,0) 72%)`
  - `linear-gradient(90deg, rgba(20,13,8,.5) 0%, rgba(20,13,8,0) 58%)`
- Spacing: gutter `clamp(1.25rem, 4vw, 3.5rem)`; max-width `1320px`; radius pill `999px`, card `20px`
- Effects: grain overlay (SVG fractalNoise, `opacity:.09; mix-blend-mode:overlay`); card `backdrop-filter: blur(18px) saturate(1.2)`
- Timing: `--ease: cubic-bezier(.2,.7,.2,1)`; entrance 900ms, stagger 90ms; hover 220ms

## 6. Layout & Layer Architecture
- Hero `min-height: 100svh`, content pinned to bottom, `overflow:hidden`
- z-index: fixed `.page-bg` (0; video → shade → grain inside) → `.page` content (1) → header (20) → scrim (25) → sidebar (30)
- Breakpoints: `≤1100px` order card and stamp card stack under copy; `≤900px` sidebar → drawer, header gains wordmark + menu button; `≤1100px` header CTA hidden; `≤760px` header links drop to a second row (sideways scroll if needed); `≤640px` compact link pills; `≤760px` menu one column; `≤640px` hero copy leads from the top, stats wrap

## 7. Navigation
**Sidebar** — fixed left on every page: `width: 248px` (`--sidebar-w`), full height, `z-index: 30`, `padding: 2rem 1.25rem 1.5rem`, right border line. Home: translucent `rgba(20,13,8,.55)` + `backdrop-filter: blur(18px) saturate(1.2)` over the video; subpages: solid `#140d08`. Top: wordmark. Links (vertical, 46px rows, 12px radius, 20px stroke icons): Home, Menu, Beans, Rewards, Locations — cream-muted → cream + `rgba(244,236,225,.06)` on hover; current page (`aria-current="page"`) gets `rgba(217,154,78,.14)`, a crema icon and a 3px crema marker on the sidebar's left edge. Bottom: a `Settings` gear button (same 46px row style as the links) above the full-width primary `Get the app`. The gear opens `.settings-panel` — fixed bottom-left beside the sidebar (`left: sidebar + 1rem`, 21rem wide, `rgba(20,13,8,.82)` + blur, 20px radius, z-index 32): title + close, then Background video (switch), Reduce motion (switch), Text size (Normal/Large segmented), and the note `Saved on this device only.` Preferences persist in `localStorage` (`crema-settings`) as `.no-video` / `.reduce-motion` / `.text-large` on `<html>`. Page content sits in `.page` with `margin-left: 248px`.

**Header** (`header.topbar`, first child of `.page`, `z-index: 20`) — `padding: 1.25rem gutter`; grid `1fr auto 1fr` so the pill links Home · Menu · Beans · Rewards · Locations sit centred (0.9375rem/500, 36px tall, `0 .875rem` padding, cream-muted → cream + faint fill on hover). Current page: cream text, `aria-current="page"`, and a `.top-indicator` pill behind it (`rgba(217,154,78,.2)` fill, `rgba(217,154,78,.5)` border) whose `view-transition-name` makes it slide to the new link during page transitions (450ms). `index.html` is the default page (served at `/`) with Home current and an outline pill `Get the app` right-aligned in the third column. Home (`.is-overlay`): `position: fixed; left: 248px; right: 0`, transparent over the video; after `scrollY > 16` (`.is-scrolled`) → `rgba(20,13,8,.78)` + blur + bottom line. Subpages: `position: sticky; top: 0`, solid `#140d08` with bottom line; `.is-scrolled` adds `box-shadow: 0 10px 30px rgba(0,0,0,.25)`.

**≤900px:** the sidebar becomes a slide-in drawer (`min(300px, 84vw)`, solid, `translateX(-100%)` → `0` over 350ms); close via its close button, the scrim, or Esc. The header spans full width and shows wordmark · links · 44px menu button (CTA hidden). **≤640px:** links drop to a second header row, centred.

## 8. Hero Content (verbatim)
- Eyebrow: `Order ahead · Skip the queue`
- H1: `Your espresso,` / `pulled <em>before</em> you arrive.`
- Body: `Order from your favourite counter in a few taps. We start the shot when you're close, so it's hot, fresh and waiting on the bar the moment you walk in.`
- Primary CTA: `Download the app` · Secondary CTA: `Browse the menu`
- Stats: `2 min` / `average pickup` · `9th cup` / `always on us` · `12` / `neighbourhood bars`

## 9. Primary Interactive Component — Live order card
320px glass card, radius 20px. Header: `Order #214` + status pill. Item: `Double espresso · oat` / `Crema Soho · Bar 2`. Countdown `2:00 → 0:00` (1s ticks) with progress bar (crema fill). Three steps: Ordered → Brewing → Ready; step state advances at 0s / 1s / countdown end. At 0 the pill reads `Ready at the bar`, holds 4s, then loops.

## 10. Background/Media Treatment
The video, shade and grain live in `.page-bg` (`position: fixed; inset: 0`), so the background stays still while the hero copy and footer scroll over it.
`<video autoplay muted loop playsinline preload="auto" poster="poster.jpg">`, `object-fit: cover; object-position: 38% 50%`. No pause/play control — the video simply loops.

## 11. Interaction & Motion
- Entrance: `[data-reveal]` from `opacity:0; translateY(24px)` to `opacity:1; none`, 900ms `--ease`, delay `index × 90ms`
- Buttons: hover `translateY(-2px)`, 220ms
- Page transitions: `@view-transition { navigation: auto; }`. Old page `opacity 0 + translateY(-16px)` over 280ms; new page from `opacity 0 + translateY(20px)` over 520ms (80ms delay), both `--ease`. `.sidebar` and `.topbar` have their own `view-transition-name` so they stay in place. Fallback where `PageRevealEvent` is unsupported: same-site link clicks add `body.is-leaving` (fade `.page`/`.page-bg`, lift `main` 16px, 240ms) then navigate; `pageshow` with `persisted` removes it. Reduced motion: no page animation.
- `prefers-reduced-motion: reduce` → no entrance animation, video paused on poster

## 12. Responsive Behavior
Only the two breakpoints in §6.

## 12b. Pages and footer
`index.html` = fixed video background + hero + picks section + footer. **Picks** (`#picks`, transparent so the fixed video shows through): eyebrow `This week's picks`, H2 `Two things we would <em>order</em> today.`; two stacked features, Flat white then Butter croissant. Each is a grid `1fr / 27rem` — image left (4:3, 24px radius, `flat-white.jpg` = frame from the espresso clip; `croissant.svg` = placeholder illustration), card right at 50% opacity (`rgba(20,13,8,.5)` + `backdrop-filter: blur(18px) saturate(1.2)`, 24px radius): tag, name + price, intro paragraph, three fact rows, and a ghost `See it on the menu`. Stacks to one column ≤1100px. Foot row: `Prices are the same in the app, and picks change every Monday.` + `See the full menu` and `Meet the beans`. Menu, Rewards and Locations are separate pages (`menu.html`, `rewards.html`, `locations.html`), each: sidebar, one section holding the page `<h1>`, then the footer. On subpages `.page` is a min-height `100svh` flex column so the footer sits at the bottom.

**Footer (all pages)** — `#140d08`, top border line, `padding: 3rem gutter 2rem`. Row 1: wordmark (2rem) left, social icons right (Instagram, TikTok, Facebook, X — 44px circles, 1px line border, 20px stroke icons, hover fills cream with espresso icon). Divider. Row 2: `© {year} Crema Coffee. All rights reserved.` (0.875rem, cream-muted).

Shared section styles: `padding-block: clamp(5rem, 10vw, 8rem)`, inner max-width `1320px`. Title Instrument Serif `clamp(2.5rem, 5vw, 4.25rem)` / 1 / -0.02em, italic `<em>` accent. Light sections: bg `#f4ece1`, ink `#140d08`, muted `rgba(20,13,8,.66)`, line `rgba(20,13,8,.14)`, accent `#95591b`, card `#fbf6ee`. Each section's `[data-reveal]` children fade up (same 900ms/90ms stagger) when the section scrolls into view (IntersectionObserver, threshold .12).

- **Menu** (`#menu`, light) — Eyebrow `Menu`, H2 `Pulled, poured, <em>baked</em> fresh.` Tabs (ARIA tablist, ←/→ keys): Espresso · With milk · Slow bar · Bakes. Two-column list (1 column ≤760px), 4 items per tab: name + optional tag + dotted leader + £ price, one-line description.
- **Rewards** (`#rewards`, dark `#2a1c13`) — H2 `Every ninth cup is <em>on us.</em>` Three numbered steps, three perk pills. Stamp card (3×3 circles, 9th = "Free", starts at 3 filled); "Add a stamp" fills the next; status reads `{8 − n} more to your free cup.`, at 8 `Your next cup is free.`, at 9 `Free cup redeemed. Enjoy it.` and the button becomes `Start a new card`. Stacks under copy ≤960px.
- **Locations** (`#locations`, light) — H2 `Twelve bars, <em>one</em> app.` Six cards (auto-fill, min 19rem): name, address, hours, status pill computed in Europe/London time (Open now / Closes HH:MM within 1h / Opens …). `Open now` toggle filters cards, with empty-state text. Footer row: `Showing 6 of our 12 bars…` + dark `Get the app` button.
- **Beans** (`beans.html`) — light section: eyebrow `Our beans`, H1 `From the farm to <em>your</em> cup.`; four bean cards (auto-fill, min 24rem; paper `#fbf6ee`, 24px radius): tinted bean drawing (`--roast`), origin, name, description, tasting-note chips, and facts (roast with 5-step meter, process, altitude, drinks it is used in) — House Blend (Brazil & Colombia, medium-dark), Huila (Colombia, medium), Yirgacheffe (Ethiopia, light), Nyeri (Kenya, light-medium). Dark section `Four steps, <em>no shortcuts.</em>`: numbered journey Grown at altitude → Processed at origin → Roasted in London → Brewed within 21 days.
- **Footer** — wordmark, section links, `© {year} Crema Coffee`.

## 12c. Theme and ordering
**Theme.** Colours are theme tokens (`--bg`, `--bg-raised`, `--surface`, `--text`, `--text-muted`, `--line`, `--accent-text`, glass and chip tokens). Dark is the default on `:root`; light overrides on `:root[data-theme="light"]` — khaki grounds with mint accents: `--bg #efe9d8`, `--bg-raised #e4dcc4`, `--surface #faf7ee`, `--text #2b2a1f`, `--accent #8fd3b8` (fills: buttons, Add, order button, switches, toggles, stamps, logo dot) with `--accent-ink #1d2b25`, `--accent-text #356a58` (eyebrows, italic accents, icons), mint chip and open-status tints. Dark keeps crema for the same `--accent*` tokens. `.on-media` re-declares the dark set for anything on the video, so hero/banner copy and the unscrolled header stay light-on-dark in both themes. Chosen in Settings → Theme (Dark | Light), stored in `crema-settings.theme`, applied by an inline head script before first paint.

**Menu page.** Same layout as Beans (`body.subpage`, solid header, no video): section head with eyebrow `Menu`, H1 `Pulled, poured, <em>baked</em> fresh.`, lede, and the category tabs; then cards in the bean-card pattern (auto-fill, min 24rem → two columns; `--surface`, 24px radius, 32px padding): 56px circle with a category icon (cup / latte glass / pour-over / croissant), category line, serif name, description, note chips (tag + the drink's bean tasting notes, or bake descriptors), facts `Price` + `Bean` (or `Pairs with` for bakes), then the optional milk select (Whole/Oat/Almond, no charge) and the crema `Add` pill. The card rules are shared with `.bean-card` via selector lists. Below, a raised section `Four taps, <em>no queue.</em>` with four journey steps (Add what you like → Check your order → Pick a bar and a time → Collect at the bar). Floating crema `Your order` button bottom-right with a count. Cart drawer from the right (`min(27rem, 100vw)`): lines with −/+ steppers, then name, pick-up bar, When (ASAP / 15 / 30 min), total, `Place order`; on success a confirmation (green check, `Order C###`, name, bar, ready time, total, items) and `Start a new order`. Demo only — labelled as such; no backend or payment.

## 13. Component Tree
```text
body
  .page-bg (fixed: video, .hero-shade, .hero-grain)
  aside.sidebar (wordmark, side-links, Get the app) + .sidebar-scrim
  .page
    header.topbar.is-overlay (links, Get the app; ≤900px: wordmark + menu button)
    main > section.hero
    .hero-body
      .hero-copy (eyebrow, h1, body, CTAs, stats)
      aside.order-card
  footer.footer (wordmark, socials, copyright)

menu.html / rewards.html / locations.html
  aside.sidebar, .sidebar-scrim
  .page
    header.topbar (sticky)
  main > section (menu: head + tabs, menu-list · rewards: copy + steps + perks, stamp-card · locations: head + open-now filter, loc-grid, loc-foot)
  footer.footer
```

## 14. Accuracy Rules
No copy changes, no new sections, no asset substitutions, attribution non-visual only.
