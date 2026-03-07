/**
 * @file PhotoStep.jsx
 * @description Dual-mode photo capture step.
 *
 * Supports two modes controlled by the `maxPhotos` prop:
 *
 * Single mode (maxPhotos=1, default):
 *   - Shows one photo preview with retake/remove
 *   - `photo` prop is an object: { file, preview } or { url, preview }
 *   - `onPhoto` receives object or null
 *
 * Multi mode (maxPhotos > 1):
 *   - Shows a grid of thumbnails with individual remove buttons
 *   - Counter display: "3 / 5 photos added"
 *   - "Add more photos" button when under limit
 *   - `photo` prop is an array of photo objects
 *   - `onPhoto` receives a functional updater: (prevArr) => newArr
 *
 * Photo object shape:
 *   { file: File, preview: "data:image/..." }   — new capture
 *   { url: "https://...", preview: "https://..." } — existing from sheet
 *
 * @param {object}   props
 * @param {string}   props.title      - Step heading (supports \n for line breaks)
 * @param {string}   props.subtitle   - Step description
 * @param {object|object[]} props.photo - Current photo(s)
 * @param {Function} props.onPhoto    - Update photo state
 * @param {Function} props.onNext     - Advance to next step
 * @param {Function} props.onBack     - Go to previous step
 * @param {number}   props.stepNum    - Current step number
 * @param {number}   props.totalSteps - Total steps in wizard
 * @param {number}   [props.maxPhotos=1] - Max photos allowed (1 = single mode)
 */

import { useRef } from 'react'
import { T, btnPrimary } from '../tokens'
import useStepAnimation from '../hooks/useStepAnimation'
import StepHeader from './StepHeader'

