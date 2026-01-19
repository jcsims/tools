import {
  type GameState,
  type Defender,
  type Enemy,
  type WaveConfig,
  type DefenderType,
  type EnemyType,
  type Projectile,
  DEFENDER_STATS,
  ENEMY_STATS,
  BASTION_STATS,
  BASTION_X,
  BASTION_Y,
  GAME_HEIGHT,
} from './types';

// Generate unique IDs
let idCounter = 0;
const generateId = () => `entity-${++idCounter}`;

// Create initial game state
export function createInitialState(): GameState {
  return {
    gold: 150,
    wave: 0,
    isWaveActive: false,
    isPaused: false,
    isGameOver: false,
    bastion: {
      level: 1,
      health: BASTION_STATS.baseHealth,
      maxHealth: BASTION_STATS.baseHealth,
      armor: BASTION_STATS.baseArmor,
    },
    defenders: [],
    enemies: [],
    projectiles: [],
    selectedDefenderType: null,
    placementMode: false,
  };
}

// Calculate defender stats based on level
export function getDefenderDamage(type: DefenderType, level: number): number {
  const stats = DEFENDER_STATS[type];
  return stats.baseDamage + stats.damagePerLevel * (level - 1);
}

export function getDefenderAttackSpeed(type: DefenderType, level: number): number {
  const stats = DEFENDER_STATS[type];
  return stats.baseAttackSpeed + stats.attackSpeedPerLevel * (level - 1);
}

export function getDefenderRange(type: DefenderType, level: number): number {
  const stats = DEFENDER_STATS[type];
  return stats.baseRange + stats.rangePerLevel * (level - 1);
}

export function getDefenderCost(type: DefenderType): number {
  return DEFENDER_STATS[type].baseCost;
}

export function getDefenderUpgradeCost(type: DefenderType, currentLevel: number): number {
  const stats = DEFENDER_STATS[type];
  return Math.floor(stats.baseCost * Math.pow(stats.upgradeCostMultiplier, currentLevel));
}

// Calculate bastion stats
export function getBastionMaxHealth(level: number): number {
  return BASTION_STATS.baseHealth + BASTION_STATS.healthPerLevel * (level - 1);
}

export function getBastionArmor(level: number): number {
  return BASTION_STATS.baseArmor + BASTION_STATS.armorPerLevel * (level - 1);
}

export function getBastionUpgradeCost(currentLevel: number): number {
  return Math.floor(
    BASTION_STATS.baseUpgradeCost * Math.pow(BASTION_STATS.upgradeCostMultiplier, currentLevel - 1)
  );
}

// Create a new defender
export function createDefender(type: DefenderType, x: number, y: number): Defender {
  return {
    id: generateId(),
    type,
    level: 1,
    damage: getDefenderDamage(type, 1),
    attackSpeed: getDefenderAttackSpeed(type, 1),
    range: getDefenderRange(type, 1),
    x,
    y,
    lastAttackTime: 0,
    target: null,
  };
}

// Upgrade a defender
export function upgradeDefender(defender: Defender): Defender {
  const newLevel = defender.level + 1;
  return {
    ...defender,
    level: newLevel,
    damage: getDefenderDamage(defender.type, newLevel),
    attackSpeed: getDefenderAttackSpeed(defender.type, newLevel),
    range: getDefenderRange(defender.type, newLevel),
  };
}

// Create enemy based on type and wave
export function createEnemy(type: EnemyType, wave: number): Enemy {
  const stats = ENEMY_STATS[type];
  const health = stats.baseHealth + stats.healthPerWave * (wave - 1);

  // Spawn from the left side at random Y positions
  const spawnY = 80 + Math.random() * (GAME_HEIGHT - 160);

  return {
    id: generateId(),
    type,
    health,
    maxHealth: health,
    speed: stats.baseSpeed,
    damage: stats.baseDamage + stats.damagePerWave * (wave - 1),
    goldReward: stats.baseGoldReward + Math.floor(wave * 2),
    x: -30,
    y: spawnY,
    targetX: BASTION_X,
    targetY: BASTION_Y,
  };
}

// Generate wave configuration
export function generateWaveConfig(waveNumber: number): WaveConfig {
  const enemies: { type: EnemyType; count: number }[] = [];

  // Goblins appear from wave 1
  const goblinCount = Math.min(5 + waveNumber * 2, 20);
  enemies.push({ type: 'goblin', count: goblinCount });

  // Orcs appear from wave 3
  if (waveNumber >= 3) {
    const orcCount = Math.min(Math.floor((waveNumber - 2) * 1.5), 10);
    enemies.push({ type: 'orc', count: orcCount });
  }

  // Trolls appear from wave 6
  if (waveNumber >= 6) {
    const trollCount = Math.min(Math.floor((waveNumber - 5) * 0.8), 5);
    enemies.push({ type: 'troll', count: trollCount });
  }

  // Dragons appear from wave 10
  if (waveNumber >= 10) {
    const dragonCount = Math.min(Math.floor((waveNumber - 9) * 0.5), 3);
    enemies.push({ type: 'dragon', count: dragonCount });
  }

  return {
    waveNumber,
    enemies,
    spawnInterval: Math.max(800 - waveNumber * 30, 300),
    goldBonus: waveNumber * 25,
  };
}

