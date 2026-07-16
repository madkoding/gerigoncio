/**
 * Decorative full-screen SVG-noise overlay.
 * Pure presentation, no interactivity, intentionally behind the content (z-index: 1).
 */
export default function NoiseBackground() {
  return <div className="noise-bg" aria-hidden="true" />
}