export default function PhotoStep({
  title, subtitle, photo, onPhoto,
  onNext, onBack, stepNum, totalSteps,
  maxPhotos = 1,
}) {
  const fileRef = useRef(null)
  const anim = useStepAnimation()

  // ── Mode detection ──
  const isMulti = maxPhotos > 1
  const photos = isMulti
    ? (Array.isArray(photo) ? photo : (photo ? [photo] : []))
    : null
  const hasPhoto = isMulti ? photos.length > 0 : !!photo
  const canAddMore = isMulti ? photos.length < maxPhotos : false

  // ── File handler ──
  const handleFile = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (isMulti) {
      // Multi mode: append files up to the limit
      const remaining = maxPhotos - photos.length
      const toProcess = files.slice(0, remaining)

      toProcess.forEach(file => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          onPhoto(prev => {
            const arr = Array.isArray(prev) ? [...prev] : (prev ? [prev] : [])
            if (arr.length < maxPhotos) {
              arr.push({ file, preview: ev.target.result })
            }
            return arr
          })
        }
        reader.readAsDataURL(file)
      })
    } else {
      // Single mode: replace the photo
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (ev) => onPhoto({ file, preview: ev.target.result })
      reader.readAsDataURL(file)
    }

    // Reset input so the same file can be re-selected
    e.target.value = ""
  }

  // ── Remove handler ──
  const removePhoto = (index) => {
    if (isMulti) {
      onPhoto(prev => {
        const arr = Array.isArray(prev) ? [...prev] : []
        arr.splice(index, 1)
        return arr
      })
    } else {
      onPhoto(null)
    }
  }

  // ── Shared icon for empty state ──
  const CameraIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke={T.grey400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      <StepHeader step={stepNum} total={totalSteps} onBack={onBack} />

      <div style={{
        flex: 1, padding: "0 28px 40px",
        opacity: anim ? 1 : 0,
        transform: anim ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: T.serif, fontSize: 28, fontWeight: 300, color: T.black,
          lineHeight: 1.2, margin: "0 0 8px", whiteSpace: "pre-line",
          letterSpacing: "-0.01em",
        }}>
          {title}
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 300,
          color: T.grey500, margin: "0 0 8px", lineHeight: 1.6,
        }}>
          {subtitle}
        </p>

        {/* Multi-mode counter */}
        {isMulti && (
          <p style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 500,
            color: T.gold, margin: "0 0 22px", letterSpacing: "0.08em",
          }}>
            {photos.length} / {maxPhotos} photos added
          </p>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef} type="file" accept="image/*"
          multiple={isMulti}
          onChange={handleFile}
          style={{ display: "none" }}
        />

        {/* ── MULTI-PHOTO GRID ── */}
        {isMulti && (
          <>
            {photos.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: photos.length === 1 ? "1fr" : "1fr 1fr",
                gap: 12, marginBottom: 16,
              }}>
                {photos.map((p, i) => (
                  <div key={i} style={{
                    position: "relative", borderRadius: 14, overflow: "hidden",
                    boxShadow: T.shadow2,
                    border: "1px solid rgba(228, 225, 220, 0.7)",
                  }}>
                    <img
                      src={p.preview}
                      alt={`Photo ${i + 1}`}
                      style={{
                        width: "100%",
                        height: photos.length === 1 ? 240 : 150,
                        objectFit: "cover", display: "block",
                        border: "1px solid " + T.grey100, borderRadius: 12,
                      }}
                    />
                    <button onClick={() => removePhoto(i)} style={{
                      position: "absolute", top: 8, right: 8,
                      width: 28, height: 28, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", border: "none",
                      color: T.white, fontSize: 15, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add more / empty state button */}
            {canAddMore && (
              <button onClick={() => fileRef.current?.click()} style={{
                width: "100%",
                height: photos.length === 0 ? 240 : 80,
                border: photos.length === 0 ? "1.5px dashed " + T.grey200 : "1.5px dashed " + T.grey200,
                borderRadius: 16,
                background: photos.length === 0 ? "linear-gradient(180deg, " + T.white + ", " + T.cream + ")" : T.cream,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 10, cursor: "pointer", marginBottom: 8,
                transition: "all 0.3s " + T.ease,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
              }}>
                {photos.length === 0 ? (
                  <>
                    <CameraIcon />
                    <span style={{ fontFamily: T.sans, fontSize: 14, color: T.grey500, fontWeight: 300 }}>
                      Choose from gallery
                    </span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span style={{ fontFamily: T.sans, fontSize: 12, color: T.grey500, fontWeight: 300 }}>
                      Add more photos
                    </span>
                  </>
                )}
              </button>
            )}
          </>
        )}

        {/* ── SINGLE-PHOTO VIEW ── */}
        {!isMulti && (
          <>
            {!photo ? (
              <button onClick={() => fileRef.current?.click()} style={{
                width: "100%", height: 280,
                border: "1.5px dashed " + T.grey200,
                borderRadius: 16,
                background: "linear-gradient(180deg, " + T.white + ", " + T.cream + ")",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 12, cursor: "pointer",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                transition: "all 0.3s " + T.ease,
              }}>
                <CameraIcon />
                <span style={{ fontFamily: T.sans, fontSize: 14, color: T.grey500, fontWeight: 300 }}>
                  Choose from gallery
                </span>
              </button>
            ) : (
              <div style={{
                position: "relative", borderRadius: 16, overflow: "hidden",
                boxShadow: T.shadow2,
                border: "1px solid rgba(228, 225, 220, 0.7)",
              }}>
                <img src={photo.preview} alt="Preview" style={{
                  width: "100%", height: 280, objectFit: "cover",
                  display: "block",
                }} />
                <button onClick={() => onPhoto(null)} style={{
                  position: "absolute", top: 12, right: 12,
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", border: "none",
                  color: T.white, fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  ×
                </button>
                <button onClick={() => fileRef.current?.click()} style={{
                  position: "absolute", bottom: 12, right: 12,
                  padding: "8px 16px", borderRadius: 100,
                  background: "rgba(0,0,0,0.6)", border: "none",
                  color: T.white, fontFamily: T.sans, fontSize: 12, cursor: "pointer",
                }}>
                  Retake
                </button>
              </div>
            )}
          </>
        )}

        {/* Continue button */}
        <button
          onClick={onNext}
          disabled={!hasPhoto}
          style={{ marginTop: 20, ...btnPrimary(hasPhoto) }}
        >
          Continue
        </button>

        {/* Skip / add later */}
        {!hasPhoto && (
          <button
            onClick={onNext}
            style={{
              width: "100%", marginTop: 10, padding: "13px 0",
              fontFamily: T.sans, fontSize: 13, fontWeight: 300,
              letterSpacing: "0.03em", color: T.grey500,
              background: "none", border: "none",
              cursor: "pointer", transition: "color 0.3s ease",
            }}
          >
            Add it later
          </button>
        )}
      </div>
    </div>
  )
}
