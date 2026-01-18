import { useState } from 'react';
import type { Character, Race, CharacterClass, Background, Alignment, Skill, AbilityScore } from '../types';
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
import { RACES, CLASSES, BACKGROUNDS, ALIGNMENTS, ALL_SKILLS, ABILITY_SCORES } from '../constants';
import { generateAbilityScores, generateName } from '../randomGenerator';
import './CharacterForm.css';

interface CharacterFormProps {
  character: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
  onViewSheet: () => void;
}

/** Truncate text with ellipsis only if it exceeds maxLength */
function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export function CharacterForm({ character, onSave, onCancel, onViewSheet }: CharacterFormProps) {
  // Use character.id as key to reset form state when switching characters
  // This avoids the anti-pattern of syncing props to state via useEffect
  const [formData, setFormData] = useState<Character>(character);
  const [activeTab, setActiveTab] = useState<'basic' | 'abilities' | 'skills' | 'personality' | 'equipment'>('basic');

  // Reset form when character changes (using key pattern would be better in parent)
  const [lastCharacterId, setLastCharacterId] = useState(character.id);
  if (character.id !== lastCharacterId) {
    setFormData(character);
    setLastCharacterId(character.id);
  }

  const updateField = <K extends keyof Character>(field: K, value: Character[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAbilityScore = (ability: AbilityScore, value: number) => {
    setFormData(prev => ({
      ...prev,
      abilityScores: { ...prev.abilityScores, [ability]: value },
    }));
  };

  const updateAppearance = (field: keyof Character['appearance'], value: string) => {
    setFormData(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value },
    }));
  };

  const toggleSkill = (skill: Skill) => {
    setFormData(prev => {
      const isSelected = prev.proficientSkills.includes(skill);
      return {
        ...prev,
        proficientSkills: isSelected
          ? prev.proficientSkills.filter(s => s !== skill)
          : [...prev.proficientSkills, skill],
      };
    });
  };

  const handleRollAbilities = () => {
    const newScores = generateAbilityScores();
    // Apply racial bonuses
    const raceInfo = RACE_INFO[formData.race];
    setFormData(prev => ({
      ...prev,
      abilityScores: {
        strength: newScores.strength + (raceInfo.abilityBonuses.strength || 0),
        dexterity: newScores.dexterity + (raceInfo.abilityBonuses.dexterity || 0),
        constitution: newScores.constitution + (raceInfo.abilityBonuses.constitution || 0),
        intelligence: newScores.intelligence + (raceInfo.abilityBonuses.intelligence || 0),
        wisdom: newScores.wisdom + (raceInfo.abilityBonuses.wisdom || 0),
        charisma: newScores.charisma + (raceInfo.abilityBonuses.charisma || 0),
      },
    }));
  };

  const handleRandomName = () => {
    updateField('name', generateName(formData.race));
  };

  const handleSave = () => {
    // Recalculate derived stats
    const classInfo = CLASS_INFO[formData.characterClass];
    const conMod = getAbilityModifier(formData.abilityScores.constitution);
    const dexMod = getAbilityModifier(formData.abilityScores.dexterity);

    const updatedCharacter: Character = {
      ...formData,
      hitPoints: classInfo.hitDie + conMod + ((formData.level - 1) * (Math.ceil(classInfo.hitDie / 2) + 1 + conMod)),
      armorClass: 10 + dexMod,
      speed: RACE_INFO[formData.race].speed,
    };

    onSave(updatedCharacter);
  };

  const raceInfo = RACE_INFO[formData.race];
  const classInfo = CLASS_INFO[formData.characterClass];
  const backgroundInfo = BACKGROUND_INFO[formData.background];
  const profBonus = getProficiencyBonus(formData.level);

  return (
    <div className="character-form">
      <div className="form-header">
        <h2>{formData.name || 'New Character'}</h2>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-secondary" onClick={onViewSheet}>View Sheet</button>
          <button className="btn-primary" onClick={handleSave}>Save Character</button>
        </div>
      </div>

      <div className="form-tabs">
        <button className={activeTab === 'basic' ? 'active' : ''} onClick={() => setActiveTab('basic')}>Basic Info</button>
        <button className={activeTab === 'abilities' ? 'active' : ''} onClick={() => setActiveTab('abilities')}>Abilities</button>
        <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>Skills</button>
        <button className={activeTab === 'personality' ? 'active' : ''} onClick={() => setActiveTab('personality')}>Personality</button>
        <button className={activeTab === 'equipment' ? 'active' : ''} onClick={() => setActiveTab('equipment')}>Equipment</button>
      </div>

      <div className="form-content">
        {activeTab === 'basic' && (
          <div className="form-section">
            <div className="form-row">
              <div className="form-group flex-grow">
                <label>Character Name</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="Enter character name"
                  />
                  <button type="button" onClick={handleRandomName} title="Generate random name">🎲</button>
                </div>
              </div>
              <div className="form-group">
                <label>Level</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.level}
                  onChange={e => updateField('level', Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Race</label>
                <select value={formData.race} onChange={e => updateField('race', e.target.value as Race)}>
                  {RACES.map(race => (
                    <option key={race} value={race}>{RACE_INFO[race].name}</option>
                  ))}
                </select>
                <div className="field-info">
                  Speed: {raceInfo.speed}ft | Traits: {raceInfo.traits.join(', ')}
                </div>
              </div>
              <div className="form-group">
                <label>Class</label>
                <select value={formData.characterClass} onChange={e => updateField('characterClass', e.target.value as CharacterClass)}>
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{CLASS_INFO[cls].name}</option>
                  ))}
                </select>
                <div className="field-info">
                  Hit Die: d{classInfo.hitDie} | Primary: {classInfo.primaryAbility.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join('/')}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Background</label>
                <select value={formData.background} onChange={e => updateField('background', e.target.value as Background)}>
                  {BACKGROUNDS.map(bg => (
                    <option key={bg} value={bg}>{BACKGROUND_INFO[bg].name}</option>
                  ))}
                </select>
                <div className="field-info">
                  Skills: {backgroundInfo.skillProficiencies.map(s => SKILL_NAMES[s]).join(', ')}
                </div>
              </div>
              <div className="form-group">
                <label>Alignment</label>
                <select value={formData.alignment} onChange={e => updateField('alignment', e.target.value as Alignment)}>
                  {ALIGNMENTS.map(alignment => (
                    <option key={alignment} value={alignment}>{ALIGNMENT_NAMES[alignment]}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3>Appearance</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input type="text" value={formData.appearance.age} onChange={e => updateAppearance('age', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Height</label>
                <input type="text" value={formData.appearance.height} onChange={e => updateAppearance('height', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Weight</label>
                <input type="text" value={formData.appearance.weight} onChange={e => updateAppearance('weight', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Eyes</label>
                <input type="text" value={formData.appearance.eyes} onChange={e => updateAppearance('eyes', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Skin</label>
                <input type="text" value={formData.appearance.skin} onChange={e => updateAppearance('skin', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hair</label>
                <input type="text" value={formData.appearance.hair} onChange={e => updateAppearance('hair', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'abilities' && (
          <div className="form-section">
            <div className="abilities-header">
              <h3>Ability Scores</h3>
              <button type="button" className="btn-secondary" onClick={handleRollAbilities}>
                🎲 Roll 4d6 Drop Lowest
              </button>
            </div>
            <p className="helper-text">Racial bonuses from {raceInfo.name} are automatically applied.</p>

            <div className="ability-grid">
              {ABILITY_SCORES.map(ability => {
                const score = formData.abilityScores[ability];
                const mod = getAbilityModifier(score);
                const racialBonus = raceInfo.abilityBonuses[ability] || 0;

                return (
                  <div key={ability} className="ability-card">
                    <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={score}
                      onChange={e => updateAbilityScore(ability, Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                    />
                    <div className="ability-modifier">{formatModifier(mod)}</div>
                    {racialBonus > 0 && (
                      <div className="racial-bonus">+{racialBonus} racial</div>
                    )}
                  </div>
                );
              })}
            </div>

            <h3>Derived Stats</h3>
            <div className="derived-stats">
              <div className="stat-box">
                <label>Proficiency Bonus</label>
                <div className="stat-value">{formatModifier(profBonus)}</div>
              </div>
              <div className="stat-box">
                <label>Hit Points</label>
                <div className="stat-value">{classInfo.hitDie + getAbilityModifier(formData.abilityScores.constitution)}</div>
                <div className="stat-detail">at level 1</div>
              </div>
              <div className="stat-box">
                <label>Armor Class</label>
                <div className="stat-value">{10 + getAbilityModifier(formData.abilityScores.dexterity)}</div>
                <div className="stat-detail">unarmored</div>
              </div>
              <div className="stat-box">
                <label>Initiative</label>
                <div className="stat-value">{formatModifier(getAbilityModifier(formData.abilityScores.dexterity))}</div>
              </div>
              <div className="stat-box">
                <label>Speed</label>
                <div className="stat-value">{raceInfo.speed} ft</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="form-section">
            <h3>Skill Proficiencies</h3>
            <p className="helper-text">
              Select skills your character is proficient in. Your class ({classInfo.name}) can choose {classInfo.numSkillChoices} from its skill list.
              Background ({backgroundInfo.name}) grants: {backgroundInfo.skillProficiencies.map(s => SKILL_NAMES[s]).join(', ')}.
            </p>

            <div className="skills-grid">
              {ALL_SKILLS.map(skill => {
                const ability = SKILL_ABILITIES[skill];
                const abilityMod = getAbilityModifier(formData.abilityScores[ability]);
                const isProficient = formData.proficientSkills.includes(skill);
                const totalMod = abilityMod + (isProficient ? profBonus : 0);
                const isClassSkill = classInfo.skillChoices.includes(skill);
                const isBackgroundSkill = backgroundInfo.skillProficiencies.includes(skill);

                return (
                  <div
                    key={skill}
                    className={`skill-row ${isProficient ? 'proficient' : ''} ${isClassSkill ? 'class-skill' : ''} ${isBackgroundSkill ? 'background-skill' : ''}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    <input
                      type="checkbox"
                      checked={isProficient}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span className="skill-modifier">{formatModifier(totalMod)}</span>
                    <span className="skill-name">{SKILL_NAMES[skill]}</span>
                    <span className="skill-ability">({ability.slice(0, 3).toUpperCase()})</span>
                    {isClassSkill && <span className="skill-tag class">Class</span>}
                    {isBackgroundSkill && <span className="skill-tag background">BG</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'personality' && (
          <div className="form-section">
            <h3>Personality & Background</h3>
            <p className="helper-text">
              Background feature: {backgroundInfo.feature}
            </p>

            <div className="form-group">
              <label>Personality Traits</label>
              <textarea
                value={formData.personalityTraits}
                onChange={e => updateField('personalityTraits', e.target.value)}
                placeholder="Describe your character's personality..."
                rows={3}
              />
              <div className="suggestions">
                <strong>Suggestions:</strong>
                {backgroundInfo.personalityTraits.slice(0, 2).map((trait, i) => (
                  <button key={i} type="button" onClick={() => updateField('personalityTraits', trait)}>
                    {truncate(trait, 40)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Ideals</label>
              <textarea
                value={formData.ideals}
                onChange={e => updateField('ideals', e.target.value)}
                placeholder="What principles guide your character?"
                rows={2}
              />
              <div className="suggestions">
                <strong>Suggestions:</strong>
                {backgroundInfo.ideals.slice(0, 3).map((ideal, i) => (
                  <button key={i} type="button" onClick={() => updateField('ideals', ideal)}>
                    {ideal}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Bonds</label>
              <textarea
                value={formData.bonds}
                onChange={e => updateField('bonds', e.target.value)}
                placeholder="What connections does your character have?"
                rows={2}
              />
              <div className="suggestions">
                <strong>Suggestions:</strong>
                {backgroundInfo.bonds.slice(0, 2).map((bond, i) => (
                  <button key={i} type="button" onClick={() => updateField('bonds', bond)}>
                    {truncate(bond, 40)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Flaws</label>
              <textarea
                value={formData.flaws}
                onChange={e => updateField('flaws', e.target.value)}
                placeholder="What weaknesses does your character have?"
                rows={2}
              />
              <div className="suggestions">
                <strong>Suggestions:</strong>
                {backgroundInfo.flaws.slice(0, 2).map((flaw, i) => (
                  <button key={i} type="button" onClick={() => updateField('flaws', flaw)}>
                    {truncate(flaw, 40)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Backstory</label>
              <textarea
                value={formData.backstory}
                onChange={e => updateField('backstory', e.target.value)}
                placeholder="Tell your character's story..."
                rows={6}
              />
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="form-section">
            <h3>Equipment & Features</h3>

            <div className="form-group">
              <label>Starting Equipment</label>
              <p className="helper-text">From class and background:</p>
              <div className="equipment-suggestions">
                {[...classInfo.startingEquipment, ...backgroundInfo.equipment].map((item, i) => (
                  <span key={i} className="equipment-tag">{item}</span>
                ))}
              </div>
              <textarea
                value={formData.equipment.join('\n')}
                onChange={e => updateField('equipment', e.target.value.split('\n').filter(Boolean))}
                placeholder="Enter equipment (one per line)"
                rows={6}
              />
            </div>

            <div className="form-group">
              <label>Features & Traits</label>
              <p className="helper-text">Racial traits:</p>
              <div className="features-list">
                {raceInfo.traits.map((trait, i) => (
                  <span key={i} className="feature-tag">{trait}</span>
                ))}
              </div>
              <textarea
                value={formData.features.join('\n')}
                onChange={e => updateField('features', e.target.value.split('\n').filter(Boolean))}
                placeholder="Enter features (one per line)"
                rows={4}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
