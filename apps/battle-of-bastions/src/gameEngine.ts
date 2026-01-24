import {
  type GameState,
  type Defender,
  type Enemy,
  type WaveConfig,
  type DefenderType,
  type EnemyType,
  type Projectile,
  type AdventureParty,
  type AdventurePartyType,
  type AttackEffect,
  DEFENDER_STATS,
  ENEMY_STATS,
  BASTION_STATS,
  ADVENTURE_PARTY_STATS,
  BASTION_X,
  BASTION_Y,
  GAME_HEIGHT,
  GAME_WIDTH,
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
    enemies: new Map(),
    adventureParties: new Map(),
    projectiles: new Map(),
    attackEffects: [],
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

  const enemy: Enemy = {
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

  // Barbarians get erratic movement properties
  if (type === 'barbarian') {
    enemy.erraticAngle = Math.random() * Math.PI * 2;
    enemy.erraticTimer = 0;
  }

  return enemy;
}

// Create adventure party (good allies)
export function createAdventureParty(wave: number): AdventureParty {
  const stats = ADVENTURE_PARTY_STATS.adventurers;
  const health = stats.baseHealth + stats.healthPerWave * (wave - 1);

  // Spawn from right side (near the bastion, coming to help)
  const spawnY = 100 + Math.random() * (GAME_HEIGHT - 200);

  return {
    id: generateId(),
    type: 'adventurers' as AdventurePartyType,
    health,
    maxHealth: health,
    damage: stats.baseDamage + stats.damagePerWave * (wave - 1),
    attackSpeed: stats.baseAttackSpeed,
    speed: stats.baseSpeed,
    x: GAME_WIDTH - 100,
    y: spawnY,
    targetId: null,
    lastAttackTime: 0,
  };
}

// Generate wave configuration
export function generateWaveConfig(waveNumber: number): WaveConfig {
  const enemies: { type: EnemyType; count: number }[] = [];

  // Goblins appear from wave 1
  const goblinCount = Math.min(5 + waveNumber * 2, 20);
  enemies.push({ type: 'goblin', count: goblinCount });

  // Barbarians appear from wave 2 - fast and erratic!
  if (waveNumber >= 2) {
    const barbarianCount = Math.min(Math.floor((waveNumber - 1) * 1.2), 8);
    enemies.push({ type: 'barbarian', count: barbarianCount });
  }

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

// Calculate how many adventure parties should spawn for a wave
export function getAdventurePartyCount(waveNumber: number): number {
  // Adventure parties appear from wave 4 onwards
  if (waveNumber < 4) return 0;
  // Scale up slowly - max 3 parties
  return Math.min(Math.floor((waveNumber - 3) * 0.5) + 1, 3);
}

// Find the most powerful enemy (for adventure parties to target)
export function findMostPowerfulEnemy(enemies: Map<string, Enemy>): Enemy | null {
  if (enemies.size === 0) return null;

  let most: Enemy | null = null;
  let mostPower = -Infinity;

  // Calculate power score: health + damage * 5 (weight damage more)
  for (const enemy of enemies.values()) {
    const power = enemy.health + enemy.damage * 5;
    if (power > mostPower) {
      most = enemy;
      mostPower = power;
    }
  }

  return most;
}

// Calculate distance between two points
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Calculate squared distance (faster - avoids sqrt for comparisons)
export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

// Find closest enemy within range (uses squared distance for performance)
export function findTarget(defender: Defender, enemies: Map<string, Enemy>): Enemy | null {
  let closest: Enemy | null = null;
  let closestDistSq = Infinity;
  const rangeSq = defender.range * defender.range;

  for (const enemy of enemies.values()) {
    const distSq = distanceSquared(defender.x, defender.y, enemy.x, enemy.y);
    if (distSq <= rangeSq && distSq < closestDistSq) {
      closest = enemy;
      closestDistSq = distSq;
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

  // Track changes to avoid unnecessary object creation
  let goldEarned = 0;
  let bastionDamage = 0;
  const enemiesToDelete = new Set<string>();
  const projectilesToDelete = new Set<string>();

  // Use Maps for O(1) lookups - clone only if we make changes
  const enemyUpdates = new Map<string, Enemy>();
  const projectileUpdates = new Map<string, Projectile>();
  const partyUpdates = new Map<string, AdventureParty>();
  let newAttackEffects: AttackEffect[] | null = null;

  // Update projectiles
  const projectileSpeed = 400;
  for (const [id, p] of state.projectiles) {
    const dist = distance(p.fromX, p.fromY, p.toX, p.toY);
    const newProgress = p.progress + (deltaTime * projectileSpeed) / dist;

    if (newProgress >= 1) {
      // Hit the target
      projectilesToDelete.add(id);
      const target = state.enemies.get(p.targetId) ?? enemyUpdates.get(p.targetId);
      if (target && !enemiesToDelete.has(p.targetId)) {
        const newHealth = target.health - p.damage;
        if (newHealth <= 0) {
          goldEarned += target.goldReward;
          enemiesToDelete.add(p.targetId);
        } else {
          enemyUpdates.set(p.targetId, { ...target, health: newHealth });
        }
      }
    } else {
      // Only update if progress changed significantly
      projectileUpdates.set(id, { ...p, progress: newProgress });
    }
  }

  // Build working enemies map (original + updates - deleted)
  const workingEnemies = new Map<string, Enemy>();
  for (const [id, enemy] of state.enemies) {
    if (!enemiesToDelete.has(id)) {
      workingEnemies.set(id, enemyUpdates.get(id) ?? enemy);
    }
  }

  // Update defenders (attack logic)
  let defendersChanged = false;
  const newDefenders = state.defenders.map((defender) => {
    const attackInterval = 1000 / defender.attackSpeed;
    if (currentTime - defender.lastAttackTime >= attackInterval) {
      const target = findTarget(defender, workingEnemies);
      if (target) {
        const projectile = createProjectile(defender, target);
        projectileUpdates.set(projectile.id, projectile);
        defendersChanged = true;
        return { ...defender, lastAttackTime: currentTime, target: target.id };
      }
    }
    return defender;
  });

  // Clean up expired attack effects (only create new array if needed)
  const validEffects = state.attackEffects.filter(
    (effect) => currentTime - effect.createdAt < effect.duration
  );
  if (validEffects.length !== state.attackEffects.length) {
    newAttackEffects = validEffects;
  }

  // Update enemies (movement)
  for (const [id, enemy] of workingEnemies) {
    const dx = enemy.targetX - enemy.x;
    const dy = enemy.targetY - enemy.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist > 30) {
      let newX: number;
      let newY: number;
      let newErraticTimer = enemy.erraticTimer;
      let newErraticAngle = enemy.erraticAngle;

      // Barbarians move erratically
      if (enemy.type === 'barbarian') {
        const newTimer = (enemy.erraticTimer || 0) + deltaTime;
        let angle = enemy.erraticAngle || 0;

        if (newTimer > 200 + Math.random() * 200) {
          const forwardAngle = Math.atan2(dy, dx);
          angle = forwardAngle + (Math.random() - 0.5) * Math.PI;
          newErraticTimer = 0;
        } else {
          newErraticTimer = newTimer;
        }
        newErraticAngle = angle;

        const erraticFactor = 0.6;
        const targetFactor = 0.4;
        const moveX = Math.cos(angle) * enemy.speed * (deltaTime / 1000) * erraticFactor +
                      (dx / dist) * enemy.speed * (deltaTime / 1000) * targetFactor;
        const moveY = Math.sin(angle) * enemy.speed * (deltaTime / 1000) * erraticFactor +
                      (dy / dist) * enemy.speed * (deltaTime / 1000) * targetFactor;

        newX = Math.max(0, Math.min(GAME_WIDTH, enemy.x + moveX));
        newY = Math.max(50, Math.min(GAME_HEIGHT - 50, enemy.y + moveY));
      } else {
        const moveX = (dx / dist) * enemy.speed * (deltaTime / 1000);
        const moveY = (dy / dist) * enemy.speed * (deltaTime / 1000);
        newX = enemy.x + moveX;
        newY = enemy.y + moveY;
      }

      enemyUpdates.set(id, {
        ...enemy,
        x: newX,
        y: newY,
        erraticTimer: newErraticTimer,
        erraticAngle: newErraticAngle,
      });
    } else {
      // Attack the bastion
      bastionDamage += enemy.damage;
      enemiesToDelete.add(id);

      if (!newAttackEffects) {
        newAttackEffects = [...state.attackEffects].filter(
          (effect) => currentTime - effect.createdAt < effect.duration
        );
      }
      newAttackEffects.push({
        id: generateId(),
        enemyType: enemy.type,
        x: enemy.x,
        y: enemy.y,
        createdAt: currentTime,
        duration: 500,
      });
    }
  }

  // Update adventure parties
  for (const [id, party] of state.adventureParties) {
    let target: Enemy | null = null;

    // Check existing target (O(1) lookup)
    if (party.targetId) {
      const existingTarget = enemyUpdates.get(party.targetId) ?? state.enemies.get(party.targetId);
      if (existingTarget && !enemiesToDelete.has(party.targetId)) {
        target = existingTarget;
      }
    }

    // Find new target if needed
    if (!target) {
      // Build final enemies map for targeting
      const finalEnemies = new Map<string, Enemy>();
      for (const [eid, enemy] of state.enemies) {
        if (!enemiesToDelete.has(eid)) {
          finalEnemies.set(eid, enemyUpdates.get(eid) ?? enemy);
        }
      }
      target = findMostPowerfulEnemy(finalEnemies);
    }

    if (!target) {
      if (party.targetId !== null) {
        partyUpdates.set(id, { ...party, targetId: null });
      }
      continue;
    }

    const dx = target.x - party.x;
    const dy = target.y - party.y;
    const distSq = dx * dx + dy * dy;
    const attackRangeSq = 50 * 50;

    if (distSq <= attackRangeSq) {
      const attackInterval = 1000 / party.attackSpeed;
      if (currentTime - party.lastAttackTime >= attackInterval) {
        // Deal damage
        if (!enemiesToDelete.has(target.id)) {
          const currentTarget = enemyUpdates.get(target.id) ?? target;
          const newHealth = currentTarget.health - party.damage;
          if (newHealth <= 0) {
            goldEarned += currentTarget.goldReward;
            enemiesToDelete.add(target.id);
          } else {
            enemyUpdates.set(target.id, { ...currentTarget, health: newHealth });
          }
        }
        partyUpdates.set(id, { ...party, targetId: target.id, lastAttackTime: currentTime });
      } else if (party.targetId !== target.id) {
        partyUpdates.set(id, { ...party, targetId: target.id });
      }
    } else {
      const dist = Math.sqrt(distSq);
      const moveX = (dx / dist) * party.speed * (deltaTime / 1000);
      const moveY = (dy / dist) * party.speed * (deltaTime / 1000);
      partyUpdates.set(id, {
        ...party,
        x: party.x + moveX,
        y: party.y + moveY,
        targetId: target.id,
      });
    }
  }

  // Build final state - only create new objects if there were changes
  let newBastion = state.bastion;
  let isGameOver: boolean = state.isGameOver;

  if (bastionDamage > 0) {
    const armorReduction = state.bastion.armor / 100;
    const actualDamage = bastionDamage * (1 - armorReduction);
    const newHealth = Math.max(0, state.bastion.health - actualDamage);
    newBastion = { ...state.bastion, health: newHealth };
    if (newHealth <= 0) {
      isGameOver = true;
    }
  }

  // Build final enemies Map
  const finalEnemies = new Map<string, Enemy>();
  for (const [id, enemy] of state.enemies) {
    if (!enemiesToDelete.has(id)) {
      finalEnemies.set(id, enemyUpdates.get(id) ?? enemy);
    }
  }

  // Build final projectiles Map
  const finalProjectiles = new Map<string, Projectile>();
  for (const [id] of state.projectiles) {
    if (!projectilesToDelete.has(id)) {
      const updated = projectileUpdates.get(id);
      if (updated) {
        finalProjectiles.set(id, updated);
      }
    }
  }
  // Add new projectiles
  for (const [id, proj] of projectileUpdates) {
    if (!state.projectiles.has(id)) {
      finalProjectiles.set(id, proj);
    }
  }

  // Build final parties Map
  const finalParties = new Map<string, AdventureParty>();
  for (const [id, party] of state.adventureParties) {
    finalParties.set(id, partyUpdates.get(id) ?? party);
  }

  // Check wave completion
  let isWaveActive = state.isWaveActive;
  if (state.isWaveActive && finalEnemies.size === 0) {
    isWaveActive = false;
  }

  return {
    ...state,
    gold: state.gold + goldEarned,
    bastion: newBastion,
    isGameOver,
    isWaveActive,
    defenders: defendersChanged ? newDefenders : state.defenders,
    enemies: finalEnemies,
    adventureParties: finalParties,
    projectiles: finalProjectiles,
    attackEffects: newAttackEffects ?? state.attackEffects,
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
    barbarian: 'Barbarian',
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
    barbarian: '🪓',
  };
  return emojis[type];
}
