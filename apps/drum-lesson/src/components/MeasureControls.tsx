import React from 'react';
import './MeasureControls.css';

interface MeasureControlsProps {
  measureCount: number;
  onAddMeasure: () => void;
  onRemoveMeasure: () => void;
}

export const MeasureControls: React.FC<MeasureControlsProps> = React.memo(({
  measureCount,
  onAddMeasure,
  onRemoveMeasure,
}) => {
  return (
    <div className="measure-controls">
      <span className="measure-count">
        {measureCount} measure{measureCount !== 1 ? 's' : ''}
      </span>
      <div className="measure-buttons">
        <button
          className="measure-btn add"
          onClick={onAddMeasure}
          title="Add measure"
        >
          + Add Measure
        </button>
        <button
          className="measure-btn remove"
          onClick={onRemoveMeasure}
          disabled={measureCount <= 1}
          title={measureCount <= 1 ? 'Cannot remove last measure' : 'Remove last measure'}
        >
          - Remove Last
        </button>
      </div>
    </div>
  );
});
