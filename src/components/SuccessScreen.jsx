/**
 * @file SuccessScreen.jsx
 * @description Post-submit confirmation screen.
 *
 * Shows a success animation with contextual messaging:
 *   - Create mode: "Product saved" / "Add Another Product"
 *   - Edit mode: "Product updated" / "Back to Products"
 *
 * Uses staggered entrance animations for visual delight.
 *
 * @param {object}   props
 * @param {string}   props.productName - Name of the submitted product
 * @param {Function} props.onNew       - Reset and go back to welcome/products
 * @param {boolean}  [props.isEdit=false] - Whether this was an edit
 */

import { useState, useEffect } from 'react'
import { T, goldDivider } from '../tokens'

export default function SuccessScreen({ productName, onNew, isEdit = false }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setTimeout(() => setReady(true), 100) }, [])

  const stagger = (delay = "0s") => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(20px)",
    transition: "all 0.8s " + T.ease + " " + delay,
  })

  return (
    <div style={{
      minHeight: "100vh", background: T.white,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "48px 32px", textAlign: "center",
    }}>
      {/* Checkmark with animated ring */}
      <div style={{
        ...stagger(),
        width: 64, height: 64, borderRadius: "50%",
        background: "linear-gradient(135deg, #EAFAF1, #D5F5E3)",
        border: "1px solid rgba(39, 174, 96, 0.15)",
        boxShadow: "0 4px 20px rgba(39, 174, 96, 0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            strokeDasharray: 24,
            strokeDashoffset: ready ? 0 : 24,
            transition: "stroke-dashoffset 0.6s ease 0.3s",
          }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Gold gradient divider */}
      <div style={{
        ...goldDivider(32),
        opacity: ready ? 0.6 : 0,
        transition: "opacity 0.5s ease 0.15s",
      }} />

      {/* Heading */}
      <h2 style={{
        fontFamily: T.serif, fontSize: 30, fontWeight: 300,
        color: T.black, margin: 0, lineHeight: 1.2,
        letterSpacing: "-0.01em",
        ...stagger("0.1s"),
      }}>
        {isEdit ? "Product updated" : "Product saved"}
      </h2>

      {/* Description */}
      <p style={{
        fontFamily: T.sans, fontSize: 14, fontWeight: 300,
        color: T.grey500, margin: "14px 0 0", lineHeight: 1.7,
        maxWidth: 250, ...stagger("0.2s"),
      }}>
        <strong style={{ fontWeight: 500, color: T.black }}>{productName}</strong>{" "}
        {isEdit
          ? "has been updated successfully."
          : "has been added to the sheet."}
      </p>

      {/* Action button */}
      <button onClick={onNew} style={{
        marginTop: 44, fontFamily: T.sans, fontSize: 14, fontWeight: 500,
        letterSpacing: "0.08em", color: T.white, background: T.black,
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 100, padding: "17px 48px",
        cursor: "pointer", boxShadow: T.shadow3,
        ...stagger("0.35s"),
      }}>
        {isEdit ? "Back to Products" : "Add Another Product"}
      </button>
    </div>
  )
}
