# The ASIC Network - site

The website at [asicnetwork.net](https://asicnetwork.net/). Plain HTML, CSS, and JavaScript with no build step: GitHub Pages serves the files as they are, from the root of `main`.

The page is built on the same structure as the [Stone Arch Silicon site](https://github.com/Stone-Arch-Silicon/stone-arch-silicon) (the founding chapter) but has its own look: a blue-black and cool-white palette with the network's signal blue, Archivo and IBM Plex Mono, rounded capsules and cards, blueprint grids, a decoding headline, live numbers from the member sheet, and a hero film of the real network on a turning globe.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page, plus the network map script and its `CONFIG` block at the bottom |
| `assets/site.css` | All styles. Colours are variables at the top; each section picks a dark, light, or paper theme |
| `assets/site.js` | Header, full-screen menu, scroll effects, decoding headline, live numbers, and the motion toggle |
| `assets/hero-*.mp4`, `assets/hero-720.webm`, `assets/hero-poster*.jpg` | The globe film (1080p, a portrait cut for phones, a VP9 fallback) and its first-frame posters |
| `assets/Archivo-Variable.woff2`, `assets/IBMPlexMono-*.woff2`, `assets/*-OFL.txt` | Self-hosted Archivo and IBM Plex Mono (SIL OFL 1.1) |
| `assets/logo-256.png` | The logo with a transparent background, for the header, footer, and favicon |
| `tools/hero-film/` | The renderer for the globe film (see below) |
| `logo.png`, `banner.png` | Full-size logo and banner, used for link previews and search results |
| `world.geojson` | Country outlines for the map and the film |
| `CNAME`, `robots.txt`, `sitemap.xml` | Custom domain and search engine files |

## Edit points

- **Universities on the map, and the live numbers in the hero:** edit the *Universities* tab of the ASIC Network Website Data Google Sheet (columns `university`, `label`, `status`, `lat`, `lng`). A status containing "joined", "connect", "complet", or "contact" draws a filled node; anything else draws a hollow, in-progress node. The page reads the sheet each time it loads, so no commit is needed.
- **People in the map tooltips:** the sheet's people tab, the second sheet URL in `CONFIG` (`name`, `university`, `description`). University names must match the Universities tab exactly.
- **Links:** `CONFIG` near the bottom of `index.html` holds the GitHub org, the Discord invite, and the two published sheet URLs.
- **Registration form:** the Google Form is embedded in the Register section. To swap forms, replace the form ID in the iframe `src` (keep `?embedded=true`) and adjust `.form-card iframe` height in `assets/site.css` if the new form is longer or shorter.
- **Headline:** the words that decode in turn are the `data-words` list on `#decode` in the hero.

## Hero film

The film is rendered, not live: it shows the universities in `tools/hero-film/unis.csv` (the sheet as of October 2026). The map and the numbers update on their own; re-render the film when the network grows enough to matter.

1. Download the sheet's Universities tab as CSV and save it over `tools/hero-film/unis.csv`.
2. Serve the folder and render both cuts (needs Node with Playwright):
   ```
   python3 -m http.server 8767 --directory tools/hero-film &
   node tools/hero-film/render.js land 1920 1080 frames-land all
   node tools/hero-film/render.js port 720 1280 frames-port all
   ```
3. Encode them into `assets/` (needs ffmpeg with libx264 and libvpx-vp9): `sh tools/hero-film/encode.sh`, then delete the `frames-*` folders.

`tools/hero-film/make_land.py` regenerates the globe's land dots from `world.geojson` if that file ever changes.

## Preview locally

```
python3 -m http.server 8000   # open http://localhost:8000
```

Respects `prefers-reduced-motion`: the film is never downloaded, the headline stops decoding, and the numbers appear without counting up. The "Pause motion" button in the hero does the same and remembers the choice.
