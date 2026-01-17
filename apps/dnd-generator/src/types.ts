// D&D 5e Character Types and Data

export type AbilityScore = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export type Skill =
  | 'acrobatics' | 'animal-handling' | 'arcana' | 'athletics' | 'deception'
  | 'history' | 'insight' | 'intimidation' | 'investigation' | 'medicine'
  | 'nature' | 'perception' | 'performance' | 'persuasion' | 'religion'
  | 'sleight-of-hand' | 'stealth' | 'survival';

export type Race =
  | 'human' | 'elf' | 'dwarf' | 'halfling' | 'gnome'
  | 'half-elf' | 'half-orc' | 'orc' | 'tiefling' | 'dragonborn';

export type CharacterClass =
  | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter'
  | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer'
  | 'warlock' | 'wizard';

export type Background =
  | 'acolyte' | 'charlatan' | 'criminal' | 'entertainer' | 'folk-hero'
  | 'guild-artisan' | 'hermit' | 'noble' | 'outlander' | 'sage'
  | 'sailor' | 'soldier' | 'urchin';

export type Alignment =
  | 'lawful-good' | 'neutral-good' | 'chaotic-good'
  | 'lawful-neutral' | 'true-neutral' | 'chaotic-neutral'
  | 'lawful-evil' | 'neutral-evil' | 'chaotic-evil';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  race: Race;
  characterClass: CharacterClass;
  level: number;
  background: Background;
  alignment: Alignment;
  abilityScores: AbilityScores;
  proficientSkills: Skill[];
  hitPoints: number;
  armorClass: number;
  speed: number;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  features: string[];
  equipment: string[];
  backstory: string;
  appearance: {
    age: string;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
  };
  createdAt: number;
}

// Race information and bonuses
export interface RaceInfo {
  name: string;
  abilityBonuses: Partial<AbilityScores>;
  speed: number;
  traits: string[];
  languages: string[];
}

export const RACE_INFO: Record<Race, RaceInfo> = {
  human: {
    name: 'Human',
    abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    speed: 30,
    traits: ['Extra Language', 'Extra Skill Proficiency'],
    languages: ['Common', 'One extra language'],
  },
  elf: {
    name: 'Elf',
    abilityBonuses: { dexterity: 2 },
    speed: 30,
    traits: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'],
    languages: ['Common', 'Elvish'],
  },
  dwarf: {
    name: 'Dwarf',
    abilityBonuses: { constitution: 2 },
    speed: 25,
    traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'],
    languages: ['Common', 'Dwarvish'],
  },
  halfling: {
    name: 'Halfling',
    abilityBonuses: { dexterity: 2 },
    speed: 25,
    traits: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    languages: ['Common', 'Halfling'],
  },
  gnome: {
    name: 'Gnome',
    abilityBonuses: { intelligence: 2 },
    speed: 25,
    traits: ['Darkvision', 'Gnome Cunning'],
    languages: ['Common', 'Gnomish'],
  },
  'half-elf': {
    name: 'Half-Elf',
    abilityBonuses: { charisma: 2 },
    speed: 30,
    traits: ['Darkvision', 'Fey Ancestry', 'Skill Versatility'],
    languages: ['Common', 'Elvish', 'One extra language'],
  },
  'half-orc': {
    name: 'Half-Orc',
    abilityBonuses: { strength: 2, constitution: 1 },
    speed: 30,
    traits: ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks'],
    languages: ['Common', 'Orc'],
  },
  orc: {
    name: 'Orc',
    abilityBonuses: { strength: 2, constitution: 1 },
    speed: 30,
    traits: ['Darkvision', 'Aggressive', 'Powerful Build', 'Primal Intuition'],
    languages: ['Common', 'Orc'],
  },
  tiefling: {
    name: 'Tiefling',
    abilityBonuses: { intelligence: 1, charisma: 2 },
    speed: 30,
    traits: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
    languages: ['Common', 'Infernal'],
  },
  dragonborn: {
    name: 'Dragonborn',
    abilityBonuses: { strength: 2, charisma: 1 },
    speed: 30,
    traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
    languages: ['Common', 'Draconic'],
  },
};

