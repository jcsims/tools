import type { Character } from '../types';
import { RACE_INFO, CLASS_INFO, ALIGNMENT_NAMES } from '../types';
import './CharacterList.css';

interface CharacterListProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  onViewSheet: (character: Character) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onGenerateRandom: () => void;
}

export function CharacterList({
  characters,
  onSelect,
  onViewSheet,
  onDelete,
  onCreateNew,
  onGenerateRandom,
}: CharacterListProps) {
  const sortedCharacters = [...characters].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="character-list">
      <div className="character-list-header">
        <h2>Your Characters</h2>
        <div className="character-list-actions">
          <button className="btn-primary" onClick={onCreateNew}>
            + New Character
          </button>
          <button className="btn-secondary" onClick={onGenerateRandom}>
            Random Character
          </button>
        </div>
      </div>

      {sortedCharacters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎲</div>
          <h3>No Characters Yet</h3>
          <p>Create your first D&D character or generate a random one to get started!</p>
        </div>
      ) : (
        <div className="character-grid">
          {sortedCharacters.map(character => (
            <div key={character.id} className="character-card">
              <div className="character-card-header">
                <h3>{character.name || 'Unnamed Character'}</h3>
                <span className="character-level">Lvl {character.level}</span>
              </div>
              <div className="character-card-body">
                <p className="character-race-class">
                  {RACE_INFO[character.race].name} {CLASS_INFO[character.characterClass].name}
                </p>
                <p className="character-alignment">
                  {ALIGNMENT_NAMES[character.alignment]}
                </p>
                <div className="character-stats-preview">
                  <span>HP: {character.hitPoints}</span>
                  <span>AC: {character.armorClass}</span>
                </div>
              </div>
              <div className="character-card-actions">
                <button onClick={() => onSelect(character)}>Edit</button>
                <button onClick={() => onViewSheet(character)}>Sheet</button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (confirm('Delete this character?')) {
                      onDelete(character.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
