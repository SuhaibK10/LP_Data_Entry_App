/**
 * @file useStepAnimation.js
 * @description Reusable hook for step enter animations.
 *
 * Provides a boolean `anim` that flips from false → true after a short
 * delay, triggering CSS transition-based reveal animations.
 *
 * Used by every form step and screen to create a consistent
 * slide-up-and-fade-in entrance.
 *
 * @example
 * const anim = useStepAnimation()
 * // In JSX:
 * <div style={{ opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(12px)" }}>
 */

import { useState, useEffect } from 'react'

/**
 * @param {number} [delay=50] - Delay in ms before triggering the animation
 * @returns {boolean} Whether the animation should be in its "entered" state
 */
export default function useStepAnimation(delay = 50) {
  const [anim, setAnim] = useState(false)

  useEffect(() => {
    setAnim(false)
    const timer = setTimeout(() => setAnim(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return anim
}