// Class information
export interface ClassInfo {
  name: string;
  hitDie: number;
  primaryAbility: AbilityScore[];
  savingThrows: AbilityScore[];
  skillChoices: Skill[];
  numSkillChoices: number;
  startingEquipment: string[];
}

export const CLASS_INFO: Record<CharacterClass, ClassInfo> = {
  barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: ['strength'],
    savingThrows: ['strength', 'constitution'],
    skillChoices: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    numSkillChoices: 2,
    startingEquipment: ['Greataxe', 'Two handaxes', 'Explorer\'s pack', 'Four javelins'],
  },
  bard: {
    name: 'Bard',
    hitDie: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['dexterity', 'charisma'],
    skillChoices: ['acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight-of-hand', 'stealth', 'survival'],
    numSkillChoices: 3,
    startingEquipment: ['Rapier', 'Diplomat\'s pack', 'Lute', 'Leather armor', 'Dagger'],
  },
  cleric: {
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['wisdom', 'charisma'],
    skillChoices: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    numSkillChoices: 2,
    startingEquipment: ['Mace', 'Scale mail', 'Light crossbow', 'Priest\'s pack', 'Shield', 'Holy symbol'],
  },
  druid: {
    name: 'Druid',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['intelligence', 'wisdom'],
    skillChoices: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    numSkillChoices: 2,
    startingEquipment: ['Wooden shield', 'Scimitar', 'Leather armor', 'Explorer\'s pack', 'Druidic focus'],
  },
  fighter: {
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: ['strength', 'dexterity'],
    savingThrows: ['strength', 'constitution'],
    skillChoices: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    numSkillChoices: 2,
    startingEquipment: ['Chain mail', 'Longsword', 'Shield', 'Light crossbow', 'Dungeoneer\'s pack'],
  },
  monk: {
    name: 'Monk',
    hitDie: 8,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    skillChoices: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    numSkillChoices: 2,
    startingEquipment: ['Shortsword', 'Dungeoneer\'s pack', '10 darts'],
  },
  paladin: {
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: ['strength', 'charisma'],
    savingThrows: ['wisdom', 'charisma'],
    skillChoices: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    numSkillChoices: 2,
    startingEquipment: ['Longsword', 'Shield', 'Five javelins', 'Priest\'s pack', 'Chain mail', 'Holy symbol'],
  },
  ranger: {
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    skillChoices: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    numSkillChoices: 3,
    startingEquipment: ['Scale mail', 'Two shortswords', 'Dungeoneer\'s pack', 'Longbow', '20 arrows'],
  },
  rogue: {
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: ['dexterity'],
    savingThrows: ['dexterity', 'intelligence'],
    skillChoices: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
    numSkillChoices: 4,
    startingEquipment: ['Rapier', 'Shortbow', '20 arrows', 'Burglar\'s pack', 'Leather armor', 'Two daggers', 'Thieves\' tools'],
  },
  sorcerer: {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: ['charisma'],
    savingThrows: ['constitution', 'charisma'],
    skillChoices: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    numSkillChoices: 2,
    startingEquipment: ['Light crossbow', '20 bolts', 'Arcane focus', 'Dungeoneer\'s pack', 'Two daggers'],
  },
  warlock: {
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['wisdom', 'charisma'],
    skillChoices: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    numSkillChoices: 2,
    startingEquipment: ['Light crossbow', '20 bolts', 'Arcane focus', 'Scholar\'s pack', 'Leather armor', 'Simple weapon', 'Two daggers'],
  },
  wizard: {
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: ['intelligence'],
    savingThrows: ['intelligence', 'wisdom'],
    skillChoices: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    numSkillChoices: 2,
    startingEquipment: ['Quarterstaff', 'Arcane focus', 'Scholar\'s pack', 'Spellbook'],
  },
};

