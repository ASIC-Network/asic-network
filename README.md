# The ASIC Network - site

The website at [asicnetwork.net](https://asicnetwork.net/). Plain HTML, CSS, and JavaScript with no build step: GitHub Pages serves the files as they are, from the root of `main`.

The design matches the [Stone Arch Silicon site](https://github.com/Stone-Arch-Silicon/stone-arch-silicon) (the founding chapter): black and white, big type, hairlines, and a full-screen video hero, with the network's blue as the one accent instead of SASi's gold. The hero film, fonts, and most of the stylesheet and script come from that repo.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page, plus the network map script and its `CONFIG` block at the bottom |
| `assets/site.css` | All styles. Colours are variables at the top; each section picks a dark, light, or paper theme |
| `assets/site.js` | Header, full-screen menu, scroll effects, rolling headline, and the motion toggle |
| `assets/hero-*.mp4`, `assets/hero-720.webm`, `assets/hero-poster*.jpg` | The hero film (1080p, a portrait cut for phones, a VP9 fallback) and its first-frame posters |
| `assets/Geist*.woff2`, `assets/Geist-OFL.txt` | Self-hosted Geist and Geist Mono (SIL OFL 1.1) |
| `assets/logo-256.png` | The logo with a transparent background, for the header, footer, and favicon |
| `logo.png`, `banner.png` | Full-size logo and banner, used for link previews and search results |
| `world.geojson` | Country outlines for the map |
| `CNAME`, `robots.txt`, `sitemap.xml` | Custom domain and search engine files |

## Edit points

- **Universities on the map, and the counts in the hero:** edit the *Universities* tab of the ASIC Network Website Data Google Sheet (columns `university`, `label`, `status`, `lat`, `lng`). A status containing "joined", "connect", "complet", or "contact" draws a filled node; anything else draws a hollow, in-progress node. The page reads the sheet each time it loads, so no commit is needed.
- **People in the map tooltips:** the sheet's people tab, the second sheet URL in `CONFIG` (`name`, `university`, `description`). University names must match the Universities tab exactly.
- **Links:** `CONFIG` near the bottom of `index.html` holds the GitHub org, the Discord invite, and the two published sheet URLs.
- **Registration form:** the Google Form is embedded in the Register section. To swap forms, replace the form ID in the iframe `src` (keep `?embedded=true`) and adjust `.form-card iframe` height in `assets/site.css` if the new form is longer or shorter.
- **Rolling headline:** the words are the `<span>`s inside `#roller` in the hero. The last one must repeat the first so the loop is seamless.

## Preview locally

```
python3 -m http.server 8000   # open http://localhost:8000
```

Respects `prefers-reduced-motion`: the video is never downloaded and the headline stops rolling. The "Pause motion" button in the hero does the same and remembers the choice.
