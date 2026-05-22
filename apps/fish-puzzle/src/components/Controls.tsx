import { useState } from 'react';
import { PRESET_SIZES } from '../types.ts';
import './Controls.css';

interface Props {
  onGenerate: (rows: number, cols: number, fishCount: number) => void;
  isGenerating: boolean;
}

export function Controls({ onGenerate, isGenerating }: Props) {
  const [sizeMode, setSizeMode] = useState<'preset' | 'custom'>('preset');
  const [presetIndex, setPresetIndex] = useState(1); // default medium
  const [customRows, setCustomRows] = useState(8);
  const [customCols, setCustomCols] = useState(8);
  const [fishCount, setFishCount] = useState(PRESET_SIZES[1].defaultFish);

  const currentRows = sizeMode === 'preset' ? PRESET_SIZES[presetIndex].rows : customRows;
  const currentCols = sizeMode === 'preset' ? PRESET_SIZES[presetIndex].cols : customCols;
  const maxFish = currentRows * currentCols - 1;

  function handlePresetChange(index: number) {
    setPresetIndex(index);
    setSizeMode('preset');
    setFishCount(PRESET_SIZES[index].defaultFish);
  }

  function handleCustomRowsChange(val: number) {
    const r = Math.max(3, Math.min(20, val));
    setCustomRows(r);
    setFishCount(Math.round(r * currentCols * 0.2));
  }

  function handleCustomColsChange(val: number) {
    const c = Math.max(3, Math.min(20, val));
    setCustomCols(c);
    setFishCount(Math.round(currentRows * c * 0.2));
  }

  function handleGenerate() {
    const clampedFish = Math.max(1, Math.min(fishCount, maxFish));
    onGenerate(currentRows, currentCols, clampedFish);
  }

  return (
    <div className="controls">
      <div className="control-group">
        <label className="control-label">Grid Size</label>
        <div className="size-buttons">
          {PRESET_SIZES.map((size, i) => (
            <button
              key={i}
              className={`size-btn${sizeMode === 'preset' && presetIndex === i ? ' active' : ''}`}
              onClick={() => handlePresetChange(i)}
            >
              {size.label}
            </button>
          ))}
          <button
            className={`size-btn${sizeMode === 'custom' ? ' active' : ''}`}
            onClick={() => setSizeMode('custom')}
          >
            Custom
          </button>
        </div>

        {sizeMode === 'custom' && (
          <div className="custom-size">
            <label>
              Rows
              <input
                type="number"
                min={3}
                max={20}
                value={customRows}
                onChange={e => handleCustomRowsChange(parseInt(e.target.value) || 3)}
              />
            </label>
            <span className="custom-sep">×</span>
            <label>
              Cols
              <input
                type="number"
                min={3}
                max={20}
                value={customCols}
                onChange={e => handleCustomColsChange(parseInt(e.target.value) || 3)}
              />
            </label>
          </div>
        )}
      </div>

      <div className="control-group">
        <label className="control-label">
          Fish Count
          <span className="fish-pct">
            {' '}({Math.round((Math.max(1, Math.min(fishCount, maxFish)) / (currentRows * currentCols)) * 100)}%)
          </span>
        </label>
        <div className="fish-count-row">
          <input
            type="range"
            min={1}
            max={maxFish}
            value={Math.max(1, Math.min(fishCount, maxFish))}
            onChange={e => setFishCount(parseInt(e.target.value))}
          />
          <input
            type="number"
            className="fish-number"
            min={1}
            max={maxFish}
            value={Math.max(1, Math.min(fishCount, maxFish))}
            onChange={e => setFishCount(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxFish)))}
          />
        </div>
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating…' : 'Generate Puzzle'}
      </button>
    </div>
  );
}
