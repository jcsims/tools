import type { Character, Skill, AbilityScore } from '../types';
import {
  RACE_INFO,
  CLASS_INFO,
  BACKGROUND_INFO,
  ALIGNMENT_NAMES,
  SKILL_NAMES,
  SKILL_ABILITIES,
  getAbilityModifier,
  formatModifier,
  getProficiencyBonus,
} from '../types';
import './CharacterSheet.css';

interface CharacterSheetProps {
  character: Character;
  onEdit: () => void;
  onPrint: () => void;
  onBack: () => void;
}

const ALL_SKILLS: Skill[] = [
  'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
  'history', 'insight', 'intimidation', 'investigation', 'medicine',
  'nature', 'perception', 'performance', 'persuasion', 'religion',
  'sleight-of-hand', 'stealth', 'survival'
];

const ABILITY_SCORES: AbilityScore[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

export function CharacterSheet({ character, onEdit, onPrint, onBack }: CharacterSheetProps) {
  const raceInfo = RACE_INFO[character.race];
  const classInfo = CLASS_INFO[character.characterClass];
  const backgroundInfo = BACKGROUND_INFO[character.background];
  const profBonus = getProficiencyBonus(character.level);

  const getSavingThrowMod = (ability: AbilityScore): number => {
    const mod = getAbilityModifier(character.abilityScores[ability]);
    const isProficient = classInfo.savingThrows.includes(ability);
    return mod + (isProficient ? profBonus : 0);
  };

  const getSkillMod = (skill: Skill): number => {
    const ability = SKILL_ABILITIES[skill];
    const mod = getAbilityModifier(character.abilityScores[ability]);
    const isProficient = character.proficientSkills.includes(skill);
    return mod + (isProficient ? profBonus : 0);
  };

  const passivePerception = 10 + getSkillMod('perception');

  return (
    <div className="character-sheet-container">
      <div className="sheet-actions no-print">
        <button onClick={onBack}>Back to List</button>
        <button onClick={onEdit}>Edit Character</button>
        <button className="btn-primary" onClick={onPrint}>Print Sheet</button>
      </div>

      <div className="character-sheet">
        {/* Header */}
        <header className="sheet-header">
          <div className="character-name-box">
            <div className="character-name">{character.name || 'Unnamed Character'}</div>
            <label>Character Name</label>
          </div>
          <div className="character-info-row">
            <div className="info-box">
              <div className="info-value">{classInfo.name} {character.level}</div>
              <label>Class & Level</label>
            </div>
            <div className="info-box">
              <div className="info-value">{backgroundInfo.name}</div>
              <label>Background</label>
            </div>
            <div className="info-box">
              <div className="info-value">{raceInfo.name}</div>
              <label>Race</label>
            </div>
            <div className="info-box">
              <div className="info-value">{ALIGNMENT_NAMES[character.alignment]}</div>
              <label>Alignment</label>
            </div>
          </div>
        </header>

        <div className="sheet-body">
          {/* Left Column - Abilities & Skills */}
          <div className="sheet-column left">
            {/* Ability Scores */}
            <div className="ability-scores-column">
              {ABILITY_SCORES.map(ability => {
                const score = character.abilityScores[ability];
                const mod = getAbilityModifier(score);
                return (
                  <div key={ability} className="ability-block">
                    <div className="ability-name">{ability.slice(0, 3).toUpperCase()}</div>
                    <div className="ability-modifier">{formatModifier(mod)}</div>
                    <div className="ability-score">{score}</div>
                  </div>
                );
              })}
            </div>

            {/* Inspiration, Proficiency, Saving Throws */}
            <div className="stats-section">
              <div className="stat-row">
                <div className="checkbox"></div>
                <span>Inspiration</span>
              </div>
              <div className="stat-row proficiency">
                <div className="stat-circle">{formatModifier(profBonus)}</div>
                <span>Proficiency Bonus</span>
              </div>

              <div className="saving-throws">
                <h4>Saving Throws</h4>
                {ABILITY_SCORES.map(ability => {
                  const isProficient = classInfo.savingThrows.includes(ability);
                  const mod = getSavingThrowMod(ability);
                  return (
                    <div key={ability} className="save-row">
                      <div className={`checkbox ${isProficient ? 'filled' : ''}`}></div>
                      <span className="save-mod">{formatModifier(mod)}</span>
                      <span className="save-name">{ability.charAt(0).toUpperCase() + ability.slice(1)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="skills-section">
                <h4>Skills</h4>
                {ALL_SKILLS.map(skill => {
                  const isProficient = character.proficientSkills.includes(skill);
                  const mod = getSkillMod(skill);
                  const ability = SKILL_ABILITIES[skill];
                  return (
                    <div key={skill} className="skill-row">
                      <div className={`checkbox ${isProficient ? 'filled' : ''}`}></div>
                      <span className="skill-mod">{formatModifier(mod)}</span>
                      <span className="skill-name">{SKILL_NAMES[skill]}</span>
                      <span className="skill-ability">({ability.slice(0, 3)})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="passive-perception">
              <div className="pp-value">{passivePerception}</div>
              <label>Passive Wisdom (Perception)</label>
            </div>
          </div>

          {/* Center Column - Combat Stats */}
          <div className="sheet-column center">
            <div className="combat-stats">
              <div className="combat-stat-box">
                <div className="combat-value">{10 + getAbilityModifier(character.abilityScores.dexterity)}</div>
                <label>Armor Class</label>
              </div>
              <div className="combat-stat-box">
                <div className="combat-value">{formatModifier(getAbilityModifier(character.abilityScores.dexterity))}</div>
                <label>Initiative</label>
              </div>
              <div className="combat-stat-box">
                <div className="combat-value">{character.speed} ft</div>
                <label>Speed</label>
              </div>
            </div>

            <div className="hp-section">
              <div className="hp-max">
                <label>Hit Point Maximum</label>
                <span>{classInfo.hitDie + getAbilityModifier(character.abilityScores.constitution)}</span>
              </div>
              <div className="hp-current">
                <div className="hp-box"></div>
                <label>Current Hit Points</label>
              </div>
              <div className="hp-temp">
                <div className="hp-box"></div>
                <label>Temporary Hit Points</label>
              </div>
            </div>

            <div className="hit-dice-section">
              <div className="hit-dice">
                <label>Total</label>
                <span>{character.level}d{classInfo.hitDie}</span>
                <div className="dice-box"></div>
                <label>Hit Dice</label>
              </div>
              <div className="death-saves">
                <label>Death Saves</label>
                <div className="save-bubbles">
                  <span>Successes</span>
                  <div className="bubbles">
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                  </div>
                </div>
                <div className="save-bubbles">
                  <span>Failures</span>
                  <div className="bubbles">
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="attacks-section">
              <h4>Attacks & Spellcasting</h4>
              <table className="attacks-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ATK Bonus</th>
                    <th>Damage/Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td></td><td></td><td></td></tr>
                  <tr><td></td><td></td><td></td></tr>
                  <tr><td></td><td></td><td></td></tr>
                </tbody>
              </table>
            </div>

            <div className="equipment-section">
              <h4>Equipment</h4>
              <div className="equipment-list">
                {character.equipment.length > 0 ? (
                  character.equipment.map((item, i) => (
                    <div key={i} className="equipment-item">{item}</div>
                  ))
                ) : (
                  <div className="equipment-empty">No equipment listed</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Personality & Features */}
          <div className="sheet-column right">
            <div className="personality-section">
              <div className="personality-box">
                <h4>Personality Traits</h4>
                <p>{character.personalityTraits || 'Not specified'}</p>
              </div>
              <div className="personality-box">
                <h4>Ideals</h4>
                <p>{character.ideals || 'Not specified'}</p>
              </div>
              <div className="personality-box">
                <h4>Bonds</h4>
                <p>{character.bonds || 'Not specified'}</p>
              </div>
              <div className="personality-box">
                <h4>Flaws</h4>
                <p>{character.flaws || 'Not specified'}</p>
              </div>
            </div>

            <div className="features-section">
              <h4>Features & Traits</h4>
              <div className="features-list">
                {[...raceInfo.traits, ...character.features].map((feature, i) => (
                  <div key={i} className="feature-item">{feature}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance & Backstory Section */}
        <div className="sheet-footer">
          <div className="appearance-section">
            <h4>Character Appearance</h4>
            <div className="appearance-grid">
              <div className="appearance-item">
                <span className="label">Age:</span>
                <span className="value">{character.appearance.age || '—'}</span>
              </div>
              <div className="appearance-item">
                <span className="label">Height:</span>
                <span className="value">{character.appearance.height || '—'}</span>
              </div>
              <div className="appearance-item">
                <span className="label">Weight:</span>
                <span className="value">{character.appearance.weight || '—'}</span>
              </div>
              <div className="appearance-item">
                <span className="label">Eyes:</span>
                <span className="value">{character.appearance.eyes || '—'}</span>
              </div>
              <div className="appearance-item">
                <span className="label">Skin:</span>
                <span className="value">{character.appearance.skin || '—'}</span>
              </div>
              <div className="appearance-item">
                <span className="label">Hair:</span>
                <span className="value">{character.appearance.hair || '—'}</span>
              </div>
            </div>
          </div>

          {character.backstory && (
            <div className="backstory-section">
              <h4>Character Backstory</h4>
              <p>{character.backstory}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
