/**
 * @file WelcomeScreen.jsx
 * @description Landing page with two primary actions.
 *
 * - "Start Entry" → begins the new product wizard
 * - "View Products" → opens the product list (browse/edit)
 *
 * Uses staggered entrance animations for visual polish.
 *
 * @param {object} props
 * @param {Function} props.onStart        - Navigate to Step 1 (new product)
 * @param {Function} props.onViewProducts - Navigate to Product List screen
 */

import { useState, useEffect } from 'react'
import { T, btnSecondary, goldDivider } from '../tokens'
import LogoImg from './LogoImg'

export default function WelcomeScreen({ onStart, onViewProducts }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setTimeout(() => setReady(true), 100) }, [])

  /** Generate staggered transition style */
  const stagger = (delay = "0s") => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(20px)",
    transition: "all 0.9s " + T.ease + " " + delay,
  })

  return (
    <div style={{
      minHeight: "100vh", background: T.white,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 32px",
    }}>
      {/* Logo */}
      <div style={stagger()}>
        <LogoImg size={60} />
      </div>

      {/* Gold gradient divider */}
      <div style={{
        ...goldDivider(36),
        opacity: ready ? 0.6 : 0,
        transition: "opacity 0.6s " + T.ease + " 0.2s",
      }} />

      {/* Title */}
      <h1 style={{
        fontFamily: T.serif, fontSize: 32, fontWeight: 300, color: T.black,
        textAlign: "center", lineHeight: 1.15, margin: 0,
        letterSpacing: "-0.01em",
        ...stagger("0.15s"),
      }}>
        Product Data Entry
      </h1>

      {/* Description */}
      <p style={{
        fontFamily: T.sans, fontSize: 14, fontWeight: 300, color: T.grey500,
        textAlign: "center", lineHeight: 1.7, maxWidth: 240,
        margin: "16px 0 0",
        ...stagger("0.25s"),
      }}>
        Enter product details for GS1 registration. Have the product ready for photos.
      </p>

      {/* Primary CTA — with border and shadow */}
      <button onClick={onStart} style={{
        marginTop: 48, fontFamily: T.sans, fontSize: 14, fontWeight: 500,
        letterSpacing: "0.1em", color: T.white, background: T.black,
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 100, padding: "17px 52px",
        cursor: "pointer", boxShadow: T.shadow3,
        ...stagger("0.4s"),
      }}>
        Start Entry
      </button>

      {/* Secondary CTA — elegant outline */}
      <button onClick={onViewProducts} style={{
        marginTop: 14,
        ...btnSecondary,
        ...stagger("0.5s"),
      }}>
        View Products
      </button>

      {/* Helper text */}
      <p style={{
        fontFamily: T.sans, fontSize: 11, color: T.grey300, marginTop: 24,
        letterSpacing: "0.06em", fontWeight: 300,
        opacity: ready ? 1 : 0,
        transition: "opacity 0.7s " + T.ease + " 0.6s",
      }}>
        Takes about 2 minutes
      </p>
    </div>
  )
}
