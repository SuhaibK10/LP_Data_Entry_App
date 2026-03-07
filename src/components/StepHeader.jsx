/**
 * @file StepHeader.jsx
 * @description Shared header for all wizard steps.
 *
 * Renders:
 *   - Back button (hidden on step 1)
 *   - Step counter ("2 / 5")
 *   - Animated progress bar
 *
 * @param {object} props
 * @param {number}   props.step  - Current step number (1-indexed)
 * @param {number}   props.total - Total number of steps
 * @param {Function} props.onBack - Navigate to previous step
 */

import { T } from '../tokens'

export default function StepHeader({ step, total, onBack }) {
  const showBack = step > 1

  return (
    <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
      {/* Top bar: back button + step counter */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 22,
      }}>
        <button onClick={onBack} style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 400,
          color: showBack ? T.grey700 : "transparent",
          background: "none", border: "none",
          cursor: showBack ? "pointer" : "default",
          padding: "4px 0",
          pointerEvents: showBack ? "auto" : "none",
          letterSpacing: "0.02em",
          transition: "color 0.3s ease",
        }}>
          ← Back
        </button>

        <span style={{
          fontFamily: T.sans, fontSize: 10, fontWeight: 500,
          letterSpacing: "0.2em", color: T.gold,
          textTransform: "uppercase",
        }}>
          {step} / {total}
        </span>
      </div>

      {/* Progress bar — refined with gold fill */}
      <div style={{
        height: 2, background: T.grey100,
        borderRadius: 2, overflow: "hidden", marginBottom: 36,
        boxShadow: "inset 0 0.5px 0 rgba(0,0,0,0.03)",
      }}>
        <div style={{
          height: "100%",
          width: (step / total * 100) + "%",
          background: step === total
            ? `linear-gradient(90deg, ${T.black}, ${T.grey700})`
            : T.black,
          borderRadius: 2,
          transition: "width 0.7s " + T.ease,
        }} />
      </div>
    </div>
  )
}
