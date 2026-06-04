# The ASIC Network - site

Single-file static site (`index.html`). No build step, no backend, only Google Fonts (loaded over HTTPS). Drops straight into GitHub Pages.

## Deploy (GitHub Pages)

1. Push `index.html` to a repo (root, on `main`) under the **ASIC-Network** org.
2. Repo -> **Settings -> Pages**.
3. **Source: Deploy from a branch** -> Branch `main` -> `/ (root)` -> Save.
4. Live at `https://asic-network.github.io/<repo>/` in ~1 min.

For an org landing page, name the repo `ASIC-Network.github.io` -> serves at `https://asic-network.github.io/`.

## Edit points

All in `index.html`, in the `CONFIG` block near the top of `<script>`:

- **`discord`** -> paste your real invite link. **This is the one thing you must set** - the "Join the Discord" button points at a placeholder until you do.
- **`github`** -> already set to `https://github.com/ASIC-Network`.
- **`taglines`** -> the rotating typewriter line in the hero.
- **`decorNodes`** -> node count for the animated graph (purely cosmetic, no real meaning).

## Registration form

Client-side only - there is no server. On submit it:
- validates the required fields,
- generates a node ID + confirmation card from the inputs,
- reveals the Discord invite.

Details stay in the user's browser; joining the Discord is the actual onboarding step. If you later want registrations recorded somewhere, swap the form's submit handler to post to a Google Form, a Formspree endpoint, or a prefilled GitHub issue - all work on a static Pages site.

## Preview locally

```
python3 -m http.server 8000   # open http://localhost:8000
```

Respects `prefers-reduced-motion` (boot sequence, scanlines, and animations turn off for users who set it).
