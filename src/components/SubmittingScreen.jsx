/**
 * @file SubmittingScreen.jsx
 * @description Upload progress and error display.
 *
 * Shown during the submit/update process. Two visual states:
 *   - "uploading": spinning loader + progress message
 *   - "error": red alert icon + error message
 *
 * The parent (App.jsx) updates `status` and `message` as each
 * photo uploads and when saving to sheet.
 *
 * @param {object} props
 * @param {string} props.status  - "uploading" | "error"
 * @param {string} props.message - Human-readable progress/error text
 */

import { T } from '../tokens'

export default function SubmittingScreen({ status, message }) {
  return (
    <div style={{
      minHeight: "100vh", background: T.white,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "48px 28px", textAlign: "center",
    }}>
      {/* Uploading state: spinner */}
      {status === "uploading" && (
        <>
          <div style={{
            width: 48, height: 48,
            border: "2px solid " + T.grey100,
            borderTopColor: T.gold,
            borderRadius: "50%",
            animation: "spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite",
            boxShadow: "0 0 20px rgba(184, 150, 90, 0.08)",
          }} />
          <p style={{
            fontFamily: T.sans, fontSize: 14, fontWeight: 300,
            color: T.grey500, marginTop: 28, letterSpacing: "0.02em",
          }}>
            {message || "Uploading images..."}
          </p>
        </>
      )}

      {/* Error state: alert icon */}
      {status === "error" && (
        <>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "#FEE",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 24, color: T.red }}>!</span>
          </div>
          <p style={{
            fontFamily: T.sans, fontSize: 14,
            color: T.red, marginTop: 24,
          }}>
            {message || "Something went wrong"}
          </p>
        </>
      )}
    </div>
  )
}
