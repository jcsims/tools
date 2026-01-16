import React, { useState } from "react";
import type { Measure, DrumNote, DrumInstrument } from "../types";
import { INSTRUMENT_INFO } from "../types";
import "./DrumNotation.css";

interface DrumNotationProps {
  measures: Measure[];
  currentBeat: number | null;
  currentMeasure: number | null;
  isEditMode?: boolean;
  selectedInstrument?: DrumInstrument;
  onNoteToggle?: (
    measureIndex: number,
    beat: number,
    instrument: DrumInstrument,
  ) => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  instrument: DrumInstrument | null;
}

const STAFF_LINES = 5;
const LINE_SPACING = 20;
const BEAT_WIDTH = 60;
const NOTE_RADIUS = 10;

export const DrumNotation: React.FC<DrumNotationProps> = ({
  measures,
  currentBeat,
  currentMeasure,
  isEditMode = false,
  selectedInstrument = "kick",
  onNoteToggle,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    instrument: null,
  });

  const handleNoteHover = (e: React.MouseEvent, instrument: DrumInstrument) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      instrument,
    });
  };

  const handleNoteLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleNoteClick = (
    e: React.MouseEvent,
    measureIndex: number,
    note: DrumNote,
  ) => {
    if (!isEditMode || !onNoteToggle) return;
    e.stopPropagation();
    onNoteToggle(measureIndex, note.beat, note.instrument);
  };

  const getYPosition = (staffLine: number): number => {
    return 30 + staffLine * LINE_SPACING;
  };

  const getXPosition = (
    beat: number,
    measureIndex: number,
    beatsPerMeasure: number,
  ): number => {
    const measureWidth = beatsPerMeasure * BEAT_WIDTH;
    const measureStart = measureIndex * (measureWidth + 40) + 60; // 40px gap between measures
    return measureStart + beat * BEAT_WIDTH + BEAT_WIDTH / 2;
  };

  const renderNote = (
    note: DrumNote,
    measureIndex: number,
    beatsPerMeasure: number,
    noteIndex: number,
  ) => {
    const info = INSTRUMENT_INFO[note.instrument];
    const x = getXPosition(note.beat, measureIndex, beatsPerMeasure);
    const y = getYPosition(info.staffLine);

    const isActive =
      currentMeasure === measureIndex &&
      currentBeat !== null &&
      Math.abs(note.beat - currentBeat) < 0.1;

    const isCymbal = ["crash", "ride", "hihat", "hihat-open"].includes(
      note.instrument,
    );

    return (
      <g
        key={`${measureIndex}-${noteIndex}-${note.beat}-${note.instrument}`}
        className={`drum-note ${isActive ? "active" : ""} ${isEditMode ? "editable" : ""}`}
        onMouseEnter={(e) => handleNoteHover(e, note.instrument)}
        onMouseLeave={handleNoteLeave}
        onClick={(e) => handleNoteClick(e, measureIndex, note)}
        style={{ cursor: isEditMode ? "pointer" : "default" }}
      >
        {isCymbal ? (
          // X symbol for cymbals
          <>
            <line
              x1={x - NOTE_RADIUS}
              y1={y - NOTE_RADIUS}
              x2={x + NOTE_RADIUS}
              y2={y + NOTE_RADIUS}
              stroke={info.color}
              strokeWidth={isActive ? 4 : 3}
              className="note-symbol"
            />
            <line
              x1={x + NOTE_RADIUS}
              y1={y - NOTE_RADIUS}
              x2={x - NOTE_RADIUS}
              y2={y + NOTE_RADIUS}
              stroke={info.color}
              strokeWidth={isActive ? 4 : 3}
              className="note-symbol"
            />
            {note.instrument === "hihat-open" && (
              <circle
                cx={x}
                cy={y}
                r={NOTE_RADIUS + 4}
                fill="none"
                stroke={info.color}
                strokeWidth={2}
              />
            )}
          </>
        ) : (
          // Filled circle for drums
          <circle
            cx={x}
            cy={y}
            r={NOTE_RADIUS}
            fill={info.color}
            stroke={isActive ? "#fff" : info.color}
            strokeWidth={isActive ? 3 : 1}
            className="note-symbol"
          />
        )}
        {/* Note stem */}
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y - 35}
          stroke={info.color}
          strokeWidth={2}
        />
        {/* Invisible larger hit area for touch/hover */}
        <circle cx={x} cy={y} r={NOTE_RADIUS + 8} fill="transparent" />
      </g>
    );
  };

  const renderMeasure = (measure: Measure, measureIndex: number) => {
    const beatsPerMeasure = measure.timeSignature[0];
    const measureWidth = beatsPerMeasure * BEAT_WIDTH;
    const measureStart = measureIndex * (measureWidth + 40) + 60;

    return (
      <g key={measureIndex}>
        {/* Clickable area for adding notes in edit mode */}
        {isEditMode && (
          <rect
            x={measureStart}
            y={20}
            width={measureWidth}
            height={STAFF_LINES * LINE_SPACING + 10}
            fill="rgba(33, 150, 243, 0.1)"
            stroke="rgba(33, 150, 243, 0.3)"
            strokeWidth={1}
            strokeDasharray="4 2"
            rx={4}
            style={{ cursor: "crosshair" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const beatPosition = (clickX - BEAT_WIDTH / 2) / BEAT_WIDTH;
              const snappedBeat = Math.round(beatPosition * 2) / 2;
              if (
                snappedBeat >= 0 &&
                snappedBeat < beatsPerMeasure &&
                onNoteToggle
              ) {
                onNoteToggle(measureIndex, snappedBeat, selectedInstrument);
              }
            }}
          />
        )}

        {/* Time signature */}
        {measureIndex === 0 && (
          <text x={20} y={70} className="time-signature">
            <tspan x={20} dy={0}>
              {measure.timeSignature[0]}
            </tspan>
            <tspan x={20} dy={25}>
              {measure.timeSignature[1]}
            </tspan>
          </text>
        )}

        {/* Staff lines */}
        {Array.from({ length: STAFF_LINES }).map((_, lineIndex) => (
          <line
            key={lineIndex}
            x1={measureStart}
            y1={30 + lineIndex * LINE_SPACING}
            x2={measureStart + measureWidth}
            y2={30 + lineIndex * LINE_SPACING}
            stroke="#666"
            strokeWidth={1}
          />
        ))}

        {/* Beat markers */}
        {Array.from({ length: beatsPerMeasure + 1 }).map((_, beatIndex) => (
          <React.Fragment key={beatIndex}>
            <line
              x1={measureStart + beatIndex * BEAT_WIDTH}
              y1={25}
              x2={measureStart + beatIndex * BEAT_WIDTH}
              y2={30 + (STAFF_LINES - 1) * LINE_SPACING + 5}
              stroke={
                beatIndex === 0 || beatIndex === beatsPerMeasure
                  ? "#666"
                  : "#444"
              }
              strokeWidth={
                beatIndex === 0 || beatIndex === beatsPerMeasure ? 2 : 1
              }
            />
            {beatIndex < beatsPerMeasure && (
              <text
                x={measureStart + beatIndex * BEAT_WIDTH + BEAT_WIDTH / 2}
                y={30 + (STAFF_LINES - 1) * LINE_SPACING + 25}
                className="beat-number"
              >
                {beatIndex + 1}
              </text>
            )}
          </React.Fragment>
        ))}

        {/* Measure number */}
        <text
          x={measureStart + measureWidth / 2}
          y={15}
          className="measure-number"
        >
          Measure {measureIndex + 1}
        </text>

        {/* Notes */}
        {measure.notes.map((note, noteIndex) =>
          renderNote(note, measureIndex, beatsPerMeasure, noteIndex),
        )}

        {/* Playhead */}
        {currentMeasure === measureIndex && currentBeat !== null && (
          <line
            x1={measureStart + currentBeat * BEAT_WIDTH + BEAT_WIDTH / 2}
            y1={20}
            x2={measureStart + currentBeat * BEAT_WIDTH + BEAT_WIDTH / 2}
            y2={30 + (STAFF_LINES - 1) * LINE_SPACING + 10}
            stroke="#00ff88"
            strokeWidth={3}
            opacity={0.7}
            className="playhead"
          />
        )}
      </g>
    );
  };

  const totalWidth = measures.reduce((acc, measure) => {
    return acc + measure.timeSignature[0] * BEAT_WIDTH + 40;
  }, 60);

  return (
    <div className="drum-notation-container">
      <div className="notation-legend">
        <h4>Drum Legend:</h4>
        <div className="legend-items">
          {Object.entries(INSTRUMENT_INFO)
            .filter(([key]) => key !== "rest")
            .map(([key, info]) => (
              <div key={key} className="legend-item">
                <span className="legend-symbol" style={{ color: info.color }}>
                  {info.symbol}
                </span>
                <span className="legend-name">{info.name}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="notation-scroll">
        <svg
          width={Math.max(totalWidth, 400)}
          height={180}
          className="drum-notation-svg"
        >
          {measures.map((measure, index) => renderMeasure(measure, index))}
        </svg>
      </div>

      {tooltip.visible && tooltip.instrument && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div className="tooltip-name">
            {INSTRUMENT_INFO[tooltip.instrument].name}
          </div>
          <div
            className="tooltip-symbol"
            style={{ color: INSTRUMENT_INFO[tooltip.instrument].color }}
          >
            {INSTRUMENT_INFO[tooltip.instrument].symbol}
          </div>
        </div>
      )}
    </div>
  );
};
