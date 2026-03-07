/**
 * @file helpers.js
 * @description Pure utility functions used across the app.
 */

/**
 * Product fields for completion checking.
 */
const PRODUCT_FIELDS = [
  { key: "productName",       label: "Name" },
  { key: "mrp",               label: "MRP" },
  { key: "netWeight",         label: "Net Wt" },
  { key: "grossWeight",       label: "Gross Wt" },
  { key: "renderedPhotoUrls", label: "Rendered Photos" },
  { key: "packFrontUrl",      label: "Pack Front" },
  { key: "packBarcodeUrl",    label: "Barcode Side" },
  { key: "packBackUrl",       label: "Pack Back" },
]

/**
 * Get the list of missing fields for a product.
 */
export function getMissingFields(product) {
  return PRODUCT_FIELDS
    .filter(({ key }) => !product[key])
    .map(({ label }) => label)
}

/**
 * Convert a sheet product into form-ready data for editing.
 */
export function productToFormData(product) {
  // Parse comma-separated rendered photo URLs
  const renderedUrls = product.renderedPhotoUrls
    ? product.renderedPhotoUrls.split(",").map(u => u.trim()).filter(Boolean)
    : []
  const renderedPhotos = renderedUrls.map(url => ({ url, preview: url }))

  const packFront = product.packFrontUrl
    ? { url: product.packFrontUrl, preview: product.packFrontUrl }
    : null
  const packBarcode = product.packBarcodeUrl
    ? { url: product.packBarcodeUrl, preview: product.packBarcodeUrl }
    : null
  const packBack = product.packBackUrl
    ? { url: product.packBackUrl, preview: product.packBackUrl }
    : null

  return {
    productName:    product.productName || "",
    mrp:            product.mrp ? String(product.mrp) : "",
    netWeight:      product.netWeight ? String(product.netWeight) : "",
    grossWeight:    product.grossWeight ? String(product.grossWeight) : "",
    renderedPhotos: renderedPhotos.length > 0 ? renderedPhotos : [],
    packFront,
    packBarcode,
    packBack,
  }
}

/**
 * Normalize photos to always be an array.
 */
export function normalizeFrontPhotos(photos) {
  if (Array.isArray(photos)) return photos
  if (photos) return [photos]
  return []
}

/**
 * Format a timestamp for display.
 */
export function formatDate(timestamp) {
  if (!timestamp) return ""
  try {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })
  } catch {
    return ""
  }
}
