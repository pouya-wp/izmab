// Offsets and lengths (seconds) of each sound in public/sfx/izmab-sfx.mp3.
// Sounds from the uisfx library (CC0, https://uisfx.com): the Glass pack for the interface, Dreamy for movement,
// Minimal for the aperture-ring detents. Each was high-passed at 150 Hz, trimmed and levelled.
export const SFX_SPRITE: Record<string, [number, number]> = {
  hover: [0, 0.3145],
  select: [0.4145, 0.5096],
  press: [1.0241, 0.3632],
  typing: [1.4873, 0.1093],
  toggle_on: [1.6966, 0.534],
  toggle_off: [2.3306, 0.5218],
  notification: [2.9524, 0.8258],
  success: [3.8782, 1.0332],
  step: [5.0114, 0.4486],
  swipe: [5.56, 0.6551],
  open: [6.3151, 0.6846],
  close: [7.0997, 0.6561],
  expand: [7.8557, 0.7593],
  detent: [8.715, 0.1488],
  snap: [8.9638, 0.1488],
}
