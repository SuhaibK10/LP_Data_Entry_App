/**
 * @file Grain.jsx
 * @description SVG noise texture overlay.
 *
 * Renders a full-viewport SVG with fractal noise to give the app
 * a subtle paper-like texture consistent with the luxury aesthetic.
 *
 * Fixed positioning at z-index 9999, pointer-events disabled.
 * Very low opacity (2.5%) so it doesn't interfere with readability.
 */

export default function Grain() {
  return (
    <svg style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 9999, opacity: 0.025
    }}>
      <filter id="grain-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" />
    </svg>
  )
}
