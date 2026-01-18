/**
 * Utility functions for beat-related calculations.
 * Centralizes floating-point beat comparison logic used throughout the app.
 */

/** Tolerance for floating-point beat comparisons */
const BEAT_EPSILON = 0.01;

/**
 * Check if two beat positions are equal within floating-point tolerance.
 */
export function beatsEqual(beat1: number, beat2: number): boolean {
  return Math.abs(beat1 - beat2) < BEAT_EPSILON;
}

/**
 * Snap a beat position to the nearest subdivision (e.g., 16th notes = 0.25).
 */
export function snapToSubdivision(beat: number, subdivision: number = 0.25): number {
  return Math.round(beat / subdivision) * subdivision;
}
