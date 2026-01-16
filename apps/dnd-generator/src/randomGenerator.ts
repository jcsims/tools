import { v4 as uuidv4 } from 'uuid';
import type {
  Character,
  Race,
  CharacterClass,
  Background,
  Alignment,
  AbilityScores,
  Skill,
} from './types';
import {
  RACE_INFO,
  CLASS_INFO,
  BACKGROUND_INFO,
  FIRST_NAMES,
  SURNAMES,
  getAbilityModifier,
} from './types';

// Roll 4d6, drop lowest
function roll4d6DropLowest(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
}

// Generate ability scores using 4d6 drop lowest method
export function generateAbilityScores(): AbilityScores {
  return {
    strength: roll4d6DropLowest(),
    dexterity: roll4d6DropLowest(),
    constitution: roll4d6DropLowest(),
    intelligence: roll4d6DropLowest(),
    wisdom: roll4d6DropLowest(),
    charisma: roll4d6DropLowest(),
  };
}

// Random selection helper
function randomChoice<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Random selections helper (n unique items)
function randomChoices<T>(array: readonly T[], n: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Generate random name based on race
export function generateName(race: Race): string {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const firstName = randomChoice(FIRST_NAMES[race][gender]);
  const surname = randomChoice(SURNAMES[race]);
  return `${firstName} ${surname}`;
}

// Generate random character
export function generateRandomCharacter(): Character {
  const races: Race[] = ['human', 'elf', 'dwarf', 'halfling', 'gnome', 'half-elf', 'half-orc', 'tiefling', 'dragonborn'];
  const classes: CharacterClass[] = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'];
  const backgrounds: Background[] = ['acolyte', 'charlatan', 'criminal', 'entertainer', 'folk-hero', 'guild-artisan', 'hermit', 'noble', 'outlander', 'sage', 'sailor', 'soldier', 'urchin'];
  const alignments: Alignment[] = ['lawful-good', 'neutral-good', 'chaotic-good', 'lawful-neutral', 'true-neutral', 'chaotic-neutral', 'lawful-evil', 'neutral-evil', 'chaotic-evil'];

  const race = randomChoice(races);
  const characterClass = randomChoice(classes);
  const background = randomChoice(backgrounds);
  const alignment = randomChoice(alignments);
  const level = 1;

  const raceInfo = RACE_INFO[race];
  const classInfo = CLASS_INFO[characterClass];
  const backgroundInfo = BACKGROUND_INFO[background];

  // Generate base ability scores
  const baseScores = generateAbilityScores();

  // Apply racial bonuses
  const abilityScores: AbilityScores = {
    strength: baseScores.strength + (raceInfo.abilityBonuses.strength || 0),
    dexterity: baseScores.dexterity + (raceInfo.abilityBonuses.dexterity || 0),
    constitution: baseScores.constitution + (raceInfo.abilityBonuses.constitution || 0),
    intelligence: baseScores.intelligence + (raceInfo.abilityBonuses.intelligence || 0),
    wisdom: baseScores.wisdom + (raceInfo.abilityBonuses.wisdom || 0),
    charisma: baseScores.charisma + (raceInfo.abilityBonuses.charisma || 0),
  };

  // Select skills from class options plus background skills
  const classSkills = randomChoices(classInfo.skillChoices, classInfo.numSkillChoices);
  const backgroundSkills = backgroundInfo.skillProficiencies.filter(
    skill => !classSkills.includes(skill)
  );
  const proficientSkills: Skill[] = [...classSkills, ...backgroundSkills];

  // Calculate HP (max at level 1)
  const hitPoints = classInfo.hitDie + getAbilityModifier(abilityScores.constitution);

  // Calculate AC (base 10 + dex, simplified)
  const armorClass = 10 + getAbilityModifier(abilityScores.dexterity);

  // Get random personality elements
  const personalityTraits = randomChoice(backgroundInfo.personalityTraits);
  const ideals = randomChoice(backgroundInfo.ideals);
  const bonds = randomChoice(backgroundInfo.bonds);
  const flaws = randomChoice(backgroundInfo.flaws);

  // Combine equipment
  const equipment = [...classInfo.startingEquipment, ...backgroundInfo.equipment];

  // Features (simplified - just race traits for now)
  const features = [...raceInfo.traits];

  return {
    id: uuidv4(),
    name: generateName(race),
    race,
    characterClass,
    level,
    background,
    alignment,
    abilityScores,
    proficientSkills,
    hitPoints: Math.max(1, hitPoints),
    armorClass,
    speed: raceInfo.speed,
    personalityTraits,
    ideals,
    bonds,
    flaws,
    features,
    equipment,
    backstory: '',
    appearance: {
      age: generateRandomAge(race),
      height: generateRandomHeight(race),
      weight: generateRandomWeight(race),
      eyes: randomChoice(['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Black', 'Red', 'Gold', 'Silver']),
      skin: randomChoice(['Fair', 'Light', 'Medium', 'Tan', 'Dark', 'Olive', 'Pale', 'Bronze', 'Ashen', 'Green']),
      hair: randomChoice(['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Auburn', 'Silver', 'Blue', 'Green']),
    },
    createdAt: Date.now(),
  };
}

function generateRandomAge(race: Race): string {
  const ageRanges: Record<Race, [number, number]> = {
    human: [18, 60],
    elf: [100, 700],
    dwarf: [50, 300],
    halfling: [20, 150],
    gnome: [40, 400],
    'half-elf': [20, 180],
    'half-orc': [14, 60],
    tiefling: [18, 100],
    dragonborn: [15, 80],
  };
  const [min, max] = ageRanges[race];
  return String(Math.floor(Math.random() * (max - min)) + min);
}

function generateRandomHeight(race: Race): string {
  const heightRanges: Record<Race, [number, number]> = { // in inches
    human: [60, 78],
    elf: [54, 72],
    dwarf: [44, 54],
    halfling: [32, 40],
    gnome: [36, 42],
    'half-elf': [58, 74],
    'half-orc': [66, 84],
    tiefling: [60, 78],
    dragonborn: [66, 80],
  };
  const [min, max] = heightRanges[race];
  const inches = Math.floor(Math.random() * (max - min)) + min;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function generateRandomWeight(race: Race): string {
  const weightRanges: Record<Race, [number, number]> = { // in lbs
    human: [120, 250],
    elf: [90, 170],
    dwarf: [130, 200],
    halfling: [35, 45],
    gnome: [35, 45],
    'half-elf': [110, 220],
    'half-orc': [180, 350],
    tiefling: [120, 250],
    dragonborn: [200, 350],
  };
  const [min, max] = weightRanges[race];
  return `${Math.floor(Math.random() * (max - min)) + min} lbs`;
}

// Create empty character template
export function createEmptyCharacter(): Character {
  return {
    id: uuidv4(),
    name: '',
    race: 'human',
    characterClass: 'fighter',
    level: 1,
    background: 'soldier',
    alignment: 'true-neutral',
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    proficientSkills: [],
    hitPoints: 10,
    armorClass: 10,
    speed: 30,
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    features: [],
    equipment: [],
    backstory: '',
    appearance: {
      age: '',
      height: '',
      weight: '',
      eyes: '',
      skin: '',
      hair: '',
    },
    createdAt: Date.now(),
  };
}
