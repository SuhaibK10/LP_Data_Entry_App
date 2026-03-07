/**
 * @file ReviewScreen.jsx
 * @description Pre-submit review — rendered photos, packaging photos, and data table.
 */

import { T, btnPrimary, labelStyle } from '../tokens'
import useStepAnimation from '../hooks/useStepAnimation'
import { normalizeFrontPhotos } from '../utils/helpers'

export default function ReviewScreen({ data, onSubmit, onBack, isEdit = false }) {
  const anim = useStepAnimation()

  const renderedPhotos = normalizeFrontPhotos(data.renderedPhotos)

  const dataRows = [
    ["Product",      data.productName],
    ["MRP",          "\u20B9" + data.mrp],
    ["Net Weight",   data.netWeight + " kg"],
    ["Gross Weight", data.grossWeight + " kg"],
  ]

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px 0" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 20,
        }}>
          <button onClick={onBack} style={{
            fontFamily: T.sans, fontSize: 13, color: T.grey700,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}>
            \u2190 Back
          </button>
          <span style={{
            fontFamily: T.sans, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase",
          }}>
            {isEdit ? "Edit Review" : "Review"}
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, padding: "0 28px 40px",
        opacity: anim ? 1 : 0,
        transform: anim ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>
        <h2 style={{
          fontFamily: T.serif, fontSize: 28, fontWeight: 300,
          color: T.black, lineHeight: 1.2, margin: "0 0 8px",
          letterSpacing: "-0.01em",
        }}>
          {isEdit ? "Confirm changes" : "Confirm details"}
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 300,
          color: T.grey500, margin: "0 0 28px",
        }}>
          {isEdit ? "Review your edits before updating" : "Review everything before submitting"}
        </p>

        {/* Rendered Photos — horizontal scroll */}
        {renderedPhotos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ ...labelStyle, marginBottom: 8 }}>
              Rendered Photos ({renderedPhotos.length})
            </p>
            <div style={{
              display: "flex", gap: 10,
              overflowX: "auto", paddingBottom: 6,
            }}>
              {renderedPhotos.map((p, i) => (
                <img
                  key={i}
                  src={p.preview}
                  alt={"Rendered " + (i + 1)}
                  style={{
                    width: 100, height: 100, objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid rgba(228, 225, 220, 0.7)",
                    boxShadow: T.shadow1,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Packaging Photos — row of 3 */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {[
            { img: data.packFront, lab: "Pack Front" },
            { img: data.packBarcode, lab: "Barcode Side" },
            { img: data.packBack, lab: "Pack Back" },
          ].map(({ img, lab }) => (
            <div key={lab} style={{ flex: 1 }}>
              <p style={{ ...labelStyle, marginBottom: 8, fontSize: 8 }}>{lab}</p>
              {img ? (
                <img src={img.preview} alt={lab} style={{
                  width: "100%", height: 85, objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid rgba(228, 225, 220, 0.7)",
                  boxShadow: T.shadow1,
                }} />
              ) : (
                <div style={{
                  width: "100%", height: 85, background: T.cream,
                  borderRadius: 10, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  border: "1px solid " + T.grey100,
                }}>
                  <span style={{ fontFamily: T.sans, fontSize: 10, color: T.grey400 }}>
                    No photo
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data table */}
        <div style={{
          background: T.white, borderRadius: 16,
          border: "1px solid rgba(228, 225, 220, 0.7)",
          boxShadow: T.shadow1,
          padding: "2px 0", marginBottom: 32,
          overflow: "hidden",
        }}>
          {dataRows.map(([key, value], i) => (
            <div key={key} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "15px 20px",
              borderBottom: i < dataRows.length - 1 ? "1px solid " + T.grey100 : "none",
            }}>
              <span style={{ fontFamily: T.sans, fontSize: 13, color: T.grey500, fontWeight: 300 }}>{key}</span>
              <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.black }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={onSubmit}
          style={{
            ...btnPrimary(true), background: T.black,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: T.shadow3,
          }}
        >
          {isEdit ? "Update Product" : "Submit Product"}
        </button>
      </div>
    </div>
  )
}
