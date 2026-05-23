import type { Puzzle, Cell } from './types.ts';
import { countSolutions } from './solver.ts';

// Mulberry32 seeded PRNG — returns a function that produces floats in [0, 1).
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getNeighborKeys(r: number, c: number, rows: number, cols: number): string[] {
  const result: string[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        result.push(`${nr},${nc}`);
      }
    }
  }
  return result;
}

function computeAdjacency(r: number, c: number, fishSet: Set<string>, rows: number, cols: number): number {
  return getNeighborKeys(r, c, rows, cols).filter(k => fishSet.has(k)).length;
}

export function generatePuzzle(rows: number, cols: number, fishCount: number, seed?: number): Puzzle {
  const actualSeed = seed !== undefined ? (seed >>> 0) : Math.floor(Math.random() * 4294967296);
  const rand = mulberry32(actualSeed);

  const totalCells = rows * cols;
  const clampedFish = Math.max(1, Math.min(fishCount, totalCells - 1));

  // Place fish randomly
  const allKeys: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) allKeys.push(`${r},${c}`);
  }

  const fishSet = new Set(shuffle(allKeys, rand).slice(0, clampedFish));

  // Build full clue set: all non-fish cells
  const clues = new Map<string, number>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (!fishSet.has(key)) {
        clues.set(key, computeAdjacency(r, c, fishSet, rows, cols));
      }
    }
  }

  // Greedy clue reduction: remove clues while puzzle stays uniquely solvable.
  // Try removing low-value clues first (they constrain less).
  const clueList = shuffle([...clues.entries()], rand).sort((a, b) => a[1] - b[1]);

  for (const [key, value] of clueList) {
    clues.delete(key);
    if (countSolutions(rows, cols, clues, 2) !== 1) {
      clues.set(key, value); // restore
    }
  }

  // Build grid
  const grid: Grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const key = `${r},${c}`;
      if (fishSet.has(key)) return { type: 'fish' } as Cell;
      const clue = clues.get(key);
      if (clue !== undefined) return { type: 'clue', value: clue } as Cell;
      return { type: 'blank' } as Cell;
    }),
  );

  return { rows, cols, grid, fishCount: clampedFish, seed: actualSeed };
}

type Grid = Cell[][];
