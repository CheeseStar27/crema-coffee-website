# Crema — coffee shop website

A five-page static website for a fictional coffee-shop ordering app, built around
a looping espresso video. Plain HTML, CSS and JavaScript: no framework, no build
step, nothing to install.

**Pages:** Home · Menu · Beans · Rewards · Locations

## Features

- **Video hero** on the home page, with the video fixed while the page scrolls over it
- **Ordering (demo)** on the menu page: add to cart with a milk choice, a cart drawer
  with quantities, pick-up bar and time, and an order confirmation. Nothing is sent
  and no payment is taken.
- **Light and dark themes** — espresso and crema, or khaki and mint — chosen in Settings
- **Settings panel**: theme, background video on/off, reduce motion, text size,
  remembered on the device
- **Animated page transitions** (View Transitions API, with a fallback)
- Live **open/closed status** for each location, in London time
- Interactive **stamp card** on the rewards page
- Responsive down to phone width, with a slide-out sidebar

## Run it locally

Any static file server works. With Python:

```bash
python -m http.server 5179
```

Then open <http://localhost:5179>.

## Documentation

- [`GUIDE.md`](GUIDE.md) — how the site is built: structure, design tokens and
  themes, components, scripts, animation, responsive behaviour, and how to make
  common changes
- [`crema-hero-spec.md`](crema-hero-spec.md) — the design spec
- [`shot-list.md`](shot-list.md) — storyboard for the espresso video clips

## Note

"Crema" is a made-up brand. The copy, prices, addresses, opening hours and bean
details are placeholders, and the croissant image is a drawing.
