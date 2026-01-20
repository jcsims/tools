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
    enemies: [],
    adventureParties: [],
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
export function findMostPowerfulEnemy(enemies: Enemy[]): Enemy | null {
  if (enemies.length === 0) return null;

  // Calculate power score: health + damage * 5 (weight damage more)
  return enemies.reduce((most, current) => {
    const mostPower = most.health + most.damage * 5;
    const currentPower = current.health + current.damage * 5;
    return currentPower > mostPower ? current : most;
  });
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
        let moveX: number;
        let moveY: number;

        // Barbarians move erratically - they zigzag crazily!
        if (enemy.type === 'barbarian') {
          // Update erratic timer and angle
          const newTimer = (enemy.erraticTimer || 0) + deltaTime;
          let newAngle = enemy.erraticAngle || 0;

          // Change direction every 200-400ms
          if (newTimer > 200 + Math.random() * 200) {
            // Random angle change between -90 and +90 degrees from forward direction
            const forwardAngle = Math.atan2(dy, dx);
            newAngle = forwardAngle + (Math.random() - 0.5) * Math.PI;
            enemy.erraticTimer = 0;
          } else {
            enemy.erraticTimer = newTimer;
          }
          enemy.erraticAngle = newAngle;

          // Move with erratic angle but biased toward target
          const erraticFactor = 0.6; // How much the erratic movement influences direction
          const targetFactor = 1 - erraticFactor;
          const erraticMoveX = Math.cos(newAngle) * enemy.speed * (deltaTime / 1000) * erraticFactor;
          const erraticMoveY = Math.sin(newAngle) * enemy.speed * (deltaTime / 1000) * erraticFactor;
          const targetMoveX = (dx / dist) * enemy.speed * (deltaTime / 1000) * targetFactor;
          const targetMoveY = (dy / dist) * enemy.speed * (deltaTime / 1000) * targetFactor;

          moveX = erraticMoveX + targetMoveX;
          moveY = erraticMoveY + targetMoveY;

          // Keep barbarians in bounds (they're crazy but not that crazy)
          const newX = Math.max(0, Math.min(GAME_WIDTH, enemy.x + moveX));
          const newY = Math.max(50, Math.min(GAME_HEIGHT - 50, enemy.y + moveY));
          return { ...enemy, x: newX, y: newY };
        } else {
          // Normal enemies move straight toward bastion
          moveX = (dx / dist) * enemy.speed * (deltaTime / 1000);
          moveY = (dy / dist) * enemy.speed * (deltaTime / 1000);
          return { ...enemy, x: enemy.x + moveX, y: enemy.y + moveY };
        }
      } else {
        // Attack the bastion
        bastionDamage += enemy.damage;
        return null; // Remove enemy after attacking
      }
    })
    .filter((e): e is Enemy => e !== null);

  // Update adventure parties (they hunt powerful enemies!)
  let newAdventureParties = [...state.adventureParties];
  newAdventureParties = newAdventureParties.map((party) => {
    // Find or update target - always go for the most powerful enemy
    let target: Enemy | null = null;
    if (party.targetId) {
      target = newEnemies.find((e) => e.id === party.targetId) || null;
    }
    // Re-target if no target or periodically find better target
    if (!target) {
      target = findMostPowerfulEnemy(newEnemies);
    }

    if (!target) {
      // No enemies, stay in place
      return { ...party, targetId: null };
    }

    const dx = target.x - party.x;
    const dy = target.y - party.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Attack range for adventure parties
    const attackRange = 50;

    if (dist <= attackRange) {
      // In range - attack if cooldown is ready
      const attackInterval = 1000 / party.attackSpeed;
      if (currentTime - party.lastAttackTime >= attackInterval) {
        // Deal damage to the enemy
        const targetIndex = newEnemies.findIndex((e) => e.id === target!.id);
        if (targetIndex !== -1) {
          const newHealth = newEnemies[targetIndex].health - party.damage;
          if (newHealth <= 0) {
            goldEarned += newEnemies[targetIndex].goldReward;
            newEnemies.splice(targetIndex, 1);
          } else {
            newEnemies[targetIndex] = { ...newEnemies[targetIndex], health: newHealth };
          }
        }
        return { ...party, targetId: target.id, lastAttackTime: currentTime };
      }
      return { ...party, targetId: target.id };
    } else {
      // Move toward target
      const moveX = (dx / dist) * party.speed * (deltaTime / 1000);
      const moveY = (dy / dist) * party.speed * (deltaTime / 1000);
      return {
        ...party,
        x: party.x + moveX,
        y: party.y + moveY,
        targetId: target.id,
      };
    }
  });

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

  // Check if wave is complete (enemies and adventure parties finish their work)
  if (state.isWaveActive && newEnemies.length === 0) {
    newState.isWaveActive = false;
  }

  return {
    ...newState,
    gold: state.gold + goldEarned,
    defenders: newDefenders,
    enemies: newEnemies,
    adventureParties: newAdventureParties,
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
