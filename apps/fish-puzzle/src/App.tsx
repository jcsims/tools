import { useState, useCallback } from 'react';
import { Controls } from './components/Controls.tsx';
import { PuzzleGrid } from './components/PuzzleGrid.tsx';
import { generatePuzzle } from './generator.ts';
import type { Puzzle } from './types.ts';
import './App.css';

export default function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [clueCount, setClueCount] = useState(0);

  const handleGenerate = useCallback((rows: number, cols: number, fishCount: number) => {
    setIsGenerating(true);
    setShowSolution(false);

    // Defer to next tick so the disabled state renders first
    setTimeout(() => {
      const p = generatePuzzle(rows, cols, fishCount);
      const clues = p.grid.flat().filter(c => c.type === 'clue').length;
      setPuzzle(p);
      setClueCount(clues);
      setIsGenerating(false);
    }, 10);
  }, []);

  return (
    <div className="app">
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

          {puzzle && (
            <div className="puzzle-info">
              <span>{puzzle.rows}×{puzzle.cols} grid</span>
              <span>{puzzle.fishCount} fish</span>
              <span>{clueCount} clues</span>
            </div>
          )}
        </div>

        <div className="puzzle-area">
          {puzzle ? (
            <>
              <div className="print-header">
                <h2>Fish Puzzle</h2>
                <p>{puzzle.rows}×{puzzle.cols} &mdash; {puzzle.fishCount} fish to find</p>
              </div>

              <PuzzleGrid puzzle={puzzle} showSolution={showSolution} />

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
                  onClick={() => handleGenerate(puzzle.rows, puzzle.cols, puzzle.fishCount)}
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
