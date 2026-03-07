/**
 * @file tokens.js
 * @description Design tokens for the Louis Polo brand aesthetic.
 *
 * Brand direction: Luxury editorial minimalism.
 * Think Hermès internal tools — every detail deliberate,
 * every interaction feels expensive and considered.
 *
 * Key principles:
 *   - Layered shadows for depth (not flat)
 *   - Gold accents used sparingly for premium feel
 *   - Subtle borders that catch light
 *   - Generous spacing and breathing room
 *   - Micro-interactions that feel tactile
 */

// ── Color & Typography Tokens ──

export const T = {
  // Neutrals
  black:    "#0C0C0C",
  white:    "#FAF9F6",
  cream:    "#F2F0EB",
  warmGrey: "#F7F5F2",

  // Brand accent — warm gold with light variant
  gold:      "#B8965A",
  goldLight: "#D4B97C",
  goldMuted: "rgba(184, 150, 90, 0.08)",

  // Grey scale (900 = darkest, 100 = lightest)
  grey900:  "#1A1A1A",
  grey700:  "#4A4A4A",
  grey500:  "#7A7A7A",
  grey400:  "#999999",
  grey300:  "#B5B5B3",
  grey200:  "#D4D4D4",
  grey100:  "#E8E8E8",
  grey50:   "#F5F4F2",

  // Semantic
  red:      "#C0392B",
  green:    "#27AE60",

  // Font stacks
  serif:    "'Cormorant Garamond', Georgia, serif",
  sans:     "'Outfit', 'Helvetica Neue', sans-serif",

  // Easing curves
  ease:     "cubic-bezier(0.16, 1, 0.3, 1)",
  easeSlow: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeSnap: "cubic-bezier(0.34, 1.56, 0.64, 1)",

  // Layered shadows — creates depth without heaviness
  shadow1: "0 1px 2px rgba(12,12,12,0.04), 0 1px 3px rgba(12,12,12,0.03)",
  shadow2: "0 2px 8px rgba(12,12,12,0.06), 0 1px 2px rgba(12,12,12,0.04)",
  shadow3: "0 4px 16px rgba(12,12,12,0.08), 0 2px 4px rgba(12,12,12,0.04)",
  shadowGold: "0 4px 20px rgba(184, 150, 90, 0.15)",
  shadowLift: "0 8px 32px rgba(12,12,12,0.12), 0 2px 8px rgba(12,12,12,0.06)",
}


// ── Shared Component Styles ──

/**
 * Base input style — elegant underline with smooth focus transition.
 */
export const inputBase = {
  width: "100%",
  fontFamily: T.sans,
  fontSize: 17,
  fontWeight: 400,
  color: T.black,
  background: "transparent",
  border: "none",
  borderBottom: "1.5px solid " + T.grey200,
  padding: "12px 0",
  outline: "none",
  transition: "border-color 0.4s " + T.ease + ", box-shadow 0.4s " + T.ease,
}

/**
 * Primary button — refined with subtle border and shadow.
 * Feels tactile and expensive when tapped.
 */
export const btnPrimary = (enabled) => ({
  width: "100%",
  fontFamily: T.sans,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.08em",
  color: enabled ? T.white : T.grey400,
  background: enabled ? T.black : T.grey50,
  border: enabled ? "1px solid rgba(255,255,255,0.08)" : "1px solid " + T.grey200,
  borderRadius: 100,
  padding: "17px 0",
  cursor: enabled ? "pointer" : "not-allowed",
  transition: "all 0.4s " + T.ease,
  boxShadow: enabled ? T.shadow2 : "none",
  position: "relative",
  overflow: "hidden",
})

/**
 * Secondary / outline button style.
 * For less prominent actions like "View Products".
 */
export const btnSecondary = {
  fontFamily: T.sans,
  fontSize: 13,
  fontWeight: 400,
  letterSpacing: "0.05em",
  color: T.grey700,
  background: "transparent",
  border: "1px solid " + T.grey200,
  borderRadius: 100,
  padding: "13px 36px",
  cursor: "pointer",
  transition: "all 0.35s " + T.ease,
  boxShadow: T.shadow1,
}

/**
 * Elegant card wrapper — subtle border and layered shadow.
 * Used for product cards, review data sections, etc.
 */
export const cardStyle = {
  background: T.white,
  border: "1px solid rgba(228, 225, 220, 0.7)",
  borderRadius: 16,
  boxShadow: T.shadow1,
  transition: "all 0.35s " + T.ease,
}

/**
 * Elevated card — for interactive cards with hover state.
 */
export const cardElevated = {
  ...cardStyle,
  cursor: "pointer",
}

/**
 * Shared label style for form fields.
 * Uppercase, small, with subtle gold tracking.
 */
export const labelStyle = {
  fontFamily: T.sans,
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: T.grey400,
  display: "block",
  marginBottom: 10,
}

/**
 * Section heading style — for screen titles.
 */
export const headingStyle = {
  fontFamily: T.serif,
  fontSize: 28,
  fontWeight: 300,
  color: T.black,
  lineHeight: 1.2,
  margin: "0 0 8px",
  whiteSpace: "pre-line",
  letterSpacing: "-0.01em",
}

/**
 * Subtitle style — below headings.
 */
export const subtitleStyle = {
  fontFamily: T.sans,
  fontSize: 13,
  fontWeight: 300,
  color: T.grey500,
  margin: "0 0 32px",
  lineHeight: 1.6,
}

/**
 * Gold divider — thin horizontal accent line.
 */
export const goldDivider = (width = 28) => ({
  width,
  height: 1,
  background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
  margin: "24px 0",
  opacity: 0.6,
})
