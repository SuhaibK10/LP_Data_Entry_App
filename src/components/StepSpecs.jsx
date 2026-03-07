/**
 * @file StepSpecs.jsx
 * @description Step 5 — Pricing and weight specifications.
 *
 * Three numeric inputs:
 *   - MRP (₹) — Maximum Retail Price
 *   - Net Weight (kg) — product weight without packaging
 *   - Gross Weight (kg) — product weight with packaging
 *
 * All three fields are required. Enter key advances.
 *
 * @param {object}   props
 * @param {object}   props.data     - Current form data
 * @param {Function} props.onChange  - Update form data
 * @param {Function} props.onNext   - Advance to review
 * @param {Function} props.onBack   - Go to previous step
 */

import { useState } from 'react'
import { T, inputBase, btnPrimary, labelStyle } from '../tokens'
import { TOTAL_STEPS } from '../config'
import useStepAnimation from '../hooks/useStepAnimation'
import StepHeader from './StepHeader'

export default function StepSpecs({ data, onChange, onNext, onBack }) {
  const anim = useStepAnimation()
  const [errors, setErrors] = useState({})

  const isValid = data.mrp && data.netWeight && data.grossWeight

  /** Validate all fields and advance */
  const handleNext = () => {
    const newErrors = {}
    if (!data.mrp)         newErrors.mrp = "Required"
    if (!data.netWeight)   newErrors.netWeight = "Required"
    if (!data.grossWeight) newErrors.grossWeight = "Required"

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onNext()
  }

  /**
   * Render a numeric input field with unit suffix.
   *
   * @param {string} key         - Data key (e.g., "mrp")
   * @param {string} label       - Display label
   * @param {string} placeholder - Placeholder text
   * @param {string} unit        - Unit suffix (e.g., "₹", "kg")
   */
  const renderNumericInput = (key, label, placeholder, unit) => (
    <div style={{ marginBottom: 28 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          inputMode="decimal"
          value={data[key] || ""}
          placeholder={placeholder}
          onChange={e => {
            onChange({ [key]: e.target.value })
            if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
          }}
          onKeyDown={e => { if (e.key === "Enter") handleNext() }}
          style={{
            ...inputBase,
            paddingRight: 40,
            borderBottomColor: errors[key] ? T.red : T.grey200,
          }}
          onFocus={e => e.target.style.borderBottomColor = errors[key] ? T.red : T.black}
          onBlur={e => e.target.style.borderBottomColor = errors[key] ? T.red : T.grey200}
        />
        <span style={{
          position: "absolute", right: 0, bottom: 12,
          fontFamily: T.sans, fontSize: 13, color: T.grey400,
        }}>
          {unit}
        </span>
      </div>
      {errors[key] && (
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T.red, margin: "6px 0 0" }}>
          {errors[key]}
        </p>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      <StepHeader step={TOTAL_STEPS} total={TOTAL_STEPS} onBack={onBack} />

      <div style={{
        flex: 1, padding: "0 28px 40px",
        opacity: anim ? 1 : 0,
        transform: anim ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>
        <h2 style={{
          fontFamily: T.serif, fontSize: 26, fontWeight: 300, color: T.black,
          lineHeight: 1.25, margin: "0 0 6px",
        }}>
          Pricing and Weights
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 300,
          color: T.grey500, margin: "0 0 32px",
        }}>
          As printed on the product label
        </p>

        {renderNumericInput("mrp", "MRP", "2999", "₹")}
        {renderNumericInput("netWeight", "Net Weight", "2.5", "kg")}
        {renderNumericInput("grossWeight", "Gross Weight", "3.2", "kg")}

        <button
          onClick={handleNext}
          disabled={!isValid}
          style={{ marginTop: 8, ...btnPrimary(isValid) }}
        >
          Review & Submit
        </button>
      </div>
    </div>
  )
}
