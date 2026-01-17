import React from 'react';
import type { DrumInstrument } from '../types';
import { INSTRUMENT_INFO } from '../types';
import './InstrumentSelector.css';

interface InstrumentSelectorProps {
  selectedInstrument: DrumInstrument;
  onSelectInstrument: (instrument: DrumInstrument) => void;
}

const SELECTABLE_INSTRUMENTS: DrumInstrument[] = [
  'crash',
  'ride',
  'hihat',
  'hihat-open',
  'high-tom',
  'mid-tom',
  'floor-tom',
  'snare',
  'kick',
  'practice-pad',
];

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
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
};
