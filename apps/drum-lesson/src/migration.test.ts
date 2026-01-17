import { describe, it, expect } from "vitest";
import { migrateSongs, createVersionedStorage, CURRENT_VERSION } from "./migration";
import type { Song } from "./types";

describe("migrateSongs", () => {
  it("should return empty array for null input", () => {
    expect(migrateSongs(null)).toEqual([]);
  });

  it("should return empty array for undefined input", () => {
    expect(migrateSongs(undefined)).toEqual([]);
  });

  it("should migrate legacy v1 format (plain array of songs)", () => {
    const legacySongs = [
      {
        id: "song-1",
        name: "Test Song",
        bpm: 80,
        createdAt: 1234567890,
        measures: [
          {
            timeSignature: [4, 4],
            notes: [
              { instrument: "kick", beat: 0 },
              { instrument: "snare", beat: 1 },
              { instrument: "hihat", beat: 0.5 }, // 8th note position
            ],
          },
        ],
      },
    ];

    const result = migrateSongs(legacySongs);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("song-1");
    expect(result[0].name).toBe("Test Song");
    expect(result[0].measures[0].notes).toHaveLength(3);
    // 8th note positions should be preserved
    expect(result[0].measures[0].notes.find((n) => n.beat === 0.5)).toBeTruthy();
  });

  it("should handle versioned v2 format", () => {
    const versionedData = {
      version: 2,
      songs: [
        {
          id: "song-2",
          name: "16th Note Song",
          bpm: 90,
          createdAt: 1234567890,
          measures: [
            {
              timeSignature: [4, 4],
              notes: [
                { instrument: "kick", beat: 0 },
                { instrument: "hihat", beat: 0.25 }, // 16th note position
                { instrument: "hihat", beat: 0.5 },
                { instrument: "hihat", beat: 0.75 }, // 16th note position
              ],
            },
          ],
        },
      ],
    };

    const result = migrateSongs(versionedData);

    expect(result).toHaveLength(1);
    expect(result[0].measures[0].notes).toHaveLength(4);
    // 16th note positions should be preserved
    expect(result[0].measures[0].notes.find((n) => n.beat === 0.25)).toBeTruthy();
    expect(result[0].measures[0].notes.find((n) => n.beat === 0.75)).toBeTruthy();
  });

  it("should preserve existing 8th note songs in 16th note system", () => {
    // This is the key test: existing songs with 8th notes should work
    const existingSongs = [
      {
        id: "existing",
        name: "Basic Rock Beat",
        bpm: 80,
        createdAt: 1234567890,
        measures: [
          {
            timeSignature: [4, 4],
            notes: [
              // Hi-hat on every 8th note (original format)
              { instrument: "hihat", beat: 0 },
              { instrument: "hihat", beat: 0.5 },
              { instrument: "hihat", beat: 1 },
              { instrument: "hihat", beat: 1.5 },
              { instrument: "hihat", beat: 2 },
              { instrument: "hihat", beat: 2.5 },
              { instrument: "hihat", beat: 3 },
              { instrument: "hihat", beat: 3.5 },
              // Kick on 1 and 3
              { instrument: "kick", beat: 0 },
              { instrument: "kick", beat: 2 },
              // Snare on 2 and 4
              { instrument: "snare", beat: 1 },
              { instrument: "snare", beat: 3 },
            ],
          },
        ],
      },
    ];

    const result = migrateSongs(existingSongs);

    expect(result).toHaveLength(1);
    const notes = result[0].measures[0].notes;

    // All original notes should be preserved
    expect(notes).toHaveLength(12);

    // Verify specific beat positions are preserved
    const hihats = notes.filter((n) => n.instrument === "hihat");
    expect(hihats).toHaveLength(8);
    expect(hihats.map((n) => n.beat).sort((a, b) => a - b)).toEqual([
      0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5,
    ]);

    const kicks = notes.filter((n) => n.instrument === "kick");
    expect(kicks.map((n) => n.beat).sort((a, b) => a - b)).toEqual([0, 2]);

    const snares = notes.filter((n) => n.instrument === "snare");
    expect(snares.map((n) => n.beat).sort((a, b) => a - b)).toEqual([1, 3]);
  });

  it("should handle missing optional fields", () => {
    const incompleteSong = [
      {
        id: "incomplete",
        name: "Incomplete Song",
        // Missing bpm, createdAt
        measures: [{ timeSignature: [4, 4], notes: [] }],
      },
    ] as unknown as Song[];

    const result = migrateSongs(incompleteSong);

    expect(result[0].bpm).toBe(80); // Default BPM
    expect(typeof result[0].createdAt).toBe("number");
  });

  it("should filter invalid notes", () => {
    const songWithBadNotes = [
      {
        id: "bad-notes",
        name: "Bad Notes",
        bpm: 80,
        createdAt: 1234567890,
        measures: [
          {
            timeSignature: [4, 4],
            notes: [
              { instrument: "kick", beat: 0 }, // Valid
              { instrument: null, beat: 1 }, // Invalid - null instrument
              { instrument: "snare", beat: "two" }, // Invalid - string beat
              { instrument: "hihat", beat: 2 }, // Valid
            ],
          },
        ],
      },
    ] as unknown as Song[];

    const result = migrateSongs(songWithBadNotes);

    // Only valid notes should remain
    expect(result[0].measures[0].notes).toHaveLength(2);
    expect(result[0].measures[0].notes[0].instrument).toBe("kick");
    expect(result[0].measures[0].notes[1].instrument).toBe("hihat");
  });

  it("should return empty array for unknown format", () => {
    expect(migrateSongs("not an array")).toEqual([]);
    expect(migrateSongs(123)).toEqual([]);
    expect(migrateSongs({ random: "object" })).toEqual([]);
  });
});

describe("createVersionedStorage", () => {
  it("should create versioned storage with current version", () => {
    const songs: Song[] = [
      {
        id: "test",
        name: "Test",
        bpm: 80,
        createdAt: Date.now(),
        measures: [],
      },
    ];

    const result = createVersionedStorage(songs);

    expect(result.version).toBe(CURRENT_VERSION);
    expect(result.songs).toBe(songs);
  });
});
