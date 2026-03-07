/**
 * @file config.js
 * @description External service configuration.
 *
 * All values here are safe to commit — they are public identifiers,
 * not secrets. Cloudinary uses unsigned upload presets; Apps Script
 * URLs are obscure but not secret.
 *
 * To configure for a new environment:
 *   1. Create a Cloudinary account → get cloud name
 *   2. Create an unsigned upload preset in Cloudinary settings
 *   3. Deploy the Apps Script (see backend/google-apps-script.js)
 *   4. Paste values below
 */

export const CONFIG = {
  /** Cloudinary cloud name — visible on the Cloudinary dashboard */
  CLOUDINARY_CLOUD_NAME: "dpepctqdj",

  /** Unsigned upload preset name — configured in Cloudinary → Settings → Upload */
  CLOUDINARY_UPLOAD_PRESET: "LP GS1",

  /**
   * Google Apps Script Web App URL.
   * Handles both GET (list products) and POST (create/update).
   * See backend/google-apps-script.js for the server-side code.
   */
  GOOGLE_SHEETS_URL: "https://script.google.com/macros/s/AKfycbz4_sJKeioLoI6z2WckvEtLw1foykmZUGcLf7ZkmWMsgPM0Cekd6r4kHjPaIU6nx-o/exec",
}

/**
 * Total number of form steps in the wizard.
 * Step 1: Name, Step 2: Rendered Photos (×3), Step 3: Pack Front,
 * Step 4: Pack Barcode, Step 5: Pack Back, Step 6: Specs
 */
export const TOTAL_STEPS = 6

/**
 * Maximum number of rendered product photos.
 */
export const MAX_RENDERED_PHOTOS = 3

/**
 * Image compression settings.
 *
 * Photos from phone cameras are typically 3-8MB.
 * Compressing to 1200px max dimension at 0.75 quality
 * reduces this to ~150-300KB — 10-20x smaller, 10-20x faster upload.
 *
 * Adjust JPEG_QUALITY (0.0 - 1.0) to trade quality vs. file size.
 * Set MAX_DIMENSION higher if you need more detail in product shots.
 */
export const IMAGE_CONFIG = {
  /** Max width or height in pixels. Maintains aspect ratio. */
  MAX_DIMENSION: 1200,

  /** JPEG compression quality (0.0 = max compression, 1.0 = no compression) */
  JPEG_QUALITY: 0.75,

  /** Skip compression for files already smaller than this (bytes) */
  SKIP_COMPRESSION_BELOW: 200 * 1024,  // 200KB
}
