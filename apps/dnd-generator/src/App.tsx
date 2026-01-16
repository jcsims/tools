import { useState, useEffect, useCallback } from 'react';
import type { Character } from './types';
import { generateRandomCharacter, createEmptyCharacter } from './randomGenerator';
import { CharacterForm } from './components/CharacterForm';
import { CharacterSheet } from './components/CharacterSheet';
import { CharacterList } from './components/CharacterList';
import './App.css';

const STORAGE_KEY = 'dnd-characters';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [view, setView] = useState<'list' | 'edit' | 'sheet'>('list');

  // Load characters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCharacters(parsed);
      } catch (e) {
        console.error('Failed to load characters:', e);
      }
    }
  }, []);

  // Save characters to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  const handleCreateNew = useCallback(() => {
    const newChar = createEmptyCharacter();
    setCurrentCharacter(newChar);
    setView('edit');
  }, []);

  const handleGenerateRandom = useCallback(() => {
    const randomChar = generateRandomCharacter();
    setCurrentCharacter(randomChar);
    setView('edit');
  }, []);

  const handleSaveCharacter = useCallback((character: Character) => {
    setCharacters(prev => {
      const existing = prev.findIndex(c => c.id === character.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = character;
        return updated;
      }
      return [...prev, character];
    });
    setCurrentCharacter(character);
  }, []);

  const handleDeleteCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    if (currentCharacter?.id === id) {
      setCurrentCharacter(null);
      setView('list');
    }
  }, [currentCharacter]);

  const handleSelectCharacter = useCallback((character: Character) => {
    setCurrentCharacter(character);
    setView('edit');
  }, []);

  const handleViewSheet = useCallback((character: Character) => {
    setCurrentCharacter(character);
    setView('sheet');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="app">
      <header className="app-header no-print">
        <h1>D&D Character Generator</h1>
        <nav className="app-nav">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            Characters
          </button>
          {currentCharacter && (
            <>
              <button
                className={view === 'edit' ? 'active' : ''}
                onClick={() => setView('edit')}
              >
                Edit
              </button>
              <button
                className={view === 'sheet' ? 'active' : ''}
                onClick={() => setView('sheet')}
              >
                Character Sheet
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <CharacterList
            characters={characters}
            onSelect={handleSelectCharacter}
            onViewSheet={handleViewSheet}
            onDelete={handleDeleteCharacter}
            onCreateNew={handleCreateNew}
            onGenerateRandom={handleGenerateRandom}
          />
        )}

        {view === 'edit' && currentCharacter && (
          <CharacterForm
            character={currentCharacter}
            onSave={handleSaveCharacter}
            onCancel={() => setView('list')}
            onViewSheet={() => setView('sheet')}
          />
        )}

        {view === 'sheet' && currentCharacter && (
          <CharacterSheet
            character={currentCharacter}
            onEdit={() => setView('edit')}
            onPrint={handlePrint}
            onBack={() => setView('list')}
          />
        )}
      </main>

      <footer className="app-footer no-print">
        <p>D&D 5e Character Generator - Part of <a href="../">Tools Collection</a></p>
      </footer>
    </div>
  );
}

export default App;
