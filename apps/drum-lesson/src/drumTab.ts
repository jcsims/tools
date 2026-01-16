import type { Song, Measure, DrumInstrument } from "./types";

// Mapping from our instrument types to standard tab line labels
const INSTRUMENT_TO_TAB: Record<DrumInstrument, string> = {
  crash: "CC",
  ride: "RD",
  hihat: "HH",
  "hihat-open": "HH", // Uses 'o' symbol instead of 'x'
  "high-tom": "T1",
  "mid-tom": "T2",
  snare: "SD",
  "floor-tom": "T3",
  kick: "BD",
  rest: "", // Not rendered
};

// Reverse mapping for parsing
const TAB_TO_INSTRUMENT: Record<string, DrumInstrument> = {
  CC: "crash",
  RD: "ride",
  HH: "hihat",
  T1: "high-tom",
  T2: "mid-tom",
  SD: "snare",
  SN: "snare", // Alternative label
  T3: "floor-tom",
  FT: "floor-tom", // Alternative label
  BD: "kick",
  KD: "kick", // Alternative label
};

// Order of instruments in tab output (top to bottom)
const TAB_ORDER: DrumInstrument[] = [
  "crash",
  "ride",
  "hihat",
  "high-tom",
  "mid-tom",
  "snare",
  "floor-tom",
  "kick",
];

/**
 * Export a song to ASCII drum tab format
 */
export function songToTab(song: Song): string {
  const lines: string[] = [];

  // Header with metadata
  lines.push(`# Song: ${song.name}`);
  lines.push(`# BPM: ${song.bpm}`);
  lines.push("");

  // Determine grid resolution (8th notes = 2 columns per beat)
  const subdivision = 0.5;
  const beatsPerMeasure = song.measures[0]?.timeSignature[0] || 4;
  const columnsPerMeasure = beatsPerMeasure / subdivision;

  // Build grid for each instrument
  for (const instrument of TAB_ORDER) {
    const label = INSTRUMENT_TO_TAB[instrument];
    if (!label) continue;

    let line = `${label}|`;

    for (const measure of song.measures) {
      for (let col = 0; col < columnsPerMeasure; col++) {
        const beat = col * subdivision;
        const note = measure.notes.find(
          (n) =>
            Math.abs(n.beat - beat) < 0.01 &&
            (n.instrument === instrument ||
              (instrument === "hihat" && n.instrument === "hihat-open"))
        );

        if (note) {
          if (note.instrument === "hihat-open") {
            line += "o"; // Open hi-hat
          } else if (
            instrument === "crash" ||
            instrument === "ride" ||
            instrument === "hihat"
          ) {
            line += "x"; // Cymbals use 'x'
          } else {
            line += "o"; // Drums use 'o'
          }
        } else {
          line += "-";
        }
      }
      line += "|";
    }

    lines.push(line);
  }

  // Add beat markers
  let beatLine = "  |";
  for (let m = 0; m < song.measures.length; m++) {
    for (let col = 0; col < columnsPerMeasure; col++) {
      const beat = col * subdivision;
      if (beat === Math.floor(beat)) {
        beatLine += (beat + 1).toString();
      } else {
        beatLine += "+";
      }
    }
    beatLine += "|";
  }
  lines.push(beatLine);

  return lines.join("\n");
}

/**
 * Parse ASCII drum tab format into a Song
 */
export function tabToSong(
  tabText: string
): { song: Omit<Song, "id" | "createdAt">; errors: string[] } | null {
  const lines = tabText.split("\n").map((l) => l.trim());
  const errors: string[] = [];

  // Parse header
  let name = "Imported Song";
  let bpm = 80;

  for (const line of lines) {
    if (line.startsWith("# Song:")) {
      name = line.replace("# Song:", "").trim();
    } else if (line.startsWith("# BPM:")) {
      const parsedBpm = parseInt(line.replace("# BPM:", "").trim(), 10);
      if (!isNaN(parsedBpm) && parsedBpm > 0 && parsedBpm <= 300) {
        bpm = parsedBpm;
      }
    }
  }

  // Find tab lines (lines with | separators that start with instrument labels)
  const tabLines: { instrument: DrumInstrument; content: string }[] = [];

  for (const line of lines) {
    if (line.includes("|") && !line.startsWith("#")) {
      // Extract label (first 2-3 characters before |)
      const match = line.match(/^([A-Z]{2,3})\|(.+)$/i);
      if (match) {
        const label = match[1].toUpperCase();
        const content = match[2];
        const instrument = TAB_TO_INSTRUMENT[label];

        if (instrument) {
          tabLines.push({ instrument, content });
        } else if (label !== "  " && !/^\d/.test(label)) {
          errors.push(`Unknown instrument label: ${label}`);
        }
      }
    }
  }

  if (tabLines.length === 0) {
    return null;
  }

  // Determine number of measures from the content
  const firstContent = tabLines[0].content;
  const measureStrings = firstContent.split("|").filter((s) => s.length > 0);
  const numMeasures = measureStrings.length;

  if (numMeasures === 0) {
    return null;
  }

  // Determine columns per measure from first measure
  const columnsPerMeasure = measureStrings[0].length;
  const subdivision = 0.5;
  const beatsPerMeasure = columnsPerMeasure * subdivision;

  // Build measures
  const measures: Measure[] = [];

  for (let m = 0; m < numMeasures; m++) {
    const notes: { instrument: DrumInstrument; beat: number }[] = [];

    for (const { instrument, content } of tabLines) {
      const measureParts = content.split("|").filter((s) => s.length > 0);
      const measureContent = measureParts[m] || "";

      for (let col = 0; col < measureContent.length; col++) {
        const char = measureContent[col].toLowerCase();
        const beat = col * subdivision;

        if (char === "x" || char === "o" || char === "X" || char === "O") {
          // Check for open hi-hat
          if (instrument === "hihat" && char === "o") {
            notes.push({ instrument: "hihat-open", beat });
          } else {
            notes.push({ instrument, beat });
          }
        }
      }
    }

    measures.push({
      notes,
      timeSignature: [beatsPerMeasure, 4] as [number, number],
    });
  }

  return {
    song: { name, bpm, measures },
    errors,
  };
}
