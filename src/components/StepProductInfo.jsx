/**
 * @file StepProductInfo.jsx
 * @description Step 1 — Product name input with duplicate detection.
 *
 * Features:
 *   - Auto-focus on mount
 *   - Enter key to advance
 *   - Required field validation
 *   - Live duplicate detection against existing products
 *   - Animated entrance
 *
 * Duplicate detection:
 *   Compares the entered name (case-insensitive, trimmed) against
 *   `existingProducts` array passed from App. Shows a warning banner
 *   but does NOT block submission — staff may intentionally create
 *   entries with similar names (e.g., color variants).
 *
 * @param {object}   props
 * @param {object}   props.data              - Current form data
 * @param {Function} props.onChange           - Update form data: onChange({ field: value })
 * @param {Function} props.onNext            - Advance to next step
 * @param {Function} props.onBack            - Go back to previous screen
 * @param {Array}    [props.existingProducts] - Products from sheet (for duplicate check)
 * @param {boolean}  [props.isEdit]          - Whether we're editing (skip self-match)
 */

import { useState, useMemo } from 'react'
import { T, inputBase, btnPrimary, labelStyle } from '../tokens'
import { TOTAL_STEPS } from '../config'
import useStepAnimation from '../hooks/useStepAnimation'
import StepHeader from './StepHeader'

export default function StepProductInfo({ data, onChange, onNext, onBack, existingProducts = [], isEdit = false }) {
  const anim = useStepAnimation()
  const [errors, setErrors] = useState({})

  const isValid = !!data.productName?.trim()

  /** Check for duplicate product names (case-insensitive) */
  const duplicateMatch = useMemo(() => {
    const name = data.productName?.trim().toLowerCase()
    if (!name || name.length < 3) return null

    return existingProducts.find(p => {
      const existing = p.productName?.trim().toLowerCase()
      if (!existing) return false
      // Exact match or very close (one contains the other)
      return existing === name || existing.includes(name) || name.includes(existing)
    })
  }, [data.productName, existingProducts])

  /** Validate and advance */
  const handleNext = () => {
    const newErrors = {}
    if (!data.productName?.trim()) newErrors.productName = "Required"

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onNext()
  }

  /** Clear field-level error on input change */
  const handleChange = (value) => {
    onChange({ productName: value })
    if (errors.productName) {
      setErrors(prev => ({ ...prev, productName: undefined }))
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      <StepHeader step={1} total={TOTAL_STEPS} onBack={onBack} />

      <div style={{
        flex: 1, padding: "0 28px 40px",
        opacity: anim ? 1 : 0,
        transform: anim ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: T.serif, fontSize: 26, fontWeight: 300, color: T.black,
          lineHeight: 1.25, margin: "0 0 6px", whiteSpace: "pre-line",
        }}>
          {"Product\ndetails"}
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 300,
          color: T.grey500, margin: "0 0 32px",
        }}>
          Name of the product
        </p>

        {/* Product Name Field */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Enter Product Name with Color and Size</label>
          <input
            type="text"
            value={data.productName || ""}
            placeholder='e.g. "SkyTrial Blue 20 inches"'
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleNext() }}
            autoFocus
            style={{
              ...inputBase,
              borderBottomColor: errors.productName ? T.red : T.grey200,
            }}
            onFocus={e => e.target.style.borderBottomColor = errors.productName ? T.red : T.black}
            onBlur={e => e.target.style.borderBottomColor = errors.productName ? T.red : T.grey200}
          />
          {errors.productName && (
            <p style={{ fontFamily: T.sans, fontSize: 12, color: T.red, margin: "6px 0 0" }}>
              {errors.productName}
            </p>
          )}

          {/* Duplicate warning — shown but doesn't block */}
          {duplicateMatch && !isEdit && (
            <div style={{
              marginTop: 12, padding: "12px 16px",
              background: "#FDF6EC", border: "1px solid #F0DFC0",
              borderRadius: 10,
            }}>
              <p style={{
                fontFamily: T.sans, fontSize: 12, fontWeight: 500,
                color: "#8B6914", margin: "0 0 4px",
              }}>
                Possible duplicate found
              </p>
              <p style={{
                fontFamily: T.sans, fontSize: 12, fontWeight: 300,
                color: "#8B6914", margin: 0, lineHeight: 1.5,
              }}>
                "{duplicateMatch.productName}" already exists
                {duplicateMatch.mrp ? ` (₹${duplicateMatch.mrp})` : ""}.
                You can still continue if this is a different product.
              </p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleNext}
          disabled={!isValid}
          style={{ marginTop: 8, ...btnPrimary(isValid) }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
