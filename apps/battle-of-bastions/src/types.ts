// Unit Types
export type DefenderType = 'soldier' | 'archer' | 'wizard';
export type EnemyType = 'goblin' | 'orc' | 'troll' | 'dragon' | 'barbarian';
export type AdventurePartyType = 'adventurers';

// Defender (player's units)
export interface Defender {
  id: string;
  type: DefenderType;
  level: number;
  damage: number;
  attackSpeed: number; // attacks per second
  range: number; // pixels
  x: number;
  y: number;
  lastAttackTime: number;
  target: string | null;
}

// Enemy (attacking units)
export interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number; // pixels per second
  damage: number;
  goldReward: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  // Barbarian-specific: erratic movement
  erraticAngle?: number;
  erraticTimer?: number;
}

// Adventure Party (good allies that hunt powerful enemies)
export interface AdventureParty {
  id: string;
  type: AdventurePartyType;
  health: number;
  maxHealth: number;
  damage: number;
  attackSpeed: number; // attacks per second
  speed: number; // pixels per second
  x: number;
  y: number;
  targetId: string | null;
  lastAttackTime: number;
}

// Bastion (the thing we're defending)
export interface Bastion {
  level: number;
  health: number;
  maxHealth: number;
  armor: number; // damage reduction percentage
}

// Wave configuration
export interface WaveConfig {
  waveNumber: number;
  enemies: { type: EnemyType; count: number }[];
  spawnInterval: number; // ms between spawns
  goldBonus: number;
}

// Upgrade costs and stats
export interface DefenderStats {
  baseDamage: number;
  baseAttackSpeed: number;
  baseRange: number;
  baseCost: number;
  damagePerLevel: number;
  attackSpeedPerLevel: number;
  rangePerLevel: number;
  upgradeCostMultiplier: number;
}

export interface EnemyStats {
  baseHealth: number;
  baseSpeed: number;
  baseDamage: number;
  baseGoldReward: number;
  healthPerWave: number;
  damagePerWave: number;
}

// Game state
export interface GameState {
  gold: number;
  wave: number;
  isWaveActive: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  bastion: Bastion;
  defenders: Defender[];
  enemies: Enemy[];
  adventureParties: AdventureParty[];
  projectiles: Projectile[];
  attackEffects: AttackEffect[];
  selectedDefenderType: DefenderType | null;
  placementMode: boolean;
}

export interface Projectile {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  damage: number;
  targetId: string;
  type: DefenderType;
  progress: number; // 0 to 1
}

// Attack effect shown when enemies hit the bastion
export interface AttackEffect {
  id: string;
  enemyType: EnemyType;
  x: number;
  y: number;
  createdAt: number;
  duration: number; // ms
}

// Constants
export const DEFENDER_STATS: Record<DefenderType, DefenderStats> = {
  soldier: {
    baseDamage: 15,
    baseAttackSpeed: 1.0,
    baseRange: 80,
    baseCost: 50,
    damagePerLevel: 8,
    attackSpeedPerLevel: 0.1,
    rangePerLevel: 5,
    upgradeCostMultiplier: 1.5,
  },
  archer: {
    baseDamage: 25,
    baseAttackSpeed: 0.8,
    baseRange: 200,
    baseCost: 75,
    damagePerLevel: 12,
    attackSpeedPerLevel: 0.08,
    rangePerLevel: 15,
    upgradeCostMultiplier: 1.6,
  },
  wizard: {
    baseDamage: 40,
    baseAttackSpeed: 0.5,
    baseRange: 150,
    baseCost: 100,
    damagePerLevel: 20,
    attackSpeedPerLevel: 0.05,
    rangePerLevel: 10,
    upgradeCostMultiplier: 1.8,
  },
};

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  goblin: {
    baseHealth: 30,
    baseSpeed: 60,
    baseDamage: 5,
    baseGoldReward: 10,
    healthPerWave: 8,
    damagePerWave: 1,
  },
  orc: {
    baseHealth: 80,
    baseSpeed: 40,
    baseDamage: 15,
    baseGoldReward: 25,
    healthPerWave: 20,
    damagePerWave: 3,
  },
  troll: {
    baseHealth: 200,
    baseSpeed: 25,
    baseDamage: 30,
    baseGoldReward: 50,
    healthPerWave: 50,
    damagePerWave: 5,
  },
  dragon: {
    baseHealth: 500,
    baseSpeed: 35,
    baseDamage: 50,
    baseGoldReward: 150,
    healthPerWave: 100,
    damagePerWave: 10,
  },
  barbarian: {
    baseHealth: 60,
    baseSpeed: 80, // Fast but erratic
    baseDamage: 20,
    baseGoldReward: 20,
    healthPerWave: 15,
    damagePerWave: 4,
  },
};

// Adventure Party stats
export const ADVENTURE_PARTY_STATS = {
  adventurers: {
    baseHealth: 100,
    baseDamage: 30,
    baseAttackSpeed: 1.2,
    baseSpeed: 70,
    healthPerWave: 25,
    damagePerWave: 8,
  },
};

export const BASTION_STATS = {
  baseHealth: 100,
  healthPerLevel: 50,
  baseArmor: 0,
  armorPerLevel: 5,
  baseUpgradeCost: 100,
  upgradeCostMultiplier: 2,
};

// Game area dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;
export const BASTION_X = GAME_WIDTH - 80;
export const BASTION_Y = GAME_HEIGHT / 2;

// Placement zones (where defenders can be placed)
export const PLACEMENT_ZONE = {
  x: 150,
  y: 50,
  width: 550,
  height: 400,
};
