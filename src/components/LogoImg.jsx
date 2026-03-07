/**
 * @file LogoImg.jsx
 * @description Brand logo component.
 *
 * Currently renders "LOUIS POLO" as styled text using Cormorant Garamond.
 * To replace with an actual image/SVG logo:
 *   1. Import your logo file
 *   2. Return an <img> or <svg> element
 *   3. Use the `size` prop to control dimensions
 *   4. Use the `invert` prop for light-on-dark contexts
 *
 * @param {object} props
 * @param {number} [props.size=48]    - Base size for scaling
 * @param {boolean} [props.invert=false] - True for white text (dark backgrounds)
 */

import { T } from '../tokens'

export default function LogoImg({ size = 48, invert = false }) {
  return (
    <span style={{
      fontFamily: T.serif,
      fontSize: size * 0.6,
      fontWeight: 400,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: invert ? T.white : T.black,
    }}>
      Louis Polo
    </span>
  )
}
