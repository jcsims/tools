import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import type { Measure, DrumNote, DrumInstrument } from '../types';
import './OcrUpload.css';

interface OcrUploadProps {
  onSongDetected: (name: string, measures: Measure[]) => void;
}

export const OcrUpload: React.FC<OcrUploadProps> = ({ onSongDetected }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      console.log('OCR Result:', text);

      // Parse the text into drum notation
      const measures = parseOcrText(text);

      if (measures.length > 0) {
        // Extract a name from the image or use default
        const songName = extractSongName(text) || `Scanned Song ${new Date().toLocaleDateString()}`;
        onSongDetected(songName, measures);
      } else {
        setError(
          'Could not detect drum notation in this image. Try a clearer image with standard drum notation.'
        );
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process the image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const extractSongName = (text: string): string | null => {
    // Look for common patterns like "Title:", song names at the top, etc.
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // If first line looks like a title (not notation)
      if (firstLine.length > 0 && firstLine.length < 50 && !/^[xXoO\-\|]+$/.test(firstLine)) {
        return firstLine;
      }
    }
    return null;
  };

  const parseOcrText = (text: string): Measure[] => {
    const measures: Measure[] = [];
    const lines = text.split('\n').filter((l) => l.trim());

    // Standard drum tab format detection
    // H = hi-hat, S = snare, K/B = kick/bass, C = crash, R = ride, T = tom
    const instrumentMap: Record<string, DrumInstrument> = {
      'H': 'hihat',
      'HH': 'hihat',
      'S': 'snare',
      'SD': 'snare',
      'K': 'kick',
      'B': 'kick',
      'BD': 'kick',
      'C': 'crash',
      'CC': 'crash',
      'R': 'ride',
      'RC': 'ride',
      'T1': 'high-tom',
      'T2': 'mid-tom',
      'T3': 'floor-tom',
      'HT': 'high-tom',
      'MT': 'mid-tom',
      'FT': 'floor-tom',
    };

    // Try to parse as drum tablature format
    const tabLines: { instrument: DrumInstrument; pattern: string }[] = [];

    for (const line of lines) {
      // Look for lines like "HH|x-x-x-x-|" or "S: x---x---|"
      const tabMatch = line.match(/^([A-Z]{1,2})[:\|]?\s*([xXoO\-\.\s\|]+)/i);
      if (tabMatch) {
        const instrumentKey = tabMatch[1].toUpperCase();
        const pattern = tabMatch[2];
        const instrument = instrumentMap[instrumentKey];
        if (instrument) {
          tabLines.push({ instrument, pattern });
        }
      }
    }

    if (tabLines.length > 0) {
      // Parse tab notation
      const measureNotes: DrumNote[] = [];

      for (const tabLine of tabLines) {
        // Remove bar lines and spaces for consistent parsing
        const cleanPattern = tabLine.pattern.replace(/\|/g, '').replace(/\s/g, '');

        for (let i = 0; i < cleanPattern.length; i++) {
          const char = cleanPattern[i].toLowerCase();
          if (char === 'x' || char === 'o') {
            // Convert position to beat (assuming 8th notes by default)
            const beat = i * 0.5;
            measureNotes.push({
              instrument: char === 'o' && tabLine.instrument === 'hihat'
                ? 'hihat-open'
                : tabLine.instrument,
              beat: beat % 4, // Wrap to measure
            });
          }
        }
      }

      if (measureNotes.length > 0) {
        // Group notes into measures of 4 beats
        const maxBeat = Math.max(...measureNotes.map((n) => n.beat));
        const numMeasures = Math.ceil((maxBeat + 1) / 4);

        for (let m = 0; m < Math.max(1, numMeasures); m++) {
          const measureNotesFiltered = measureNotes.filter(
            (n) => Math.floor(n.beat / 4) === m || (numMeasures === 1)
          );
          measures.push({
            timeSignature: [4, 4],
            notes: measureNotesFiltered.map((n) => ({
              ...n,
              beat: n.beat % 4,
            })),
          });
        }
      }
    }

    // If no tab notation found, try to create a simple pattern from detected symbols
    if (measures.length === 0) {
      const simpleNotes: DrumNote[] = [];
      let beat = 0;

      // Look for X, O, or other common notation symbols
      const allText = text.toUpperCase();
      for (const char of allText) {
        if (char === 'X') {
          simpleNotes.push({ instrument: 'hihat', beat: beat % 4 });
          beat += 0.5;
        } else if (char === 'O') {
          simpleNotes.push({ instrument: 'kick', beat: beat % 4 });
          beat += 0.5;
        } else if (char === 'S') {
          simpleNotes.push({ instrument: 'snare', beat: beat % 4 });
          beat += 0.5;
        }
      }

      if (simpleNotes.length >= 4) {
        measures.push({
          timeSignature: [4, 4],
          notes: simpleNotes.slice(0, 16), // Limit to 2 measures worth
        });
      }
    }

    return measures;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="ocr-upload">
      <h3 className="ocr-title">
        <span className="title-icon">📷</span>
        Scan Drum Sheet
      </h3>

      <div
        className={`upload-zone ${isProcessing ? 'processing' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isProcessing ? (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Scanning image... {progress}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <button
                  className="clear-preview"
                  onClick={() => setPreviewUrl(null)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">🎼</span>
                <p>Drop an image here or use the buttons below</p>
                <p className="upload-hint">
                  Supports drum tablature and standard notation
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="upload-buttons">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
        />

        <button
          className="upload-btn file-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          <span className="btn-icon">📁</span>
          Choose File
        </button>

        <button
          className="upload-btn camera-btn"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessing}
        >
          <span className="btn-icon">📸</span>
          Take Photo
        </button>
      </div>

      <div className="ocr-tips">
        <h4>Tips for best results:</h4>
        <ul>
          <li>Use clear, high-contrast images</li>
          <li>Standard drum tablature works best (e.g., HH|x-x-x-x-|)</li>
          <li>Avoid blurry or skewed photos</li>
          <li>Crop the image to just the notation</li>
        </ul>
      </div>
    </div>
  );
};
