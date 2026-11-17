// Samples a damped spring's step response into a CSS `linear()` easing. Used by build-tokens.mjs.

/**
 * Step response of a damped harmonic oscillator, `t` in 0..1. The time axis is scaled so that `t = 1` is the first moment
 * after the single overshoot at which the curve is back on 1: one overshoot, then it settles, with no ringing to cut off.
 *
 * @param {number} dampingRatio under-damped, above 0 and below 1; 0.7 overshoots about 5%
 * @param {number} t progress through the spring, 0..1
 */
export function springAt(dampingRatio, t) {
  const slope = dampingRatio / Math.sqrt(1 - dampingRatio ** 2);
  // The response is 1 - e^(-slope x) (cos x + slope sin x). It first crosses 1 where cos x + slope sin x = 0, peaks half a
  // period later and crosses 1 again one period after the first crossing: that second crossing is t = 1.
  const end = Math.atan2(1, -slope) + Math.PI;
  const x = end * t;
  return 1 - Math.exp(-slope * x) * (Math.cos(x) + slope * Math.sin(x));
}

/**
 * The spring as `linear()` stops, rounded to 3 decimals. Deterministic: same input, same output. The first stop is exactly
 * 0 and the last exactly 1.
 *
 * @param {{ dampingRatio?: number, points?: number }} [options]
 * @returns {number[]}
 */
export function springStops({ dampingRatio = 0.7, points = 28 } = {}) {
  return Array.from({ length: points }, (_, i) => {
    if (i === 0) return 0;
    if (i === points - 1) return 1;
    return Math.round(springAt(dampingRatio, i / (points - 1)) * 1000) / 1000;
  });
}

/** The spring as a CSS `linear()` function. */
export function springLinear(options) {
  return `linear(${springStops(options).join(", ")})`;
}
