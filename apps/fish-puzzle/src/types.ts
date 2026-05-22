export type CellType = 'fish' | 'clue' | 'blank';

export interface Cell {
  type: CellType;
  value?: number; // clue cells only
}

export type Grid = Cell[][];

export interface Puzzle {
  rows: number;
  cols: number;
  grid: Grid;
  fishCount: number;
}

export interface GridSize {
  rows: number;
  cols: number;
  label: string;
  defaultFish: number;
}

export const PRESET_SIZES: GridSize[] = [
  { rows: 5, cols: 5, label: 'Small (5×5)', defaultFish: 5 },
  { rows: 8, cols: 8, label: 'Medium (8×8)', defaultFish: 13 },
  { rows: 10, cols: 10, label: 'Large (10×10)', defaultFish: 20 },
];
