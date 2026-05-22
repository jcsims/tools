import type { Puzzle } from '../types.ts';
import './PuzzleGrid.css';

interface Props {
  puzzle: Puzzle;
  showSolution: boolean;
}

export function PuzzleGrid({ puzzle, showSolution }: Props) {
  const { grid, rows, cols } = puzzle;

  return (
    <div className="puzzle-grid-wrapper">
      <table className="puzzle-grid" style={{ '--cols': cols } as React.CSSProperties}>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => {
                const cell = grid[r][c];
                let className = 'puzzle-cell';
                let content: React.ReactNode = null;

                if (cell.type === 'clue') {
                  className += ' cell-clue';
                  content = cell.value === 0 ? <span className="clue-zero">0</span> : cell.value;
                } else if (cell.type === 'fish') {
                  if (showSolution) {
                    className += ' cell-fish-revealed';
                    content = '🐟';
                  } else {
                    className += ' cell-blank';
                  }
                } else {
                  className += ' cell-blank';
                }

                return <td key={c} className={className}>{content}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
