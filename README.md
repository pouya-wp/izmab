# IZMAB portfolio

React + TypeScript + Vite rebuild of the original IZMAB prototype. The source prototype and assets remain in the parent folder.

## Experience

- Four complete UI languages: English, Persian, Armenian, and Russian. The choice is saved locally and reflected in the `?lang=` URL.
- Lenis smooth scrolling synchronized with GSAP ScrollTrigger; reduced motion disables scroll smoothing and cinematic movement.
- Flag based language transitions, including a Union Jack for English, and optional synthesized Web Audio cues.
- Three.js depth portrait with a generated grayscale depth texture and cutout mask, subtle pointer parallax and localized red light.
- A sitewide 3D emissive cursor and restrained volumetric water ripple on clicks, with portrait refraction and fine film grain.
- A glass and metal 3D neon IZMAB sign, an animated editorial menu, and elastic WebGL work surfaces.
- An Armenia journey card and the exact footer dedication: “A gift From Bro” / “happy emigration”.

Sound begins only when a visitor turns it on. The visual effects pause when off screen where practical. Without WebGL, the original portrait and section labels remain visible.

## Run locally

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. For a production build, run `pnpm build`.

## Content to replace before publishing

- Add real project stills or videos to the six work cards in `src/data.ts` and `src/AppV2.tsx`.
- Add the showreel master and process/feed imagery. Those sections currently display clearly labelled placeholders.
- Confirm the copy, stats, prices, availability date and `hello@izmab.studio` address. These values came from the original mockup.
- Connect the booking form to a real endpoint if enquiries should be sent inside the site. It currently opens the visitor's email app with a prepared message; it does not claim to send data itself.
- Add article pages and social URLs when their real content and destinations are available. The current journal and feed keep the mockup layout without dead links.

The design respects reduced motion settings, supports keyboard focus, and uses a swipeable work gallery on narrow screens.
