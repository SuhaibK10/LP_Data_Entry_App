/**
 * @file api.js
 * @description API layer for all external service communication.
 *
 * Handles:
 *   - Cloudinary image uploads (unsigned preset)
 *   - Google Sheets CRUD via Apps Script web app
 *
 * Design notes:
 *   - Writes use `no-cors` mode because Apps Script doesn't return
 *     proper CORS headers on POST. This means we can't read the response,
 *     but the write still succeeds. This is an acceptable trade-off for
 *     an internal tool.
 *   - Reads use standard `fetch` because Apps Script doGet() returns
 *     proper JSON with CORS support.
 *   - All functions are pure — no side effects beyond network calls.
 */

import { CONFIG } from './config'
import { compressImage } from './utils/compressImage'


// ── Photo Upload ──

/**
 * Upload a photo to Cloudinary.
 *
 * Accepts a photo object from the form state. If the object has a `.file`
 * property (user captured/selected a new photo), it compresses the image
 * first (resize + JPEG conversion), then uploads to Cloudinary.
 * If it only has a `.url` (existing photo from sheet), returns that URL
 * unchanged — this prevents re-uploading photos that weren't modified.
 *
 * Compression typically reduces 4MB phone photos to ~200KB,
 * making uploads 10-20x faster on slow networks.
 *
 * @param {object|null} photoObj - Photo object from form state
 * @param {File}   [photoObj.file]    - New file to upload
 * @param {string} [photoObj.url]     - Existing Cloudinary URL (edit mode)
 * @param {string} [photoObj.preview] - Data URL or Cloudinary URL for display
 * @returns {Promise<string|null>} Cloudinary secure URL, or null if no photo
 * @throws {Error} If Cloudinary returns an error response
 */
export async function uploadPhoto(photoObj) {
  if (!photoObj) return null

  // If photo already has a URL and no new file, skip upload (edit mode optimization)
  if (photoObj.url && !photoObj.file) return photoObj.url

  // No file to upload
  if (!photoObj.file) return null

  // Compress before uploading — dramatically speeds up upload on slow networks
  let fileToUpload = photoObj.file
  try {
    fileToUpload = await compressImage(photoObj.file)
  } catch (err) {
    console.warn("[api] Compression failed, uploading original:", err.message)
    // Fall through — upload the original uncompressed file
  }

  const formData = new FormData()
  formData.append("file", fileToUpload)
  formData.append("upload_preset", CONFIG.CLOUDINARY_UPLOAD_PRESET)
  formData.append("folder", "louis-polo-gs1")

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  const json = await response.json()

  if (json.secure_url) return json.secure_url
  throw new Error(json.error?.message || "Cloudinary upload failed")
}


// ── Google Sheets: Create ──

/**
 * Submit a new product to Google Sheets.
 *
 * Fires a POST request in `no-cors` mode (fire-and-forget).
 * The request body is JSON with product fields. Apps Script will
 * append a new row to the sheet.
 *
 * @param {object} payload - Product data to save
 * @param {string} payload.timestamp
 * @param {string} payload.productName
 * @param {string} payload.mrp
 * @param {string} payload.netWeight
 * @param {string} payload.grossWeight
 * @param {string} payload.frontPhotoUrls  - Comma-separated Cloudinary URLs
 * @param {string} payload.backPhotoUrl
 * @param {string} payload.packagingPhotoUrl
 * @returns {void}
 */
export function submitToSheets(payload) {
  if (!_isSheetsConfigured()) return

  fetch(CONFIG.GOOGLE_SHEETS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(err => console.error("[api] Sheet create error:", err))
}


// ── Google Sheets: Update ──

/**
 * Update an existing product row in Google Sheets.
 *
 * Same as submitToSheets, but includes `action: "update"` and `rowNumber`
 * so the Apps Script knows to overwrite instead of append.
 *
 * @param {object} payload - Product data with row reference
 * @param {number} payload.rowNumber - 1-indexed sheet row to update
 * @param {string} payload.productName
 * @param {string} payload.mrp
 * @param {string} payload.netWeight
 * @param {string} payload.grossWeight
 * @param {string} payload.frontPhotoUrls
 * @param {string} payload.backPhotoUrl
 * @param {string} payload.packagingPhotoUrl
 * @returns {void}
 */
export function updateInSheets(payload) {
  if (!_isSheetsConfigured()) return

  fetch(CONFIG.GOOGLE_SHEETS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", ...payload }),
  }).catch(err => console.error("[api] Sheet update error:", err))
}


// ── Google Sheets: Read ──

/**
 * Fetch all products from Google Sheets.
 *
 * Calls the Apps Script doGet() endpoint, which returns all rows
 * as a JSON array. Unlike writes, this uses standard CORS mode
 * so we can read the response.
 *
 * @returns {Promise<Product[]>} Array of product objects
 * @throws {Error} If the network request fails or the response is invalid
 *
 * @typedef {object} Product
 * @property {number} rowNumber         - Sheet row (1-indexed, row 1 = headers)
 * @property {string} timestamp         - IST formatted datetime
 * @property {string} productName
 * @property {string} mrp
 * @property {string} netWeight
 * @property {string} grossWeight
 * @property {string} frontPhotoUrls    - Comma-separated Cloudinary URLs
 * @property {string} backPhotoUrl
 * @property {string} packagingPhotoUrl
 */
export async function fetchProducts() {
  if (!_isSheetsConfigured()) return []

  try {
    const response = await fetch(CONFIG.GOOGLE_SHEETS_URL)
    const json = await response.json()

    if (json.status === "ok") {
      return json.products || []
    }

    throw new Error(json.message || "Unexpected response from Apps Script")
  } catch (err) {
    console.error("[api] Fetch products error:", err)
    throw err
  }
}


// ── Internal Helpers ──

/**
 * Check if Google Sheets is configured.
 * Logs a warning and returns false if using the placeholder URL.
 *
 * @returns {boolean}
 * @private
 */
function _isSheetsConfigured() {
  if (CONFIG.GOOGLE_SHEETS_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL") {
    console.warn("[api] Google Sheets not configured. Set CONFIG.GOOGLE_SHEETS_URL in src/config.js")
    return false
  }
  return true
}
