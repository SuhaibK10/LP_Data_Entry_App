/**
 * @file PackagingPhotosStep.jsx
 * @description Step 3 — Upload all 6 packaging photos on a single page.
 *
 * Renders a 2-column grid of upload zones, one for each face of
 * the product packaging (Front, Back, Top, Bottom, Right, Left).
 *
 * Each zone is independent — tap to upload, tap × to remove.
 * All photos are stored in `data.packaging` as an object keyed
 * by the slot key (e.g., { packFront: { file, preview }, ... }).
 *
 * Requires at least 1 packaging photo to continue (not all 6).
 *
 * @param {object}   props
 * @param {object}   props.data     - Form data (data.packaging = { packFront, ... })
 * @param {Function} props.onChange  - Update form data
 * @param {Function} props.onNext   - Advance to next step
 * @param {Function} props.onBack   - Go to previous step
 */

import { useRef } from 'react'
import { T, btnPrimary, labelStyle } from '../tokens'
import { TOTAL_STEPS, PACKAGING_SLOTS } from '../config'
import useStepAnimation from '../hooks/useStepAnimation'
import StepHeader from './StepHeader'

export default function PackagingPhotosStep({ data, onChange, onNext, onBack }) {
  const anim = useStepAnimation()
  const fileRefs = useRef({})

  const packaging = data.packaging || {}
  const filledCount = PACKAGING_SLOTS.filter(s => !!packaging[s.key]).length
  const hasAtLeastOne = filledCount > 0

  /** Handle file selection for a specific slot */
  const handleFile = (slotKey, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange({
        packaging: {
          ...packaging,
          [slotKey]: { file, preview: ev.target.result },
        },
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  /** Remove a photo from a slot */
  const removePhoto = (slotKey) => {
    const updated = { ...packaging }
    delete updated[slotKey]
    onChange({ packaging: updated })
  }

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      <StepHeader step={3} total={TOTAL_STEPS} onBack={onBack} />

      <div style={{
        flex: 1, padding: "0 28px 40px",
        opacity: anim ? 1 : 0,
        transform: anim ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: T.serif, fontSize: 28, fontWeight: 300, color: T.black,
          lineHeight: 1.2, margin: "0 0 8px", letterSpacing: "-0.01em",
        }}>
          Packaging Photos
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 300,
          color: T.grey500, margin: "0 0 8px", lineHeight: 1.6,
        }}>
          Upload photos of each side of the product packaging
        </p>
        <p style={{
          fontFamily: T.sans, fontSize: 11, fontWeight: 500,
          color: T.gold, margin: "0 0 24px", letterSpacing: "0.08em",
        }}>
          {filledCount} / {PACKAGING_SLOTS.length} uploaded
        </p>

        {/* 2-column grid of upload zones */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 28,
        }}>
          {PACKAGING_SLOTS.map(({ key, label }) => {
            const photo = packaging[key]

            return (
              <div key={key}>
                {/* Slot label */}
                <p style={{
                  ...labelStyle,
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  marginBottom: 6,
                  color: photo ? T.gold : T.grey400,
                  transition: "color 0.3s ease",
                }}>
                  {label}
                </p>

                {/* Hidden file input */}
                <input
                  ref={el => fileRefs.current[key] = el}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(key, e)}
                  style={{ display: "none" }}
                />

                {!photo ? (
                  /* Empty upload zone */
                  <button
                    onClick={() => fileRefs.current[key]?.click()}
                    style={{
                      width: "100%",
                      height: 130,
                      border: "1.5px dashed " + T.grey200,
                      borderRadius: 14,
                      background: "linear-gradient(180deg, " + T.white + ", " + T.cream + ")",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                      transition: "all 0.3s " + T.ease,
                    }}
                  >
                    {/* Upload icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: T.grey50 || T.cream,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={T.grey400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span style={{
                      fontFamily: T.sans, fontSize: 10, color: T.grey400,
                      fontWeight: 300, letterSpacing: "0.02em",
                    }}>
                      Tap to upload
                    </span>
                  </button>
                ) : (
                  /* Photo preview with remove button */
                  <div style={{
                    position: "relative",
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid rgba(228, 225, 220, 0.7)",
                    boxShadow: T.shadow2,
                  }}>
                    <img
                      src={photo.preview}
                      alt={label}
                      style={{
                        width: "100%",
                        height: 130,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {/* Remove button */}
                    <button
                      onClick={() => removePhoto(key)}
                      style={{
                        position: "absolute", top: 6, right: 6,
                        width: 24, height: 24, borderRadius: "50%",
                        background: "rgba(0,0,0,0.55)", border: "none",
                        color: T.white, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      ×
                    </button>
                    {/* Retake button */}
                    <button
                      onClick={() => fileRefs.current[key]?.click()}
                      style={{
                        position: "absolute", bottom: 6, right: 6,
                        padding: "4px 10px", borderRadius: 100,
                        background: "rgba(0,0,0,0.55)", border: "none",
                        color: T.white, fontFamily: T.sans,
                        fontSize: 9, cursor: "pointer",
                        letterSpacing: "0.04em",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      Retake
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={onNext}
          disabled={!hasAtLeastOne}
          style={btnPrimary(hasAtLeastOne)}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
