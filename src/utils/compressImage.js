/**
 * @file compressImage.js
 * @description Client-side image compression using Canvas API.
 *
 * Resizes large photos before uploading to Cloudinary, dramatically
 * reducing upload time on slow factory floor Wi-Fi.
 *
 * Typical results:
 *   - 4MB phone photo → ~150-300KB compressed JPEG
 *   - Upload time: 8-15s → 1-3s on 3G
 *
 * How it works:
 *   1. Load the image File into an <img> element
 *   2. Draw it onto a <canvas> at reduced dimensions
 *   3. Export the canvas as a compressed JPEG Blob
 *   4. Return a new File object ready for upload
 *
 * @example
 * const compressed = await compressImage(originalFile)
 * // compressed.size is ~10-20x smaller than original
 */

import { IMAGE_CONFIG } from '../config'

/**
 * Compress an image file by resizing and converting to JPEG.
 *
 * @param {File} file - Original image file from input or camera
 * @returns {Promise<File>} Compressed JPEG file, smaller and faster to upload
 *
 * @throws {Error} If the image cannot be loaded (corrupt file, unsupported format)
 */
export async function compressImage(file) {
  // Skip compression for already-small files (under threshold)
  if (file.size <= IMAGE_CONFIG.SKIP_COMPRESSION_BELOW) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      const maxDim = IMAGE_CONFIG.MAX_DIMENSION

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round(height * (maxDim / width))
          width = maxDim
        } else {
          width = Math.round(width * (maxDim / height))
          height = maxDim
        }
      }

      // Draw to canvas at new size
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, width, height)

      // Export as compressed JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas compression failed"))
            return
          }

          // Create a new File object with a clean name
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          )

          console.log(
            `[compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB ` +
            `(${Math.round((1 - compressedFile.size / file.size) * 100)}% smaller)`
          )

          resolve(compressedFile)
        },
        "image/jpeg",
        IMAGE_CONFIG.JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image for compression"))
    }

    img.src = url
  })
}
