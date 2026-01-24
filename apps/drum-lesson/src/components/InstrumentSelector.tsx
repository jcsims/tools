import React from 'react';
import type { DrumInstrument } from '../types';
import { INSTRUMENT_INFO } from '../types';
import { SELECTABLE_INSTRUMENTS } from '../constants';
import './InstrumentSelector.css';

interface InstrumentSelectorProps {
  selectedInstrument: DrumInstrument;
  onSelectInstrument: (instrument: DrumInstrument) => void;
}

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = React.memo(({
  selectedInstrument,
  onSelectInstrument,
}) => {
  return (
    <div className="instrument-selector">
      <h4 className="selector-title">Select Instrument:</h4>
      <div className="instrument-grid">
        {SELECTABLE_INSTRUMENTS.map((instrument) => {
          const info = INSTRUMENT_INFO[instrument];
          const isSelected = selectedInstrument === instrument;
          return (
            <button
              key={instrument}
              className={`instrument-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectInstrument(instrument)}
              title={info.name}
              style={{
                '--instrument-color': info.color,
              } as React.CSSProperties}
            >
              <span className="instrument-symbol">{info.symbol}</span>
              <span className="instrument-name">{info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