// Calculate distance between two points
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Find closest enemy within range
export function findTarget(defender: Defender, enemies: Enemy[]): Enemy | null {
  let closest: Enemy | null = null;
  let closestDist = Infinity;

  for (const enemy of enemies) {
    const dist = distance(defender.x, defender.y, enemy.x, enemy.y);
    if (dist <= defender.range && dist < closestDist) {
      closest = enemy;
      closestDist = dist;
    }
  }

  return closest;
}

// Create a projectile
export function createProjectile(
  defender: Defender,
  target: Enemy
): Projectile {
  return {
    id: generateId(),
    fromX: defender.x,
    fromY: defender.y,
    toX: target.x,
    toY: target.y,
    damage: defender.damage,
    targetId: target.id,
    type: defender.type,
    progress: 0,
  };
}

// Update game state for one frame
export function updateGameState(
  state: GameState,
  deltaTime: number,
  currentTime: number
): GameState {
  if (state.isPaused || state.isGameOver) {
    return state;
  }

  let newState = { ...state };
  let newEnemies = [...state.enemies];
  let newProjectiles = [...state.projectiles];
  let goldEarned = 0;

  // Update projectiles
  const projectileSpeed = 400; // pixels per second
  newProjectiles = newProjectiles
    .map((p) => ({
      ...p,
      progress: p.progress + (deltaTime * projectileSpeed) / distance(p.fromX, p.fromY, p.toX, p.toY),
    }))
    .filter((p) => {
      if (p.progress >= 1) {
        // Hit the target
        const targetIndex = newEnemies.findIndex((e) => e.id === p.targetId);
        if (targetIndex !== -1) {
          const target = newEnemies[targetIndex];
          const newHealth = target.health - p.damage;
          if (newHealth <= 0) {
            goldEarned += target.goldReward;
            newEnemies.splice(targetIndex, 1);
          } else {
            newEnemies[targetIndex] = { ...target, health: newHealth };
          }
        }
        return false;
      }
      return true;
    });

  // Update defenders (attack logic)
  const newDefenders = state.defenders.map((defender) => {
    const attackInterval = 1000 / defender.attackSpeed;
    if (currentTime - defender.lastAttackTime >= attackInterval) {
      const target = findTarget(defender, newEnemies);
      if (target) {
        newProjectiles.push(createProjectile(defender, target));
        return { ...defender, lastAttackTime: currentTime, target: target.id };
      }
    }
    return defender;
  });

  // Update enemies (movement)
  let bastionDamage = 0;
  newEnemies = newEnemies
    .map((enemy) => {
      // Move toward bastion
      const dx = enemy.targetX - enemy.x;
      const dy = enemy.targetY - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 30) {
        const moveX = (dx / dist) * enemy.speed * (deltaTime / 1000);
        const moveY = (dy / dist) * enemy.speed * (deltaTime / 1000);
        return { ...enemy, x: enemy.x + moveX, y: enemy.y + moveY };
      } else {
        // Attack the bastion
        bastionDamage += enemy.damage;
        return null; // Remove enemy after attacking
      }
    })
    .filter((e): e is Enemy => e !== null);

  // Apply damage to bastion with armor reduction
  if (bastionDamage > 0) {
    const armorReduction = state.bastion.armor / 100;
    const actualDamage = bastionDamage * (1 - armorReduction);
    const newHealth = Math.max(0, state.bastion.health - actualDamage);

    newState.bastion = {
      ...state.bastion,
      health: newHealth,
    };

    if (newHealth <= 0) {
      newState.isGameOver = true;
    }
  }

  // Check if wave is complete
  if (state.isWaveActive && newEnemies.length === 0) {
    newState.isWaveActive = false;
  }

  return {
    ...newState,
    gold: state.gold + goldEarned,
    defenders: newDefenders,
    enemies: newEnemies,
    projectiles: newProjectiles,
  };
}

// Get display name for defender type
export function getDefenderName(type: DefenderType): string {
  const names: Record<DefenderType, string> = {
    soldier: 'Soldier',
    archer: 'Archer',
    wizard: 'Wizard',
  };
  return names[type];
}

// Get display name for enemy type
export function getEnemyName(type: EnemyType): string {
  const names: Record<EnemyType, string> = {
    goblin: 'Goblin',
    orc: 'Orc',
    troll: 'Troll',
    dragon: 'Dragon',
  };
  return names[type];
}

// Get emoji for defender type
export function getDefenderEmoji(type: DefenderType): string {
  const emojis: Record<DefenderType, string> = {
    soldier: '⚔️',
    archer: '🏹',
    wizard: '🧙',
  };
  return emojis[type];
}

// Get emoji for enemy type
export function getEnemyEmoji(type: EnemyType): string {
  const emojis: Record<EnemyType, string> = {
    goblin: '👺',
    orc: '👹',
    troll: '🧌',
    dragon: '🐉',
  };
  return emojis[type];
}
