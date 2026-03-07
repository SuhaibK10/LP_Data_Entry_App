/**
 * @file FloatingMenu.jsx
 * @description Persistent floating action button (FAB) with dropdown menu.
 *
 * Positioned fixed at bottom-right. Provides global navigation:
 *   - "View Products" — browse/edit existing products
 *   - "New Product" — start a fresh entry
 *
 * The button rotates 45° when open (× close affordance).
 * Dropdown closes on outside click/tap.
 *
 * Hidden when `visible` is false (during splash and submitting screens).
 *
 * @param {object}   props
 * @param {boolean}  props.visible         - Whether to render the FAB
 * @param {Function} props.onViewProducts  - Navigate to product list
 * @param {Function} props.onNewProduct    - Start new product entry
 */

import { useState, useEffect, useRef } from 'react'
import { T } from '../tokens'

export default function FloatingMenu({ visible, onViewProducts, onNewProduct }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown on outside click/tap
  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
    }
  }, [open])

  if (!visible) return null

  /** Handle menu item click: close dropdown, fire callback */
  const handleAction = (callback) => {
    setOpen(false)
    callback()
  }

  return (
    <div ref={menuRef} style={{ position: "fixed", bottom: 28, right: 28, zIndex: 90 }}>
      {/* Dropdown menu */}
      {open && (
        <div style={{
          position: "absolute", bottom: 64, right: 0,
          background: "rgba(250, 249, 246, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(228, 225, 220, 0.6)",
          borderRadius: 16, boxShadow: T.shadowLift,
          overflow: "hidden", minWidth: 190,
          animation: "menuFadeIn 0.25s " + T.ease,
        }}>
          {/* View Products option */}
          <button onClick={() => handleAction(onViewProducts)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "14px 18px",
            fontFamily: T.sans, fontSize: 13, fontWeight: 400,
            color: T.black, background: "none", border: "none",
            borderBottom: "1px solid " + T.grey100,
            cursor: "pointer", textAlign: "left",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={T.grey500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            View Products
          </button>

          {/* New Product option */}
          <button onClick={() => handleAction(onNewProduct)} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "14px 18px",
            fontFamily: T.sans, fontSize: 13, fontWeight: 400,
            color: T.black, background: "none", border: "none",
            cursor: "pointer", textAlign: "left",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={T.grey500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Product
          </button>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setOpen(!open)} style={{
        width: 52, height: 52, borderRadius: "50%",
        background: T.black,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: T.shadowLift,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s " + T.ease,
        transform: open ? "rotate(45deg)" : "rotate(0deg)",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={T.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            /* Plus icon that rotates to become × */
            <>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </>
          ) : (
            /* Three dots (vertical ellipsis) */
            <>
              <circle cx="12" cy="5" r="1" fill={T.white} />
              <circle cx="12" cy="12" r="1" fill={T.white} />
              <circle cx="12" cy="19" r="1" fill={T.white} />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
