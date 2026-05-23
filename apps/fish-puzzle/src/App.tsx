import { useState, useCallback } from 'react';
import { Controls } from './components/Controls.tsx';
import { PuzzleGrid } from './components/PuzzleGrid.tsx';
import { generatePuzzle } from './generator.ts';
import type { Puzzle } from './types.ts';
import './App.css';

export default function App() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [isSheet, setIsSheet] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback((rows: number, cols: number, fishCount: number, sheet: boolean, seed?: number) => {
    setIsGenerating(true);
    setShowSolution(false);

    // Defer to next tick so the disabled state renders first
    setTimeout(() => {
      const count = sheet ? 4 : 1;
      const generated = Array.from({ length: count }, (_, i) =>
        generatePuzzle(rows, cols, fishCount, seed !== undefined ? seed + i : undefined)
      );
      setPuzzles(generated);
      setIsSheet(sheet);
      setIsGenerating(false);
    }, 10);
  }, []);

  const hasPuzzles = puzzles.length > 0;
  const first = puzzles[0];

  return (
    <div className={`app${isSheet ? ' app-sheet' : ''}`}>
      <header className="app-header no-print">
        <h1>Fish Puzzle Generator</h1>
        <p className="app-desc">
          Find where the fish are hiding. Each number tells you how many fish are in the
          surrounding cells (including diagonals). Mark the fish in the blank squares.
        </p>
      </header>

      <div className="app-body">
        <div className="sidebar no-print">
          <Controls onGenerate={handleGenerate} isGenerating={isGenerating} />

          {hasPuzzles && first && (
            <div className="puzzle-info">
              {isSheet ? (
                <>
                  <span>Sheet: 4 × {first.rows}×{first.cols}</span>
                  <span>{first.fishCount} fish each</span>
                </>
              ) : (
                <>
                  <span>{first.rows}×{first.cols} grid</span>
                  <span>{first.fishCount} fish</span>
                  <span>{first.grid.flat().filter(c => c.type === 'clue').length} clues</span>
                  <span>Seed: {first.seed}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="puzzle-area">
          {hasPuzzles && first ? (
            <>
              <div className="print-header">
                <h2>Fish Puzzle{isSheet ? 's' : ''}</h2>
                <p>
                  {first.rows}×{first.cols} &mdash; {first.fishCount} fish to find
                  {isSheet ? ' (each)' : ` — Seed: ${first.seed}`}
                </p>
              </div>

              {isSheet ? (
                <div className="puzzle-sheet">
                  {puzzles.map((p, i) => (
                    <div key={i} className="sheet-item">
                      <div className="sheet-item-label">Puzzle {i + 1} — Seed: {p.seed}</div>
                      <PuzzleGrid puzzle={p} showSolution={showSolution} />
                    </div>
                  ))}
                </div>
              ) : (
                <PuzzleGrid puzzle={first} showSolution={showSolution} />
              )}

              {showSolution && (
                <div className="solution-label no-print">Solution shown</div>
              )}

              <div className="puzzle-actions no-print">
                <button
                  className="action-btn"
                  onClick={() => setShowSolution(s => !s)}
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleGenerate(first.rows, first.cols, first.fishCount, isSheet)}
                  disabled={isGenerating}
                >
                  Regenerate
                </button>
                <button className="action-btn print-btn" onClick={() => window.print()}>
                  Print
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🐟</span>
              <p>Configure a puzzle and click <strong>Generate Puzzle</strong> to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
