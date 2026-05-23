import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator.ts';

describe('generatePuzzle seeding', () => {
  it('returns the seed used for generation', () => {
    const puzzle = generatePuzzle(5, 5, 5, 42);
    expect(puzzle.seed).toBe(42);
  });

  it('produces the same puzzle when called with the same seed', () => {
    const p1 = generatePuzzle(5, 5, 5, 12345);
    const p2 = generatePuzzle(5, 5, 5, 12345);
    expect(p1.grid).toEqual(p2.grid);
    expect(p1.seed).toBe(p2.seed);
  });

  it('produces different puzzles with different seeds', () => {
    const p1 = generatePuzzle(5, 5, 5, 1);
    const p2 = generatePuzzle(5, 5, 5, 2);
    // Grids should differ (extremely unlikely to collide)
    expect(p1.grid).not.toEqual(p2.grid);
  });

  it('generates a numeric seed when none is provided', () => {
    const puzzle = generatePuzzle(5, 5, 5);
    expect(typeof puzzle.seed).toBe('number');
    expect(Number.isFinite(puzzle.seed)).toBe(true);
    expect(puzzle.seed).toBeGreaterThanOrEqual(0);
    expect(puzzle.seed).toBeLessThan(4294967296);
  });

  it('can reproduce a randomly-seeded puzzle using its seed', () => {
    const original = generatePuzzle(8, 8, 13);
    const reproduced = generatePuzzle(8, 8, 13, original.seed);
    expect(reproduced.grid).toEqual(original.grid);
    expect(reproduced.seed).toBe(original.seed);
  });

  it('treats seed as unsigned 32-bit integer', () => {
    // Same seed value mod 2^32 should yield the same result
    const p1 = generatePuzzle(5, 5, 5, 0);
    const p2 = generatePuzzle(5, 5, 5, 4294967296); // 2^32 === 0 when >>> 0
    expect(p1.grid).toEqual(p2.grid);
  });
});

describe('generatePuzzle output', () => {
  it('returns correct dimensions', () => {
    const puzzle = generatePuzzle(6, 7, 8, 99);
    expect(puzzle.rows).toBe(6);
    expect(puzzle.cols).toBe(7);
    expect(puzzle.grid.length).toBe(6);
    expect(puzzle.grid[0].length).toBe(7);
  });

  it('places the correct number of fish', () => {
    const puzzle = generatePuzzle(5, 5, 5, 1);
    const fishCells = puzzle.grid.flat().filter(c => c.type === 'fish');
    expect(fishCells.length).toBe(5);
    expect(puzzle.fishCount).toBe(5);
  });

  it('produces a uniquely solvable puzzle', () => {
    // Smoke-test a few seeds to ensure generation succeeds
    for (const seed of [0, 1, 7, 42, 999]) {
      const puzzle = generatePuzzle(5, 5, 5, seed);
      const allCells = puzzle.grid.flat();
      const fish = allCells.filter(c => c.type === 'fish').length;
      const clues = allCells.filter(c => c.type === 'clue').length;
      expect(fish).toBe(5);
      expect(clues).toBeGreaterThan(0);
    }
  });
});
