/**
 * @file Splash.jsx
 * @description Animated splash screen shown on app launch.
 *
 * Runs a 4-stage animation sequence:
 *   Stage 0 (0ms):     Initial state — everything hidden
 *   Stage 1 (300ms):   Gold line appears
 *   Stage 2 (1000ms):  Logo fades in with scale
 *   Stage 3 (1900ms):  Subtitle text slides up
 *   Stage 4 (3200ms):  Entire screen fades out
 *   Done (3900ms):     Calls onDone() to advance to WelcomeScreen
 *
 * Timing can be adjusted by modifying the setTimeout delays.
 *
 * @param {object} props
 * @param {Function} props.onDone - Called when splash animation completes
 */

import { useState, useEffect, useRef } from 'react'
import { T } from '../tokens'
import LogoImg from './LogoImg'

export default function Splash({ onDone }) {
  const [stage, setStage] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 1000),
      setTimeout(() => setStage(3), 1900),
      setTimeout(() => setStage(4), 3200),
      setTimeout(() => onDoneRef.current(), 3900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: T.black,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transition: "opacity 0.7s " + T.ease,
      opacity: stage >= 4 ? 0 : 1,
      zIndex: 100,
    }}>
      {/* Gold accent line */}
      <div style={{
        width: stage >= 1 ? 56 : 0,
        height: 1,
        background: T.gold,
        marginBottom: 28,
        transition: "width 0.7s " + T.ease,
        opacity: stage >= 3 ? 0 : 0.7,
      }} />

      {/* Logo */}
      <div style={{
        opacity: stage >= 2 ? 1 : 0,
        transform: stage >= 2 ? "scale(1)" : "scale(0.9)",
        transition: "all 0.8s " + T.easeSlow,
      }}>
        <LogoImg size={56} invert />
      </div>

      {/* Subtitle */}
      <div style={{
        marginTop: 32,
        opacity: stage >= 3 ? 1 : 0,
        transform: stage >= 3 ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.7s " + T.ease,
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: T.sans, fontSize: 10, letterSpacing: "0.25em",
          textTransform: "uppercase", color: T.gold, fontWeight: 400, margin: 0,
        }}>
          Product Entry App
        </p>
        <p style={{
          fontFamily: T.sans, fontSize: 9, letterSpacing: "0.15em",
          textTransform: "uppercase", color: T.grey500, fontWeight: 300,
          margin: "8px 0 0",
        }}>
          Louis Polo · Internal Tool
        </p>
      </div>
    </div>
  )
}
