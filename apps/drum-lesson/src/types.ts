// Standard drum notation positions (from top to bottom on staff)
export type DrumInstrument =
  | 'crash'
  | 'ride'
  | 'hihat'
  | 'hihat-open'
  | 'high-tom'
  | 'mid-tom'
  | 'snare'
  | 'floor-tom'
  | 'kick'
  | 'rest';

export interface DrumNote {
  instrument: DrumInstrument;
  beat: number; // Position in the measure (0-based, can be fractional for 8th/16th notes)
}

export interface Measure {
  notes: DrumNote[];
  timeSignature: [number, number]; // e.g., [4, 4] for 4/4 time
}

export interface Song {
  id: string;
  name: string;
  measures: Measure[];
  bpm: number;
  createdAt: number;
}

export const INSTRUMENT_INFO: Record<DrumInstrument, { name: string; symbol: string; color: string; staffLine: number }> = {
  'crash': { name: 'Crash Cymbal', symbol: '✕', color: '#FFD700', staffLine: 0 },
  'ride': { name: 'Ride Cymbal', symbol: '✕', color: '#FFA500', staffLine: 0.5 },
  'hihat': { name: 'Hi-Hat (Closed)', symbol: '✕', color: '#90EE90', staffLine: 1 },
  'hihat-open': { name: 'Hi-Hat (Open)', symbol: '○', color: '#98FB98', staffLine: 1 },
  'high-tom': { name: 'Tom 1', symbol: '●', color: '#87CEEB', staffLine: 1.5 },
  'mid-tom': { name: 'Tom 2', symbol: '●', color: '#6495ED', staffLine: 2 },
  'snare': { name: 'Snare Drum', symbol: '●', color: '#FF6B6B', staffLine: 2.5 },
  'floor-tom': { name: 'Tom 3', symbol: '●', color: '#DDA0DD', staffLine: 3 },
  'kick': { name: 'Bass Drum (Kick)', symbol: '●', color: '#FF69B4', staffLine: 4 },
  'rest': { name: 'Rest', symbol: '𝄽', color: '#888888', staffLine: 2.5 },
};

// Sample songs for beginners
export const SAMPLE_SONGS: Omit<Song, 'id' | 'createdAt'>[] = [
  {
    name: 'Basic Rock Beat',
    bpm: 80,
    measures: [
      {
        timeSignature: [4, 4],
        notes: [
          // Hi-hat on every 8th note
          { instrument: 'hihat', beat: 0 },
          { instrument: 'hihat', beat: 0.5 },
          { instrument: 'hihat', beat: 1 },
          { instrument: 'hihat', beat: 1.5 },
          { instrument: 'hihat', beat: 2 },
          { instrument: 'hihat', beat: 2.5 },
          { instrument: 'hihat', beat: 3 },
          { instrument: 'hihat', beat: 3.5 },
          // Kick on 1 and 3
          { instrument: 'kick', beat: 0 },
          { instrument: 'kick', beat: 2 },
          // Snare on 2 and 4
          { instrument: 'snare', beat: 1 },
          { instrument: 'snare', beat: 3 },
        ],
      },
      {
        timeSignature: [4, 4],
        notes: [
          { instrument: 'hihat', beat: 0 },
          { instrument: 'hihat', beat: 0.5 },
          { instrument: 'hihat', beat: 1 },
          { instrument: 'hihat', beat: 1.5 },
          { instrument: 'hihat', beat: 2 },
          { instrument: 'hihat', beat: 2.5 },
          { instrument: 'hihat', beat: 3 },
          { instrument: 'hihat', beat: 3.5 },
          { instrument: 'kick', beat: 0 },
          { instrument: 'kick', beat: 2 },
          { instrument: 'snare', beat: 1 },
          { instrument: 'snare', beat: 3 },
        ],
      },
    ],
  },
  {
    name: 'Simple Kick & Snare',
    bpm: 70,
    measures: [
      {
        timeSignature: [4, 4],
        notes: [
          { instrument: 'kick', beat: 0 },
          { instrument: 'snare', beat: 1 },
          { instrument: 'kick', beat: 2 },
          { instrument: 'snare', beat: 3 },
        ],
      },
      {
        timeSignature: [4, 4],
        notes: [
          { instrument: 'kick', beat: 0 },
          { instrument: 'snare', beat: 1 },
          { instrument: 'kick', beat: 2 },
          { instrument: 'snare', beat: 3 },
        ],
      },
    ],
  },
  {
    name: 'Four on the Floor',
    bpm: 90,
    measures: [
      {
        timeSignature: [4, 4],
        notes: [
          { instrument: 'kick', beat: 0 },
          { instrument: 'kick', beat: 1 },
          { instrument: 'kick', beat: 2 },
          { instrument: 'kick', beat: 3 },
          { instrument: 'hihat', beat: 0.5 },
          { instrument: 'hihat', beat: 1.5 },
          { instrument: 'hihat', beat: 2.5 },
          { instrument: 'hihat', beat: 3.5 },
          { instrument: 'snare', beat: 1 },
          { instrument: 'snare', beat: 3 },
        ],
      },
    ],
  },
];
