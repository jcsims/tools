import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Song, Measure, DrumInstrument } from "./types";
import { SAMPLE_SONGS } from "./types";
import { playDrumSound, resumeAudio } from "./audioEngine";
import { migrateSongs, createVersionedStorage } from "./migration";
import { beatsEqual } from "./beatUtils";
import { SUBDIVISION } from "./constants";
import { DrumNotation } from "./components/DrumNotation";
import { PlaybackControls } from "./components/PlaybackControls";
import { SongManager } from "./components/SongManager";
import { InstrumentSelector } from "./components/InstrumentSelector";
import { MeasureControls } from "./components/MeasureControls";
import { TabImportExport } from "./components/TabImportExport";
import "./App.css";

const STORAGE_KEY = "drum-lesson-songs";

function loadSongsFromStorage(): Song[] {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      return migrateSongs(parsed);
    } catch (e) {
      console.error("Failed to parse saved songs:", e);
    }
  }
  return [];
}

// Load once at module level to avoid double parsing during initialization
const initialSongs = loadSongsFromStorage();

function App() {
  // Initialize songs from localStorage with migration support
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [currentSong, setCurrentSong] = useState<Song | null>(
    initialSongs.length > 0 ? initialSongs[0] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number | null>(null);
  const [currentMeasure, setCurrentMeasure] = useState<number | null>(null);
  const [showSampleSongs, setShowSampleSongs] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInstrument, setSelectedInstrument] =
    useState<DrumInstrument>("kick");

  const playbackRef = useRef<number | null>(null);
  const lastBeatTimeRef = useRef<number>(0);

  // Cleanup playback on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
    };
  }, []);

  // Save songs to localStorage with versioned format
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createVersionedStorage(songs)));
  }, [songs]);

  // Helper to update both currentSong and songs list in one operation
  const updateCurrentSong = useCallback((updatedSong: Song) => {
    setCurrentSong(updatedSong);
    setSongs((prev) =>
      prev.map((s) => (s.id === updatedSong.id ? updatedSong : s))
    );
  }, []);

  const handleBpmChange = (newBpm: number) => {
    if (currentSong) {
      updateCurrentSong({ ...currentSong, bpm: newBpm });
    }
  };

  const playNotesAtBeat = useCallback((measure: Measure, beat: number) => {
    const notesToPlay = measure.notes.filter((note) =>
      beatsEqual(note.beat, beat),
    );
    notesToPlay.forEach((note) => {
      playDrumSound(note.instrument);
    });
  }, []);

  const stopPlayback = useCallback(() => {
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(null);
    setCurrentMeasure(null);
  }, []);

  const startPlayback = useCallback(async () => {
    if (!currentSong || currentSong.measures.length === 0) return;

    await resumeAudio();
    setIsPlaying(true);

    let measureIndex = 0;
    let beat = 0;
    const beatsPerMeasure = currentSong.measures[0].timeSignature[0];
    const beatDuration = (60 / currentSong.bpm) * 1000; // ms per beat
    const subdivisionDuration = beatDuration * SUBDIVISION;

    lastBeatTimeRef.current = performance.now();
    setCurrentMeasure(0);
    setCurrentBeat(0);

    // Play the first beat
    playNotesAtBeat(currentSong.measures[0], 0);

    const tick = () => {
      const now = performance.now();
      const elapsed = now - lastBeatTimeRef.current;

      if (elapsed >= subdivisionDuration) {
        lastBeatTimeRef.current = now - (elapsed % subdivisionDuration);

        beat += SUBDIVISION;

        if (beat >= beatsPerMeasure) {
          beat = 0;
          measureIndex++;

          if (measureIndex >= currentSong.measures.length) {
            // Loop back to start
            measureIndex = 0;
          }
        }

        setCurrentMeasure(measureIndex);
        setCurrentBeat(beat);

        // Play notes at this beat
        playNotesAtBeat(currentSong.measures[measureIndex], beat);
      }

      playbackRef.current = requestAnimationFrame(tick);
    };

    playbackRef.current = requestAnimationFrame(tick);
  }, [currentSong, playNotesAtBeat]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  const handleRestart = useCallback(() => {
    stopPlayback();
    if (currentSong) {
      setTimeout(() => startPlayback(), 100);
    }
  }, [currentSong, startPlayback, stopPlayback]);

  const handleSelectSong = (song: Song) => {
    stopPlayback();
    setCurrentSong(song);
  };

  const handleDeleteSong = (id: string) => {
    const remaining = songs.filter((s) => s.id !== id);
    setSongs(remaining);
    if (currentSong?.id === id) {
      setCurrentSong(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleRenameSong = (id: string, newName: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    );
    if (currentSong?.id === id) {
      setCurrentSong((prev) => (prev ? { ...prev, name: newName } : null));
    }
  };

  const handleAddSampleSong = (sample: (typeof SAMPLE_SONGS)[0]) => {
    const newSong: Song = {
      ...sample,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    setSongs((prev) => [...prev, newSong]);
    setCurrentSong(newSong);
    setShowSampleSongs(false);
  };

  const handleCreateSong = () => {
    const newSong: Song = {
      id: uuidv4(),
      name: "New Song",
      measures: [
        {
          notes: [],
          timeSignature: [4, 4],
        },
      ],
      bpm: 80,
      createdAt: Date.now(),
    };
    setSongs((prev) => [...prev, newSong]);
    setCurrentSong(newSong);
    setIsEditMode(true);
  };

  const handleTabImport = (name: string, measures: Measure[], bpm: number) => {
    const newSong: Song = {
      id: uuidv4(),
      name,
      measures,
      bpm,
      createdAt: Date.now(),
    };
    setSongs((prev) => [...prev, newSong]);
    setCurrentSong(newSong);
  };

  const handleNoteToggle = (
    measureIndex: number,
    beat: number,
    instrument: DrumInstrument,
  ) => {
    if (!currentSong) return;

    const updatedMeasures = [...currentSong.measures];
    const measure = { ...updatedMeasures[measureIndex] };
    const existingNoteIndex = measure.notes.findIndex(
      (n) => beatsEqual(n.beat, beat) && n.instrument === instrument,
    );

    if (existingNoteIndex >= 0) {
      // Remove existing note
      measure.notes = measure.notes.filter((_, i) => i !== existingNoteIndex);
    } else {
      // Add new note
      measure.notes = [...measure.notes, { instrument, beat }];
    }

    updatedMeasures[measureIndex] = measure;
    updateCurrentSong({ ...currentSong, measures: updatedMeasures });
  };

  const handleAddMeasure = () => {
    if (!currentSong) return;

    const lastMeasure = currentSong.measures[currentSong.measures.length - 1];
    const newMeasure: Measure = {
      notes: [],
      timeSignature: lastMeasure?.timeSignature || [4, 4],
    };

    updateCurrentSong({
      ...currentSong,
      measures: [...currentSong.measures, newMeasure],
    });
  };

  const handleRemoveMeasure = () => {
    if (!currentSong || currentSong.measures.length <= 1) return;

    updateCurrentSong({
      ...currentSong,
      measures: currentSong.measures.slice(0, -1),
    });
  };

  const toggleEditMode = () => {
    if (isPlaying) {
      stopPlayback();
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="header-icon">🥁</span>
          Drum Lesson Practice
        </h1>
        <p className="app-subtitle">Learn to play drums with fun!</p>
      </header>

      <main className="app-main">
        {currentSong ? (
          <>
            <div className="current-song-header">
              <h2 className="current-song-title">
                {isEditMode ? "Editing" : "Now Playing"}: {currentSong.name}
              </h2>
              <button
                className={`edit-mode-btn ${isEditMode ? "active" : ""}`}
                onClick={toggleEditMode}
              >
                {isEditMode ? "✓ Done Editing" : "✏️ Edit Song"}
              </button>
            </div>

            {isEditMode ? (
              <>
                <InstrumentSelector
                  selectedInstrument={selectedInstrument}
                  onSelectInstrument={setSelectedInstrument}
                />
                <MeasureControls
                  measureCount={currentSong.measures.length}
                  onAddMeasure={handleAddMeasure}
                  onRemoveMeasure={handleRemoveMeasure}
                />
              </>
            ) : (
              <PlaybackControls
                bpm={currentSong.bpm}
                onBpmChange={handleBpmChange}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onStop={stopPlayback}
                onRestart={handleRestart}
              />
            )}

            <DrumNotation
              measures={currentSong.measures}
              currentBeat={currentBeat}
              currentMeasure={currentMeasure}
              isEditMode={isEditMode}
              selectedInstrument={selectedInstrument}
              onNoteToggle={handleNoteToggle}
            />
          </>
        ) : (
          <div className="no-song-selected">
            <div className="welcome-message">
              <span className="welcome-icon">👋</span>
              <h2>Welcome to Drum Practice!</h2>
              <p>
                Get started by creating a new song or adding a sample song.
              </p>
            </div>
          </div>
        )}

        <div className="app-panels">
          <div className="panel">
            <SongManager
              songs={songs}
              currentSongId={currentSong?.id || null}
              onSelectSong={handleSelectSong}
              onDeleteSong={handleDeleteSong}
              onRenameSong={handleRenameSong}
              onCreateSong={handleCreateSong}
            />

            <div className="sample-songs-section">
              <button
                className="sample-songs-btn"
                onClick={() => setShowSampleSongs(!showSampleSongs)}
              >
                <span className="btn-icon">🎵</span>
                {showSampleSongs ? "Hide Sample Songs" : "Add Sample Song"}
              </button>

              {showSampleSongs && (
                <div className="sample-songs-list">
                  {SAMPLE_SONGS.map((sample, index) => (
                    <button
                      key={index}
                      className="sample-song-item"
                      onClick={() => handleAddSampleSong(sample)}
                    >
                      <span className="sample-name">{sample.name}</span>
                      <span className="sample-info">
                        {sample.measures.length} measure
                        {sample.measures.length !== 1 ? "s" : ""} • {sample.bpm}{" "}
                        BPM
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <TabImportExport
              currentSong={currentSong}
              onImport={handleTabImport}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Hover over notes to see which drum they are!
          <br />
          <span className="footer-tip">
            Tip: Start slow and increase the speed as you get better!
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
