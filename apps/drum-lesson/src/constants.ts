import type { DrumInstrument } from "./types";

/**
 * Notation display constants
 */
export const STAFF_LINES = 5;
export const LINE_SPACING = 20;
export const BEAT_WIDTH = 100;
export const NOTE_RADIUS = 10;

/**
 * Playback constants
 */
export const SUBDIVISION = 0.25; // 16th notes

/**
 * Instruments available for selection in edit mode.
 * Excludes 'rest' which is not a playable instrument.
 */
export const SELECTABLE_INSTRUMENTS: DrumInstrument[] = [
  "crash",
  "ride",
  "hihat",
  "hihat-open",
  "high-tom",
  "mid-tom",
  "floor-tom",
  "snare",
  "kick",
  "practice-pad",
];
