type CellState = 'unknown' | 'fish' | 'empty';

function getNeighbors(r: number, c: number, rows: number, cols: number): [number, number][] {
  const result: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        result.push([nr, nc]);
      }
    }
  }
  return result;
}

// Returns propagated state, or null if contradiction
function propagate(
  state: CellState[][],
  clues: Map<string, number>,
  rows: number,
  cols: number,
): CellState[][] | null {
  const s = state.map(row => [...row]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [key, value] of clues) {
      const [r, c] = key.split(',').map(Number);
      const nbrs = getNeighbors(r, c, rows, cols);
      let fish = 0, unknown = 0;
      for (const [nr, nc] of nbrs) {
        if (s[nr][nc] === 'fish') fish++;
        else if (s[nr][nc] === 'unknown') unknown++;
      }
      if (fish > value || fish + unknown < value) return null;
      if (fish === value) {
        for (const [nr, nc] of nbrs) {
          if (s[nr][nc] === 'unknown') { s[nr][nc] = 'empty'; changed = true; }
        }
      } else if (fish + unknown === value) {
        for (const [nr, nc] of nbrs) {
          if (s[nr][nc] === 'unknown') { s[nr][nc] = 'fish'; changed = true; }
        }
      }
    }
  }
  return s;
}

// Count solutions up to maxCount. Pass stopAt=2 for uniqueness check.
export function countSolutions(
  rows: number,
  cols: number,
  clues: Map<string, number>,
  maxCount = 2,
): number {
  const initial: CellState[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      clues.has(`${r},${c}`) ? 'empty' : 'unknown',
    ),
  );

  let count = 0;
  let iterations = 0;
  const MAX_ITER = 200_000;

  function solve(state: CellState[][]): void {
    if (count >= maxCount || ++iterations > MAX_ITER) return;

    const s = propagate(state, clues, rows, cols);
    if (s === null) return;

    let unknownR = -1, unknownC = -1;
    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (s[r][c] === 'unknown') { unknownR = r; unknownC = c; break outer; }
      }
    }

    if (unknownR === -1) {
      count++;
      return;
    }

    for (const val of ['fish', 'empty'] as const) {
      if (count >= maxCount) return;
      const next = s.map(row => [...row]);
      next[unknownR][unknownC] = val;
      solve(next);
    }
  }

  solve(initial);
  return count;
}

// Extract the fish positions from a solved state (for validation)
export function extractSolution(
  rows: number,
  cols: number,
  clues: Map<string, number>,
): boolean[][] | null {
  const initial: CellState[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      clues.has(`${r},${c}`) ? 'empty' : 'unknown',
    ),
  );

  const s = propagate(initial, clues, rows, cols);
  if (s === null) return null;

  // Check all cells are determined
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (s[r][c] === 'unknown') return null;
    }
  }

  return s.map(row => row.map(cell => cell === 'fish'));
}
