import { useState } from "react";
import type { Song, Measure } from "../types";
import { songToTab, tabToSong } from "../drumTab";
import "./TabImportExport.css";

interface TabImportExportProps {
  currentSong: Song | null;
  onImport: (name: string, measures: Measure[], bpm: number) => void;
}

export function TabImportExport({
  currentSong,
  onImport,
}: TabImportExportProps) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"import" | "export">("export");
  const [importText, setImportText] = useState("");
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const handleExport = () => {
    setMode("export");
    setShowModal(true);
  };

  const handleImportClick = () => {
    setMode("import");
    setImportText("");
    setImportErrors([]);
    setShowModal(true);
  };

  const handleImportSubmit = () => {
    const result = tabToSong(importText);

    if (!result) {
      setImportErrors(["Could not parse tab. Make sure the format is correct."]);
      return;
    }

    if (result.errors.length > 0) {
      setImportErrors(result.errors);
    }

    onImport(result.song.name, result.song.measures, result.song.bpm);
    setShowModal(false);
    setImportText("");
    setImportErrors([]);
  };

  const handleCopyToClipboard = () => {
    if (currentSong) {
      navigator.clipboard.writeText(songToTab(currentSong));
    }
  };

  const handleDownload = () => {
    if (currentSong) {
      const content = songToTab(currentSong);
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentSong.name.replace(/[^a-z0-9]/gi, "_")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <div className="tab-import-export-buttons">
        <button
          className="tab-btn"
          onClick={handleImportClick}
          title="Import from tab"
        >
          <span className="btn-icon">📥</span>
          Import Tab
        </button>
        <button
          className="tab-btn"
          onClick={handleExport}
          disabled={!currentSong}
          title="Export to tab"
        >
          <span className="btn-icon">📤</span>
          Export Tab
        </button>
      </div>

      {showModal && (
        <div className="tab-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tab-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tab-modal-header">
              <h3>{mode === "export" ? "Export Song as Tab" : "Import Tab"}</h3>
              <button
                className="tab-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="tab-modal-content">
              {mode === "export" && currentSong ? (
                <>
                  <pre className="tab-preview">{songToTab(currentSong)}</pre>
                  <div className="tab-modal-actions">
                    <button className="tab-action-btn" onClick={handleCopyToClipboard}>
                      Copy to Clipboard
                    </button>
                    <button className="tab-action-btn" onClick={handleDownload}>
                      Download as .txt
                    </button>
                  </div>
                </>
              ) : mode === "import" ? (
                <>
                  <p className="tab-import-help">
                    Paste ASCII drum tab below. Supported format:
                  </p>
                  <pre className="tab-format-example">
{`# Song: My Song
# BPM: 100

HH|x-x-x-x-|
SD|----o---|
BD|o-------|`}
                  </pre>
                  <textarea
                    className="tab-import-textarea"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste tab here..."
                    rows={12}
                  />
                  {importErrors.length > 0 && (
                    <div className="tab-import-errors">
                      {importErrors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                  <div className="tab-modal-actions">
                    <button
                      className="tab-action-btn primary"
                      onClick={handleImportSubmit}
                      disabled={!importText.trim()}
                    >
                      Import Song
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
