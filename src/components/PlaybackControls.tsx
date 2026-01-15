import React from 'react';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onRestart: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  bpm,
  onBpmChange,
  isPlaying,
  onPlayPause,
  onStop,
  onRestart,
}) => {
  const handleBpmSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBpmChange(parseInt(e.target.value));
  };

  const handleBpmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 30 && value <= 200) {
      onBpmChange(value);
    }
  };

  return (
    <div className="playback-controls">
      <div className="control-group transport">
        <button
          className={`control-btn restart-btn`}
          onClick={onRestart}
          title="Restart"
        >
          ⏮
        </button>
        <button
          className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="control-btn stop-btn"
          onClick={onStop}
          title="Stop"
        >
          ⏹
        </button>
      </div>

      <div className="control-group bpm-control">
        <label className="bpm-label">
          <span className="bpm-icon">🥁</span>
          <span>Speed (BPM)</span>
        </label>
        <div className="bpm-slider-container">
          <span className="bpm-range-label">Slow</span>
          <input
            type="range"
            min="30"
            max="200"
            value={bpm}
            onChange={handleBpmSlider}
            className="bpm-slider"
          />
          <span className="bpm-range-label">Fast</span>
        </div>
        <div className="bpm-value-container">
          <input
            type="number"
            min="30"
            max="200"
            value={bpm}
            onChange={handleBpmInput}
            className="bpm-input"
          />
          <span className="bpm-unit">BPM</span>
        </div>
      </div>
    </div>
  );
};
