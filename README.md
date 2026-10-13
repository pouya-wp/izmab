# IZMAB portfolio

React + TypeScript + Vite rebuild of the original IZMAB prototype. The source prototype and assets remain in the parent folder.

## Concept: the site is a film

Every section borrows a piece of film-making, so the portfolio reads like the work it sells.

- **Leader** — a 3·2·1 academy-leader countdown with a sweep and flash, then the shutter opens on the hero. Runs once per session; skippable; never runs with reduced motion.
- **Hero** — the portrait, cut out so the wordmark's M sits exactly behind the head. The wordmark is seen through a moving lens (`src/LensMark.tsx`): depth-of-field blur that falls off smoothly from the cursor, a touch of magnification, a smear along the direction of travel and a film-like halation glow. Scrolling pulls the frame back into a rounded letterbox.
- **Cursor** — a small dot that opens into a labelled disc over media (Read, Develop, Soon).
- **Manifesto** — on paper: a word-by-word scroll reveal with serif-italic accents, followed by a velocity-reactive marquee.
- **Work: the frame that reframes** — a pinned stage where scrolling cuts between projects. The frame physically morphs to each project's aspect ratio (2.39:1 → 4:5 → 16:9 → 9:16 → 3:2), with a noise-dissolve cut and a shutter click. Each project has a generative "living still" (`src/SceneCanvas.tsx`) in its place until real footage lands.
- **Reel** — a frame that grows from a small card to full bleed as you scroll, playing a rapid-cut teaser montage of the six scenes; stats roll in as odometers (Latin and Persian digits).
- **About: the grade** — a project frame flat in LOG and graded side by side; drag the split and pick a look (Rec.709, Kodak 2383, bleach bypass, noir).
- **Process: stopping down** — a seven-blade aperture with individually lit blades that closes from f/1.4 to f/11 through Brief → Prep → Shoot → Finish; the portrait seen through it darkens as it stops down, and an aperture scale tracks the stop.
- **Already have content?** — an offer to edit visitors' own video, images and graphics, quoted on request (no price).
- **Packages as slates** — three clapperboards that clap shut on hover. Prices in US dollars with the Armenian dram equivalent at today's rate (open.er-api.com, cached per session, approximate fallback offline) and a USD/AMD switch.
- **Journal** — hover previews that follow the cursor, each a small illustration of the article's idea.
- **Feed as a contact sheet** — two counter-scrolling film strips with grease-pencil selects.
- **Next stop: Yerevan** — a studio already in love with Armenia and on its way there: services, who it wants to work with, working languages and a live Yerevan clock.
- **Contact** — an enquiry form and copy-to-clipboard email.
- **End credits** — then the wordmark.

Palette: warm off-blacks, a paper tone for the manifesto, about, packages and journal, and one red used sparingly. Type: Archivo at a wide stretch in sentence case, with Instrument Serif italics. Persian headlines use PARADOX and its accents PARADOX LINE (`public/fonts/`), with Vazirmatn for body text.

Four complete UI languages (English, Persian, Armenian, Russian) with flag transitions, RTL layout for Persian and script-specific type. Lenis smooth scrolling drives GSAP ScrollTrigger. Sound (`src/useSoundDesign.ts`) uses real, designed interface sounds from SND by Dentsu (kit SND02 for the interface, SND03 taps for the aperture ring), trimmed into one ~290 kB sprite (`public/sfx/`, credits in `public/sfx/CREDITS.txt`) and mixed soft: taps on hover, a rounded select on click, soft typing, swipes on project cuts and fast scrolls, transitions between sections, tap cascades as lists land, mechanical detents on the aperture ring and a warm celebration when an enquiry is prepared — panned by screen position with slight pitch variation. It starts only when the visitor turns it on; a prompt after the intro invites them to. WebGL canvases are created lazily and pause off screen. With reduced motion, the leader, pinning, scrubbing and cursor are off and every section renders as a static, fully readable page.

## Run locally

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. For a production build, run `pnpm build`.

## Content to replace before publishing

- Add real project stills or videos for the six projects in `src/data.ts`; the generative scenes in `src/SceneCanvas.tsx` are stand-ins and can stay as hover/transition texture.
- Add the showreel master and process/feed imagery. Those sections currently display clearly labelled placeholders.
- PARADOX and PARADOX LINE are commercial fonts from fontiran.com; confirm the web licence covers this site.
- Confirm the copy, stats, prices, availability date and `hello@izmab.studio` address. These values came from the original mockup.
- Connect the booking form to a real endpoint if enquiries should be sent inside the site. It currently opens the visitor's email app with a prepared message; it does not claim to send data itself.
- Confirm the Yerevan section copy and the USD prices in `src/App.tsx` / `src/i18n-extra.ts`. The stills in `public/stills/` are generative stand-ins for real project frames.
- Add article pages and social URLs when their real content and destinations are available. The current journal and feed keep the mockup layout without dead links.

The design respects reduced motion settings, supports keyboard focus, and keeps the work stage, process and departure scenes usable on narrow screens.

## Stills

Only the hero uses the portrait. The grade compare, the lens, the menu and the contact sheet use frames rendered from the site's own scenes into `public/stills/`; regenerate them after changing the shader with `CHROMIUM_PATH=/path/to/chromium node scripts/render-stills.mjs`. Swap them for real project stills when those exist.

## QA

```sh
pnpm build && pnpm preview --port 4173 &
pnpm test:ui                       # uses installed Chrome
CHROMIUM_PATH=/path/to/chromium pnpm test:ui   # or any Chromium build
```
