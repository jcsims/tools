import React, { useState } from 'react';
import type { Song } from '../types';
import './SongManager.css';

interface SongManagerProps {
  songs: Song[];
  currentSongId: string | null;
  onSelectSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onRenameSong: (id: string, newName: string) => void;
}

export const SongManager: React.FC<SongManagerProps> = ({
  songs,
  currentSongId,
  onSelectSong,
  onDeleteSong,
  onRenameSong,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (song: Song) => {
    setEditingId(song.id);
    setEditName(song.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameSong(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="song-manager">
      <h3 className="song-manager-title">
        <span className="title-icon">📚</span>
        My Songs
      </h3>

      {songs.length === 0 ? (
        <div className="no-songs">
          <p>No songs yet!</p>
          <p className="no-songs-hint">
            Try uploading a drum sheet image or select a sample song to get started.
          </p>
        </div>
      ) : (
        <div className="songs-list">
          {songs.map((song) => (
            <div
              key={song.id}
              className={`song-item ${currentSongId === song.id ? 'active' : ''}`}
            >
              {editingId === song.id ? (
                <div className="song-edit">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="song-name-input"
                    autoFocus
                  />
                  <button className="edit-btn save" onClick={handleSaveEdit}>
                    ✓
                  </button>
                  <button className="edit-btn cancel" onClick={handleCancelEdit}>
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="song-info"
                    onClick={() => onSelectSong(song)}
                  >
                    <span className="song-name">{song.name}</span>
                    <span className="song-meta">
                      {song.measures.length} measure{song.measures.length !== 1 ? 's' : ''} •{' '}
                      {song.bpm} BPM
                    </span>
                    <span className="song-date">{formatDate(song.createdAt)}</span>
                  </div>
                  <div className="song-actions">
                    <button
                      className="action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(song);
                      }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${song.name}"?`)) {
                          onDeleteSong(song.id);
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