// Background information
export interface BackgroundInfo {
  name: string;
  skillProficiencies: Skill[];
  languages: number;
  equipment: string[];
  feature: string;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

export const BACKGROUND_INFO: Record<Background, BackgroundInfo> = {
  acolyte: {
    name: 'Acolyte',
    skillProficiencies: ['insight', 'religion'],
    languages: 2,
    equipment: ['Holy symbol', 'Prayer book', '5 sticks of incense', 'Vestments', '15 gp'],
    feature: 'Shelter of the Faithful',
    personalityTraits: [
      'I idolize a particular hero of my faith.',
      'I can find common ground between the fiercest enemies.',
      'I see omens in every event and action.',
      'Nothing can shake my optimistic attitude.',
    ],
    ideals: ['Tradition', 'Charity', 'Change', 'Power', 'Faith', 'Aspiration'],
    bonds: ['I would die to recover an ancient relic.', 'I will someday get revenge on the corrupt temple hierarchy.', 'I owe my life to the priest who took me in.'],
    flaws: ['I judge others harshly, and myself even more severely.', 'I put too much trust in those who wield power within my temple.'],
  },
  charlatan: {
    name: 'Charlatan',
    skillProficiencies: ['deception', 'sleight-of-hand'],
    languages: 0,
    equipment: ['Fine clothes', 'Disguise kit', 'Con tools', '15 gp'],
    feature: 'False Identity',
    personalityTraits: [
      'I fall in and out of love easily.',
      'I have a joke for every occasion.',
      'Flattery is my preferred trick for getting what I want.',
      'I\'m a born gambler who can\'t resist taking a risk.',
    ],
    ideals: ['Independence', 'Fairness', 'Charity', 'Creativity', 'Friendship', 'Aspiration'],
    bonds: ['I fleeced the wrong person and must avoid them.', 'I owe everything to my mentor.', 'Somewhere out there, I have a child who doesn\'t know me.'],
    flaws: ['I can\'t resist a pretty face.', 'I\'m always in debt.', 'I\'m convinced that no one could ever fool me.'],
  },
  criminal: {
    name: 'Criminal',
    skillProficiencies: ['deception', 'stealth'],
    languages: 0,
    equipment: ['Crowbar', 'Dark common clothes with hood', '15 gp'],
    feature: 'Criminal Contact',
    personalityTraits: [
      'I always have a plan for what to do when things go wrong.',
      'I am always calm, no matter the situation.',
      'The first thing I do in a new place is note escape routes.',
      'I would rather make a new friend than a new enemy.',
    ],
    ideals: ['Honor', 'Freedom', 'Charity', 'Greed', 'People', 'Redemption'],
    bonds: ['I\'m trying to pay off an old debt I owe.', 'Someone I loved died because of a mistake I made.', 'I\'m guilty of a terrible crime.'],
    flaws: ['When I see something valuable, I can\'t think about anything but how to steal it.', 'I turn tail and run when things look bad.'],
  },
  entertainer: {
    name: 'Entertainer',
    skillProficiencies: ['acrobatics', 'performance'],
    languages: 0,
    equipment: ['Musical instrument', 'Favor of an admirer', 'Costume', '15 gp'],
    feature: 'By Popular Demand',
    personalityTraits: [
      'I know a story relevant to almost every situation.',
      'Whenever I come to a new place, I collect local rumors.',
      'I\'m a hopeless romantic, always searching for that special someone.',
      'Nobody stays angry at me for long.',
    ],
    ideals: ['Beauty', 'Tradition', 'Creativity', 'Greed', 'People', 'Honesty'],
    bonds: ['My instrument is my most treasured possession.', 'Someone stole my precious instrument, and I will get it back.', 'I want to be famous, whatever it takes.'],
    flaws: ['I\'ll do anything to win fame and renown.', 'I\'m a sucker for a pretty face.', 'A scandal prevents me from ever going home again.'],
  },
  'folk-hero': {
    name: 'Folk Hero',
    skillProficiencies: ['animal-handling', 'survival'],
    languages: 0,
    equipment: ['Artisan\'s tools', 'Shovel', 'Iron pot', 'Common clothes', '10 gp'],
    feature: 'Rustic Hospitality',
    personalityTraits: [
      'I judge people by their actions, not their words.',
      'If someone is in trouble, I\'m always ready to lend help.',
      'When I set my mind to something, I follow through.',
      'I have a strong sense of fair play.',
    ],
    ideals: ['Respect', 'Fairness', 'Freedom', 'Might', 'Sincerity', 'Destiny'],
    bonds: ['I have a family, but I have no idea where they are.', 'I worked the land, I love the land, and I will protect the land.', 'A tyrant rules my homeland with an iron fist.'],
    flaws: ['The tyrant who rules my land will stop at nothing to see me killed.', 'I\'m convinced of the significance of my destiny.', 'I have a weakness for the vices of the city.'],
  },
  'guild-artisan': {
    name: 'Guild Artisan',
    skillProficiencies: ['insight', 'persuasion'],
    languages: 1,
    equipment: ['Artisan\'s tools', 'Letter of introduction from guild', 'Traveler\'s clothes', '15 gp'],
    feature: 'Guild Membership',
    personalityTraits: [
      'I believe that anything worth doing is worth doing right.',
      'I\'m a snob who looks down on those who can\'t appreciate fine art.',
      'I always want to know how things work.',
      'I\'m full of witty aphorisms and have a proverb for every occasion.',
    ],
    ideals: ['Community', 'Generosity', 'Freedom', 'Greed', 'People', 'Aspiration'],
    bonds: ['The workshop where I learned my trade is the most important place.', 'I created a great work for someone, then found them unworthy.', 'I owe my guild a great debt.'],
    flaws: ['I\'ll do anything to get my hands on something rare or priceless.', 'I\'m quick to assume that someone is trying to cheat me.', 'No one must ever learn my darkest secret.'],
  },
  hermit: {
    name: 'Hermit',
    skillProficiencies: ['medicine', 'religion'],
    languages: 1,
    equipment: ['Scroll case with notes', 'Winter blanket', 'Common clothes', 'Herbalism kit', '5 gp'],
    feature: 'Discovery',
    personalityTraits: [
      'I\'ve been isolated for so long that I rarely speak.',
      'I am utterly serene, even in the face of disaster.',
      'I connect everything that happens to me to a grand cosmic plan.',
      'I often get lost in my own thoughts and contemplation.',
    ],
    ideals: ['Greater Good', 'Logic', 'Free Thinking', 'Power', 'Live and Let Live', 'Self-Knowledge'],
    bonds: ['Nothing is more important than the members of my hermitage.', 'I entered seclusion to hide from those who might still be hunting me.', 'I\'m still seeking the enlightenment I pursued in my seclusion.'],
    flaws: ['I\'d risk too much to uncover a lost bit of knowledge.', 'I like keeping secrets and won\'t share them with anyone.', 'I am dogmatic in my thoughts and philosophy.'],
  },
  noble: {
    name: 'Noble',
    skillProficiencies: ['history', 'persuasion'],
    languages: 1,
    equipment: ['Fine clothes', 'Signet ring', 'Scroll of pedigree', '25 gp'],
    feature: 'Position of Privilege',
    personalityTraits: [
      'My eloquent flattery makes everyone I talk to feel important.',
      'The common folk love me for my kindness and generosity.',
      'No one could doubt by looking at my regal bearing that I am above the common folk.',
      'I take great pains to always look my best.',
    ],
    ideals: ['Respect', 'Responsibility', 'Independence', 'Power', 'Family', 'Noble Obligation'],
    bonds: ['I will face any challenge to win the approval of my family.', 'My house\'s alliance with another noble family must be sustained.', 'Nothing is more important than family.'],
    flaws: ['I secretly believe that everyone is beneath me.', 'I hide a truly scandalous secret.', 'I too often hear veiled insults where none were intended.'],
  },
  outlander: {
    name: 'Outlander',
    skillProficiencies: ['athletics', 'survival'],
    languages: 1,
    equipment: ['Staff', 'Hunting trap', 'Trophy from animal', 'Traveler\'s clothes', '10 gp'],
    feature: 'Wanderer',
    personalityTraits: [
      'I\'m driven by a wanderlust that led me away from home.',
      'I watch over my friends as if they were a litter of newborn pups.',
      'I once ran twenty-five miles without stopping to warn my clan.',
      'I have a lesson for every situation, drawn from observing nature.',
    ],
    ideals: ['Change', 'Greater Good', 'Honor', 'Might', 'Nature', 'Glory'],
    bonds: ['My family, clan, or tribe is the most important thing in my life.', 'An injury to the unspoiled wilderness is an injury to me.', 'I am the last of my tribe, and it is up to me to ensure their names enter legend.'],
    flaws: ['I am too enamored of ale, wine, and other intoxicants.', 'There\'s no room for caution in a life lived to the fullest.', 'I remember every insult I\'ve received and nurse a silent resentment.'],
  },
  sage: {
    name: 'Sage',
    skillProficiencies: ['arcana', 'history'],
    languages: 2,
    equipment: ['Bottle of black ink', 'Quill', 'Small knife', 'Letter from dead colleague', 'Common clothes', '10 gp'],
    feature: 'Researcher',
    personalityTraits: [
      'I use polysyllabic words that convey the impression of great erudition.',
      'I\'ve read every book in the world\'s greatest libraries.',
      'I\'m used to helping out those who aren\'t as smart as I am.',
      'There\'s nothing I like more than a good mystery.',
    ],
    ideals: ['Knowledge', 'Beauty', 'Logic', 'No Limits', 'Power', 'Self-Improvement'],
    bonds: ['It is my duty to protect my students.', 'I have an ancient text that holds terrible secrets.', 'I work to preserve a library, university, or scriptorium.'],
    flaws: ['I am easily distracted by the promise of information.', 'Most people scream and run when they see a demon. I stop and take notes.', 'Unlocking an ancient mystery is worth the price of a civilization.'],
  },
  sailor: {
    name: 'Sailor',
    skillProficiencies: ['athletics', 'perception'],
    languages: 0,
    equipment: ['Belaying pin (club)', '50 feet of silk rope', 'Lucky charm', 'Common clothes', '10 gp'],
    feature: 'Ship\'s Passage',
    personalityTraits: [
      'My friends know they can rely on me, no matter what.',
      'I work hard so that I can play hard when the work is done.',
      'I enjoy sailing into new ports and making new friends over a flagon of ale.',
      'I stretch the truth for the sake of a good story.',
    ],
    ideals: ['Respect', 'Fairness', 'Freedom', 'Mastery', 'People', 'Aspiration'],
    bonds: ['I\'m loyal to my captain first, everything else second.', 'The ship is most important - crewmates come and go.', 'I\'ll always remember my first ship.'],
    flaws: ['I follow orders, even if I think they\'re wrong.', 'I\'ll say anything to avoid having to do extra work.', 'Once someone questions my courage, I never back down.'],
  },
  soldier: {
    name: 'Soldier',
    skillProficiencies: ['athletics', 'intimidation'],
    languages: 0,
    equipment: ['Insignia of rank', 'Trophy from fallen enemy', 'Bone dice or deck of cards', 'Common clothes', '10 gp'],
    feature: 'Military Rank',
    personalityTraits: [
      'I\'m always polite and respectful.',
      'I\'m haunted by memories of war.',
      'I\'ve lost too many friends, and I\'m slow to make new ones.',
      'I\'m full of inspiring and cautionary tales from my military experience.',
    ],
    ideals: ['Greater Good', 'Responsibility', 'Independence', 'Might', 'Live and Let Live', 'Nation'],
    bonds: ['I would still lay down my life for the people I served with.', 'Someone saved my life on the battlefield.', 'My honor is my life.'],
    flaws: ['The monstrous enemy we faced still leaves me quivering with fear.', 'I have little respect for anyone who is not a proven warrior.', 'I made a terrible mistake in battle that cost many lives.'],
  },
  urchin: {
    name: 'Urchin',
    skillProficiencies: ['sleight-of-hand', 'stealth'],
    languages: 0,
    equipment: ['Small knife', 'Map of home city', 'Pet mouse', 'Token to remember parents', 'Common clothes', '10 gp'],
    feature: 'City Secrets',
    personalityTraits: [
      'I hide scraps of food and trinkets away in my pockets.',
      'I ask a lot of questions.',
      'I like to squeeze into small places where no one else can get to me.',
      'I sleep with my back to a wall, with everything I own wrapped in a bundle.',
    ],
    ideals: ['Respect', 'Community', 'Change', 'Retribution', 'People', 'Aspiration'],
    bonds: ['My town or city is my home, and I\'ll fight to defend it.', 'I sponsor an orphanage to keep others from enduring what I was forced to endure.', 'I owe my survival to another urchin who taught me to live on the streets.'],
    flaws: ['If I\'m outnumbered, I will run away from a fight.', 'Gold seems like a lot of money to me, and I\'ll do just about anything for more of it.', 'I will never fully trust anyone other than myself.'],
  },
};

// Skill to ability mapping
export const SKILL_ABILITIES: Record<Skill, AbilityScore> = {
  'acrobatics': 'dexterity',
  'animal-handling': 'wisdom',
  'arcana': 'intelligence',
  'athletics': 'strength',
  'deception': 'charisma',
  'history': 'intelligence',
  'insight': 'wisdom',
  'intimidation': 'charisma',
  'investigation': 'intelligence',
  'medicine': 'wisdom',
  'nature': 'intelligence',
  'perception': 'wisdom',
  'performance': 'charisma',
  'persuasion': 'charisma',
  'religion': 'intelligence',
  'sleight-of-hand': 'dexterity',
  'stealth': 'dexterity',
  'survival': 'wisdom',
};

// Alignment display names
export const ALIGNMENT_NAMES: Record<Alignment, string> = {
  'lawful-good': 'Lawful Good',
  'neutral-good': 'Neutral Good',
  'chaotic-good': 'Chaotic Good',
  'lawful-neutral': 'Lawful Neutral',
  'true-neutral': 'True Neutral',
  'chaotic-neutral': 'Chaotic Neutral',
  'lawful-evil': 'Lawful Evil',
  'neutral-evil': 'Neutral Evil',
  'chaotic-evil': 'Chaotic Evil',
};

// Skill display names
export const SKILL_NAMES: Record<Skill, string> = {
  'acrobatics': 'Acrobatics',
  'animal-handling': 'Animal Handling',
  'arcana': 'Arcana',
  'athletics': 'Athletics',
  'deception': 'Deception',
  'history': 'History',
  'insight': 'Insight',
  'intimidation': 'Intimidation',
  'investigation': 'Investigation',
  'medicine': 'Medicine',
  'nature': 'Nature',
  'perception': 'Perception',
  'performance': 'Performance',
  'persuasion': 'Persuasion',
  'religion': 'Religion',
  'sleight-of-hand': 'Sleight of Hand',
  'stealth': 'Stealth',
  'survival': 'Survival',
};

// Helper functions
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

// Random name generators
export const FIRST_NAMES: Record<Race, { male: string[]; female: string[] }> = {
  human: {
    male: ['Aldric', 'Bran', 'Cedric', 'Duncan', 'Edmund', 'Gareth', 'Hugo', 'Ivan', 'James', 'Karl'],
    female: ['Alara', 'Brienne', 'Clara', 'Diana', 'Elena', 'Freya', 'Gwen', 'Helena', 'Iris', 'Julia'],
  },
  elf: {
    male: ['Aerion', 'Beren', 'Caelum', 'Daeron', 'Elowen', 'Faelar', 'Galion', 'Haladir', 'Ithilion', 'Jareth'],
    female: ['Aelindra', 'Briseis', 'Celebrian', 'Daewen', 'Elanor', 'Finwe', 'Galawen', 'Haleth', 'Idril', 'Jessara'],
  },
  dwarf: {
    male: ['Balin', 'Dain', 'Durin', 'Farin', 'Gimli', 'Thorin', 'Thrain', 'Oin', 'Gloin', 'Nain'],
    female: ['Bruni', 'Dagni', 'Disa', 'Frigga', 'Gerta', 'Helga', 'Ingrid', 'Katla', 'Svana', 'Thyra'],
  },
  halfling: {
    male: ['Bilbo', 'Frodo', 'Merry', 'Pippin', 'Sam', 'Cade', 'Corrin', 'Eldon', 'Garret', 'Lyle'],
    female: ['Amaryllis', 'Belinda', 'Cora', 'Daisy', 'Eglantine', 'Fern', 'Gilly', 'Hilda', 'Ivy', 'Jillian'],
  },
  gnome: {
    male: ['Alston', 'Boddynock', 'Dimble', 'Eldon', 'Fonkin', 'Gimble', 'Glim', 'Jebeddo', 'Namfoodle', 'Zook'],
    female: ['Bimpnottin', 'Caramip', 'Duvamil', 'Ellywick', 'Loopmottin', 'Nissa', 'Oda', 'Shamil', 'Waywocket', 'Zanna'],
  },
  'half-elf': {
    male: ['Aelar', 'Aramil', 'Berrian', 'Carric', 'Enialis', 'Heian', 'Immeral', 'Mindartis', 'Paelias', 'Varis'],
    female: ['Adrie', 'Birel', 'Caelynn', 'Drusilia', 'Enna', 'Jelenneth', 'Keyleth', 'Lia', 'Meriele', 'Shava'],
  },
  'half-orc': {
    male: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Krusk', 'Ront', 'Shump', 'Thokk'],
    female: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Vola'],
  },
  orc: {
    male: ['Grom', 'Urzul', 'Muzgash', 'Borkul', 'Durgash', 'Ghash', 'Mogak', 'Nargol', 'Shagrat', 'Ugluk'],
    female: ['Bula', 'Grubash', 'Murka', 'Olg', 'Rogash', 'Shel', 'Urzoga', 'Volg', 'Yazga', 'Zogga'],
  },
  tiefling: {
    male: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Kairon', 'Leucis', 'Melech', 'Morthos', 'Therai'],
    female: ['Akta', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna'],
  },
  dragonborn: {
    male: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Nadarr', 'Pandjed'],
    female: ['Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Jheri', 'Kava', 'Korinn', 'Mishann', 'Nala'],
  },
};

export const SURNAMES: Record<Race, string[]> = {
  human: ['Ashford', 'Blackwood', 'Cromwell', 'Dunbar', 'Fairfax', 'Greymoor', 'Hawthorne', 'Ironwood', 'Kingsley', 'Lockwood'],
  elf: ['Amakiir', 'Galanodel', 'Holimion', 'Ilphelkiir', 'Liadon', 'Meliamne', 'Nailo', 'Siannodel', 'Xiloscient', 'Yaeldrin'],
  dwarf: ['Battlehammer', 'Brawnanvil', 'Dankil', 'Fireforge', 'Frostbeard', 'Gorunn', 'Holderhek', 'Ironfist', 'Strakeln', 'Torunn'],
  halfling: ['Brushgather', 'Goodbarrel', 'Greenbottle', 'Highhill', 'Hilltopple', 'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough'],
  gnome: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Turen'],
  'half-elf': ['Amastacia', 'Brightmoon', 'Dawntracker', 'Evenwood', 'Greenleaf', 'Moonwhisper', 'Nightbreeze', 'Silverfrond', 'Starfell', 'Windwalker'],
  'half-orc': ['Bloodfist', 'Doomhammer', 'Gorefang', 'Ironhide', 'Skullcrusher', 'Stormrage', 'Thundermaw', 'Warbringer', 'Worldbreaker', 'Wyrmslayer'],
  orc: ['Blacktusk', 'Bonegnaw', 'Fleshrender', 'Goreaxe', 'Ironmaw', 'Rotfang', 'Skullsplitter', 'Stonecrusher', 'Warmace', 'Worgripper'],
  tiefling: ['Carrion', 'Despair', 'Fear', 'Glory', 'Hope', 'Misery', 'Nowhere', 'Poetry', 'Sorrow', 'Torment'],
  dragonborn: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon', 'Kepeshkmolik', 'Kerrhylon', 'Kimbatuul', 'Linxakasendalor', 'Myastan'],
};
