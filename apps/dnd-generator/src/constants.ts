import type { Race, CharacterClass, Background, Alignment, Skill, AbilityScore } from './types';

/**
 * Shared constants for the D&D character generator.
 * Single source of truth for available options.
 */

export const RACES: Race[] = [
  'human', 'elf', 'dwarf', 'halfling', 'gnome',
  'half-elf', 'half-orc', 'orc', 'tiefling', 'dragonborn'
];

export const CLASSES: CharacterClass[] = [
  'barbarian', 'bard', 'cleric', 'druid', 'fighter',
  'monk', 'paladin', 'ranger', 'rogue', 'sorcerer',
  'warlock', 'wizard'
];

export const BACKGROUNDS: Background[] = [
  'acolyte', 'charlatan', 'criminal', 'entertainer', 'folk-hero',
  'guild-artisan', 'hermit', 'noble', 'outlander', 'sage',
  'sailor', 'soldier', 'urchin'
];

export const ALIGNMENTS: Alignment[] = [
  'lawful-good', 'neutral-good', 'chaotic-good',
  'lawful-neutral', 'true-neutral', 'chaotic-neutral',
  'lawful-evil', 'neutral-evil', 'chaotic-evil'
];

export const ALL_SKILLS: Skill[] = [
  'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
  'history', 'insight', 'intimidation', 'investigation', 'medicine',
  'nature', 'perception', 'performance', 'persuasion', 'religion',
  'sleight-of-hand', 'stealth', 'survival'
];

export const ABILITY_SCORES: AbilityScore[] = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
];
