/**
 * @file ProductListScreen.jsx
 * @description Browse and search all saved products.
 *
 * Features:
 *   - Fetches all products from Google Sheets via Apps Script doGet()
 *   - Search/filter by product name
 *   - Shows "Complete" or "N missing" status badges
 *   - Chips showing which specific fields are empty
 *   - Tap any product to open it in the edit flow
 *   - Pull-to-retry on error state
 *
 * Data flow:
 *   Component mount → fetchProducts() → display list
 *   Tap product → onEdit(product) → parent starts edit flow
 *
 * @param {object}   props
 * @param {Function} props.onBack - Navigate back to welcome
 * @param {Function} props.onEdit - Called with product object when user taps a row
 */

import { useState, useEffect } from 'react'
import { T, labelStyle } from '../tokens'
import { fetchProducts } from '../api'
import { getMissingFields, formatDate } from '../utils/helpers'
import useStepAnimation from '../hooks/useStepAnimation'

/**
 * Convert a Cloudinary URL into a small thumbnail URL.
 * Appends transformation params to request a 120×120 auto-quality image.
 * Returns null if no URL provided.
 *
 * @param {string} url - Full Cloudinary secure_url
 * @returns {string|null} Transformed thumbnail URL
 */
function cloudinaryThumb(url) {
  if (!url) return null
  // Handle comma-separated URLs — take the first one
  const firstUrl = url.includes(",") ? url.split(",")[0].trim() : url
  if (!firstUrl) return null
  return firstUrl.replace("/upload/", "/upload/w_120,h_120,c_fill,q_auto,f_auto/")
}

export default function ProductListScreen({ onBack, onEdit }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const anim = useStepAnimation()

  /** Fetch products on mount */
  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data.reverse()) // Newest first
    } catch (err) {
      setError(err.message || "Could not load products")
    } finally {
      setLoading(false)
    }
  }

  // Filter by search term
  const filtered = products.filter(p =>
    p.productName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: "100vh", background: T.white, display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 20,
        }}>
          <button onClick={onBack} style={{
            fontFamily: T.sans, fontSize: 13, color: T.grey700,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}>
            ← Back
          </button>
          <span style={{
            fontFamily: T.sans, fontSize: 10, fontWeight: 500,
            letterSpacing: "0.2em", color: T.gold, textTransform: "uppercase",
          }}>
            Products
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        flex: 1, padding: "0 28px 40px",
        opacity: anim ? 1 : 0,
        transform: anim ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s ease",
      }}>
        <h2 style={{
          fontFamily: T.serif, fontSize: 26, fontWeight: 300,
          color: T.black, lineHeight: 1.25, margin: "0 0 6px",
        }}>
          Saved products
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 300,
          color: T.grey500, margin: "0 0 24px",
        }}>
          Tap any product to view or edit its details
        </p>

        {/* ── Search ── */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={T.grey400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name..."
            style={{
              width: "100%", fontFamily: T.sans, fontSize: 14, color: T.black,
              background: T.cream, border: "1px solid " + T.grey100,
              borderRadius: 12, padding: "13px 16px 13px 42px", outline: "none",
              transition: "border-color 0.3s ease",
            }}
            onFocus={e => e.target.style.borderColor = T.grey400}
            onBlur={e => e.target.style.borderColor = T.grey100}
          />
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 36, height: 36, margin: "0 auto 16px",
              border: "2px solid " + T.grey200,
              borderTopColor: T.black, borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.grey500 }}>
              Loading products...
            </p>
          </div>
        )}

        {/* ── Error State ── */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#FEE", display: "flex", margin: "0 auto 16px",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 22, color: T.red }}>!</span>
            </div>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.red, marginBottom: 16 }}>
              {error}
            </p>
            <button onClick={loadProducts} style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 500,
              color: T.black, background: T.cream, border: "1px solid " + T.grey200,
              borderRadius: 100, padding: "10px 28px", cursor: "pointer",
            }}>
              Retry
            </button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T.grey400 }}>
              {search ? "No products match your search" : "No products yet"}
            </p>
          </div>
        )}

        {/* ── Product Cards ── */}
        {!loading && !error && filtered.map((product) => {
          const missing = getMissingFields(product)
          const isComplete = missing.length === 0
          const thumbUrl = cloudinaryThumb(product.renderedPhotoUrls)

          return (
            <button
              key={product.rowNumber}
              onClick={() => onEdit(product)}
              style={{
                display: "flex", width: "100%", textAlign: "left",
                alignItems: "flex-start", gap: 14,
                background: T.white,
                border: "1px solid rgba(228, 225, 220, 0.7)",
                borderRadius: 16, padding: "14px 16px",
                marginBottom: 12, cursor: "pointer",
                boxShadow: T.shadow1,
                transition: "all 0.35s " + T.ease,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = T.grey300
                e.currentTarget.style.boxShadow = T.shadow2
                e.currentTarget.style.transform = "translateY(-1px)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(228, 225, 220, 0.7)"
                e.currentTarget.style.boxShadow = T.shadow1
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Thumbnail */}
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt=""
                  style={{
                    width: 56, height: 56, borderRadius: 12,
                    objectFit: "cover", flexShrink: 0,
                    border: "1px solid rgba(228, 225, 220, 0.7)",
                    boxShadow: T.shadow1,
                    background: T.cream,
                  }}
                />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg, " + T.cream + ", " + (T.warmGrey || T.grey50) + ")",
                  border: "1px solid " + T.grey100,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={T.grey300} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + badge row */}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: T.sans, fontSize: 14, fontWeight: 500,
                      color: T.black, margin: "0 0 3px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {product.productName || "Unnamed Product"}
                    </p>
                    <p style={{
                      fontFamily: T.sans, fontSize: 11, color: T.grey500,
                      margin: 0, fontWeight: 300,
                    }}>
                      {product.mrp ? "₹" + product.mrp : "No MRP"}
                      {" · "}
                      {formatDate(product.timestamp)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontFamily: T.sans, fontSize: 9, fontWeight: 500,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: isComplete ? T.green : T.gold,
                    background: isComplete ? "rgba(39, 174, 96, 0.06)" : "rgba(184, 150, 90, 0.08)",
                    border: isComplete ? "1px solid rgba(39, 174, 96, 0.12)" : "1px solid rgba(184, 150, 90, 0.15)",
                    borderRadius: 100, padding: "4px 10px",
                    flexShrink: 0, whiteSpace: "nowrap", marginTop: 2,
                  }}>
                    {isComplete ? "Complete" : missing.length + " missing"}
                  </span>
                </div>

                {/* Missing field chips */}
                {!isComplete && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                    {missing.slice(0, 4).map(field => (
                      <span key={field} style={{
                        fontFamily: T.sans, fontSize: 9, fontWeight: 400,
                        color: T.grey500, background: T.cream,
                        border: "1px solid " + T.grey100,
                        borderRadius: 6, padding: "2px 7px",
                        letterSpacing: "0.02em",
                      }}>
                        {field}
                      </span>
                    ))}
                    {missing.length > 4 && (
                      <span style={{
                        fontFamily: T.sans, fontSize: 9, fontWeight: 400,
                        color: T.grey400,
                      }}>
                        +{missing.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}

        {/* ── Count Footer ── */}
        {!loading && !error && filtered.length > 0 && (
          <p style={{
            fontFamily: T.sans, fontSize: 11, color: T.grey400,
            textAlign: "center", marginTop: 16, letterSpacing: "0.04em",
          }}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {search ? " found" : " total"}
          </p>
        )}
      </div>
    </div>
  )
}
