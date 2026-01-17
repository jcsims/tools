import type { Song } from "./types";

/**
 * Storage format version for migration tracking.
 * Increment this when making breaking changes to the data format.
 */
export const CURRENT_VERSION = 2;

interface VersionedStorage {
  version: number;
  songs: Song[];
}

/**
 * Migrates songs from older formats to the current format.
 * Currently handles:
 * - v1 (implicit): Original 8th note format (no version field)
 * - v2: 16th note support (current)
 *
 * The migration is non-destructive - existing songs with 8th note beats
 * work fine with the 16th note system since beat values are floating point.
 */
export function migrateSongs(data: unknown): Song[] {
  // Handle null/undefined
  if (!data) {
    return [];
  }

  // Check if it's the new versioned format
  if (isVersionedStorage(data)) {
    // Already versioned, apply any necessary migrations
    return migrateFromVersion(data.version, data.songs);
  }

  // Legacy format: just an array of songs (v1)
  if (Array.isArray(data)) {
    return migrateFromVersion(1, data as Song[]);
  }

  // Unknown format
  console.warn("Unknown storage format, returning empty array");
  return [];
}

/**
 * Creates versioned storage data for saving.
 */
export function createVersionedStorage(songs: Song[]): VersionedStorage {
  return {
    version: CURRENT_VERSION,
    songs,
  };
}

/**
 * Type guard for versioned storage format.
 */
function isVersionedStorage(data: unknown): data is VersionedStorage {
  return (
    typeof data === "object" &&
    data !== null &&
    "version" in data &&
    "songs" in data &&
    typeof (data as VersionedStorage).version === "number" &&
    Array.isArray((data as VersionedStorage).songs)
  );
}

/**
 * Apply migrations from a specific version to current.
 */
function migrateFromVersion(fromVersion: number, songs: Song[]): Song[] {
  let migrated = songs;

  // v1 -> v2: No data transformation needed
  // 8th note beats (0.5 increments) work with 16th note system
  // Just validate the data structure
  if (fromVersion < 2) {
    migrated = migrated.map(validateAndMigrateSong);
  }

  return migrated;
}

/**
 * Validates and migrates a single song to ensure it has all required fields.
 */
function validateAndMigrateSong(song: Song): Song {
  // Ensure all required fields exist
  const migrated: Song = {
    id: song.id || crypto.randomUUID(),
    name: song.name || "Untitled Song",
    bpm: typeof song.bpm === "number" && song.bpm > 0 ? song.bpm : 80,
    createdAt: song.createdAt || Date.now(),
    measures: Array.isArray(song.measures)
      ? song.measures.map(validateMeasure)
      : [{ notes: [], timeSignature: [4, 4] as [number, number] }],
  };

  return migrated;
}

/**
 * Validates a measure structure.
 */
function validateMeasure(measure: unknown): Song["measures"][0] {
  if (typeof measure !== "object" || measure === null) {
    return { notes: [], timeSignature: [4, 4] as [number, number] };
  }

  const m = measure as Song["measures"][0];

  return {
    notes: Array.isArray(m.notes)
      ? m.notes.filter(
          (n) =>
            typeof n.instrument === "string" && typeof n.beat === "number"
        )
      : [],
    timeSignature: Array.isArray(m.timeSignature) && m.timeSignature.length === 2
      ? m.timeSignature
      : [4, 4],
  };
}
