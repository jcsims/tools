import { useState, useEffect, useRef, useCallback } from 'react';
import {
  type GameState,
  type DefenderType,
  type EnemyType,
  type WaveConfig,
  type AdventureParty,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLACEMENT_ZONE,
  BASTION_X,
  BASTION_Y,
  ENEMY_STATS,
  ADVENTURE_PARTY_STATS,
} from './types';
import {
  createInitialState,
  createDefender,
  upgradeDefender,
  createEnemy,
  createAdventureParty,
  generateWaveConfig,
  getAdventurePartyCount,
  updateGameState,
  getDefenderCost,
  getDefenderUpgradeCost,
  getBastionUpgradeCost,
  getBastionMaxHealth,
  getBastionArmor,
  getDefenderName,
  getEnemyName,
} from './gameEngine';
import './App.css';

// Import defender and bastion images
import archerImg from './assets/archer.png';
import knightImg from './assets/knight.png';
import wizardImg from './assets/wizard.png';
import castleImg from './assets/castle.png';

// Import enemy images
import goblinImg from './assets/goblin.png';
import orcImg from './assets/orc.png';
import trollImg from './assets/troll.png';
import dragonImg from './assets/dragon.png';
import barbarianImg from './assets/barbarian.png';

// Import ally images
import adventurerImg from './assets/adventurer.png';

// Map defender types to their images
const defenderImages: Record<DefenderType, string> = {
  soldier: knightImg,
  archer: archerImg,
  wizard: wizardImg,
};

// Map enemy types to their images
const enemyImages: Record<EnemyType, string> = {
  goblin: goblinImg,
  orc: orcImg,
  troll: trollImg,
  dragon: dragonImg,
  barbarian: barbarianImg,
};

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [waveConfig, setWaveConfig] = useState<WaveConfig | null>(null);
  const [selectedDefenderId, setSelectedDefenderId] = useState<string | null>(null);
  const [showBestiary, setShowBestiary] = useState(false);
  const spawnQueueRef = useRef<{ type: string; count: number }[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(performance.now());

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastUpdateRef.current;
      lastUpdateRef.current = timestamp;

      setGameState((prev) => {
        // Spawn enemies during active wave
        if (prev.isWaveActive && waveConfig && spawnQueueRef.current.length > 0) {
          if (timestamp - lastSpawnTimeRef.current >= waveConfig.spawnInterval) {
            const queue = spawnQueueRef.current;
            if (queue.length > 0 && queue[0].count > 0) {
              const enemyType = queue[0].type as 'goblin' | 'orc' | 'troll' | 'dragon';
              const newEnemy = createEnemy(enemyType, prev.wave);
              queue[0].count--;
              if (queue[0].count === 0) {
                queue.shift();
              }
              lastSpawnTimeRef.current = timestamp;
              return {
                ...updateGameState(prev, deltaTime, timestamp),
                enemies: [...prev.enemies, newEnemy],
              };
            }
          }
        }

        return updateGameState(prev, deltaTime, timestamp);
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [waveConfig]);

  // Start wave
  const startWave = useCallback(() => {
    const nextWave = gameState.wave + 1;
    const config = generateWaveConfig(nextWave);
    setWaveConfig(config);

    // Setup spawn queue
    spawnQueueRef.current = config.enemies.map((e) => ({ ...e }));
    lastSpawnTimeRef.current = 0;

    // Spawn adventure parties (good guys that help!)
    const partyCount = getAdventurePartyCount(nextWave);
    const newParties: AdventureParty[] = [];
    for (let i = 0; i < partyCount; i++) {
      newParties.push(createAdventureParty(nextWave));
    }

    setGameState((prev) => ({
      ...prev,
      wave: nextWave,
      isWaveActive: true,
      adventureParties: [...prev.adventureParties, ...newParties],
    }));
  }, [gameState.wave]);

  // Handle canvas click for placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameState.placementMode || !gameState.selectedDefenderType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is in placement zone
    if (
      x >= PLACEMENT_ZONE.x &&
      x <= PLACEMENT_ZONE.x + PLACEMENT_ZONE.width &&
      y >= PLACEMENT_ZONE.y &&
      y <= PLACEMENT_ZONE.y + PLACEMENT_ZONE.height
    ) {
      const cost = getDefenderCost(gameState.selectedDefenderType);
      if (gameState.gold >= cost) {
        const newDefender = createDefender(gameState.selectedDefenderType, x, y);
        setGameState((prev) => ({
          ...prev,
          gold: prev.gold - cost,
          defenders: [...prev.defenders, newDefender],
          placementMode: false,
          selectedDefenderType: null,
        }));
      }
    }
  };

  // Select defender type for placement
  const selectDefenderType = (type: DefenderType) => {
    const cost = getDefenderCost(type);
    if (gameState.gold >= cost) {
      setGameState((prev) => ({
        ...prev,
        selectedDefenderType: type,
        placementMode: true,
      }));
      setSelectedDefenderId(null);
    }
  };

  // Cancel placement mode
  const cancelPlacement = () => {
    setGameState((prev) => ({
      ...prev,
      placementMode: false,
      selectedDefenderType: null,
    }));
  };

  // Select a placed defender
  const selectDefender = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameState.placementMode) {
      setSelectedDefenderId(id === selectedDefenderId ? null : id);
    }
  };

  // Upgrade selected defender
  const upgradeSelectedDefender = () => {
    if (!selectedDefenderId) return;

    const defender = gameState.defenders.find((d) => d.id === selectedDefenderId);
    if (!defender) return;

    const cost = getDefenderUpgradeCost(defender.type, defender.level);
    if (gameState.gold >= cost) {
      setGameState((prev) => ({
        ...prev,
        gold: prev.gold - cost,
        defenders: prev.defenders.map((d) =>
          d.id === selectedDefenderId ? upgradeDefender(d) : d
        ),
      }));
    }
  };

  // Upgrade bastion
  const upgradeBastion = () => {
    const cost = getBastionUpgradeCost(gameState.bastion.level);
    if (gameState.gold >= cost) {
      const newLevel = gameState.bastion.level + 1;
      const newMaxHealth = getBastionMaxHealth(newLevel);
      const healthIncrease = newMaxHealth - gameState.bastion.maxHealth;

      setGameState((prev) => ({
        ...prev,
        gold: prev.gold - cost,
        bastion: {
          level: newLevel,
          maxHealth: newMaxHealth,
          health: Math.min(prev.bastion.health + healthIncrease, newMaxHealth),
          armor: getBastionArmor(newLevel),
        },
      }));
    }
  };

  // Toggle pause
  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Restart game
  const restartGame = () => {
    setGameState(createInitialState());
    setWaveConfig(null);
    setSelectedDefenderId(null);
    spawnQueueRef.current = [];
  };

  // Collect wave bonus
  const collectWaveBonus = useCallback(() => {
    if (!gameState.isWaveActive && waveConfig && gameState.wave > 0) {
      setGameState((prev) => ({
        ...prev,
        gold: prev.gold + waveConfig.goldBonus,
      }));
      setWaveConfig(null);
    }
  }, [gameState.isWaveActive, gameState.wave, waveConfig]);

  // Auto-collect wave bonus
  useEffect(() => {
    if (!gameState.isWaveActive && gameState.enemies.length === 0 && waveConfig) {
      const timer = setTimeout(collectWaveBonus, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isWaveActive, gameState.enemies.length, waveConfig, collectWaveBonus]);

  const selectedDefender = selectedDefenderId
    ? gameState.defenders.find((d) => d.id === selectedDefenderId)
    : null;

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Battle of Bastions</h1>
        <div className="header-stats">
          <span className="gold">Gold: {gameState.gold}</span>
          <span className="wave">Wave: {gameState.wave}</span>
          <span className="health">
            Bastion: {Math.ceil(gameState.bastion.health)}/{gameState.bastion.maxHealth}
          </span>
        </div>
      </header>

      <div className="game-content">
        <div className="game-area" onClick={handleCanvasClick}>
          {/* Placement zone indicator */}
          {gameState.placementMode && (
            <div
              className="placement-zone"
              style={{
                left: PLACEMENT_ZONE.x,
                top: PLACEMENT_ZONE.y,
                width: PLACEMENT_ZONE.width,
                height: PLACEMENT_ZONE.height,
              }}
            />
          )}

          {/* Bastion */}
          <div
            className="bastion"
            style={{ left: BASTION_X - 40, top: BASTION_Y - 50 }}
          >
            <img src={castleImg} alt="Bastion" className="bastion-icon" />
            <div className="bastion-level">Lv.{gameState.bastion.level}</div>
            <div className="bastion-health-bar">
              <div
                className="bastion-health-fill"
                style={{
                  width: `${(gameState.bastion.health / gameState.bastion.maxHealth) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Defenders */}
          {gameState.defenders.map((defender) => (
            <div
              key={defender.id}
              className={`defender ${defender.type} ${selectedDefenderId === defender.id ? 'selected' : ''}`}
              style={{ left: defender.x - 20, top: defender.y - 20 }}
              onClick={(e) => selectDefender(defender.id, e)}
            >
              <img src={defenderImages[defender.type]} alt={defender.type} className="defender-img" />
              <span className="defender-level">{defender.level}</span>
              {selectedDefenderId === defender.id && (
                <div
                  className="range-indicator"
                  style={{
                    width: defender.range * 2,
                    height: defender.range * 2,
                    left: 20 - defender.range,
                    top: 20 - defender.range,
                  }}
                />
              )}
            </div>
          ))}

          {/* Enemies (Evil) */}
          {gameState.enemies.map((enemy) => (
            <div
              key={enemy.id}
              className={`enemy ${enemy.type}`}
              style={{ left: enemy.x - 15, top: enemy.y - 15 }}
            >
              <img src={enemyImages[enemy.type]} alt={enemy.type} className="enemy-img" />
              <div className="enemy-health-bar">
                <div
                  className="enemy-health-fill"
                  style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Adventure Parties (Good allies!) */}
          {gameState.adventureParties.map((party) => (
            <div
              key={party.id}
              className="adventure-party"
              style={{ left: party.x - 18, top: party.y - 18 }}
            >
              <img src={adventurerImg} alt="Adventure Party" className="party-img" />
              <div className="party-health-bar">
                <div
                  className="party-health-fill"
                  style={{ width: `${(party.health / party.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Projectiles */}
          {gameState.projectiles.map((proj) => {
            const x = proj.fromX + (proj.toX - proj.fromX) * proj.progress;
            const y = proj.fromY + (proj.toY - proj.fromY) * proj.progress;
            return (
              <div
                key={proj.id}
                className={`projectile ${proj.type}`}
                style={{ left: x - 4, top: y - 4 }}
              />
            );
          })}

          {/* Attack effects on bastion */}
          {gameState.attackEffects.map((effect) => (
            <div
              key={effect.id}
              className={`attack-effect ${effect.enemyType}`}
              style={{ left: effect.x - 20, top: effect.y - 20 }}
            >
              <img src={enemyImages[effect.enemyType]} alt={effect.enemyType} className="attack-enemy-img" />
              <div className="attack-slash" />
            </div>
          ))}

          {/* Game over overlay */}
          {gameState.isGameOver && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>Game Over</h2>
                <p>You survived {gameState.wave} waves!</p>
                <button onClick={restartGame}>Play Again</button>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {gameState.isPaused && !gameState.isGameOver && (
            <div className="pause-overlay">
              <div className="pause-content">
                <h2>Paused</h2>
                <button onClick={togglePause}>Resume</button>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          {/* Controls */}
          <div className="control-panel">
            <h3>Controls</h3>
            <div className="control-buttons">
              {!gameState.isWaveActive && !gameState.isGameOver && (
                <button className="start-wave-btn" onClick={startWave}>
                  Start Wave {gameState.wave + 1}
                </button>
              )}
              {gameState.isWaveActive && (
                <button onClick={togglePause}>
                  {gameState.isPaused ? 'Resume' : 'Pause'}
                </button>
              )}
            </div>
          </div>

          {/* Defender shop */}
          <div className="shop-panel">
            <h3>Recruit Units</h3>
            <div className="shop-items">
              {(['soldier', 'archer', 'wizard'] as DefenderType[]).map((type) => {
                const cost = getDefenderCost(type);
                const canAfford = gameState.gold >= cost;
                return (
                  <button
                    key={type}
                    className={`shop-item ${gameState.selectedDefenderType === type ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                    onClick={() => selectDefenderType(type)}
                    disabled={!canAfford}
                  >
                    <img src={defenderImages[type]} alt={type} className="item-img" />
                    <span className="item-name">{getDefenderName(type)}</span>
                    <span className="item-cost">{cost}g</span>
                  </button>
                );
              })}
            </div>
            {gameState.placementMode && (
              <button className="cancel-btn" onClick={cancelPlacement}>
                Cancel Placement
              </button>
            )}
          </div>

          {/* Selected defender info */}
          {selectedDefender && (
            <div className="selected-panel">
              <h3>
                <img src={defenderImages[selectedDefender.type]} alt={selectedDefender.type} className="panel-img" /> {getDefenderName(selectedDefender.type)}
              </h3>
              <div className="stats">
                <p>Level: {selectedDefender.level}</p>
                <p>Damage: {selectedDefender.damage}</p>
                <p>Speed: {selectedDefender.attackSpeed.toFixed(2)}/s</p>
                <p>Range: {selectedDefender.range}px</p>
              </div>
              <button
                className="upgrade-btn"
                onClick={upgradeSelectedDefender}
                disabled={
                  gameState.gold < getDefenderUpgradeCost(selectedDefender.type, selectedDefender.level)
                }
              >
                Upgrade ({getDefenderUpgradeCost(selectedDefender.type, selectedDefender.level)}g)
              </button>
            </div>
          )}

          {/* Bastion upgrade */}
          <div className="bastion-panel">
            <h3>Bastion (Lv.{gameState.bastion.level})</h3>
            <div className="stats">
              <p>Health: {gameState.bastion.maxHealth}</p>
              <p>Armor: {gameState.bastion.armor}%</p>
            </div>
            <button
              className="upgrade-btn"
              onClick={upgradeBastion}
              disabled={gameState.gold < getBastionUpgradeCost(gameState.bastion.level)}
            >
              Upgrade ({getBastionUpgradeCost(gameState.bastion.level)}g)
            </button>
          </div>

          {/* Wave info */}
          {waveConfig && gameState.isWaveActive && (
            <div className="wave-panel">
              <h3>Wave {waveConfig.waveNumber}</h3>
              <div className="wave-enemies">
                {waveConfig.enemies.map((e, i) => (
                  <p key={i}>
                    <img src={enemyImages[e.type as EnemyType]} alt={e.type} className="wave-enemy-img" /> x{e.count}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Bestiary Button */}
          <button className="bestiary-btn" onClick={() => setShowBestiary(true)}>
            View Bestiary
          </button>
        </div>
      </div>

      {/* Bestiary Modal */}
      {showBestiary && (
        <div className="bestiary-overlay" onClick={() => setShowBestiary(false)}>
          <div className="bestiary-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Bestiary</h2>
            <button className="close-btn" onClick={() => setShowBestiary(false)}>X</button>

            <div className="bestiary-content">
              <div className="bestiary-section">
                <h3 className="evil-header">Evil Forces</h3>
                {(['goblin', 'barbarian', 'orc', 'troll', 'dragon'] as EnemyType[]).map((type) => {
                  const stats = ENEMY_STATS[type];
                  return (
                    <div key={type} className={`bestiary-entry evil ${type}`}>
                      <img src={enemyImages[type]} alt={type} className="bestiary-img" />
                      <div className="bestiary-info">
                        <h4>{getEnemyName(type)}</h4>
                        <div className="bestiary-stats">
                          <span>HP: {stats.baseHealth}</span>
                          <span>DMG: {stats.baseDamage}</span>
                          <span>SPD: {stats.baseSpeed}</span>
                          <span>Gold: {stats.baseGoldReward}</span>
                        </div>
                        <p className="bestiary-desc">
                          {type === 'goblin' && 'Weak but numerous. The basic enemy force.'}
                          {type === 'barbarian' && 'Fast and erratic! Moves unpredictably.'}
                          {type === 'orc' && 'Strong warriors with heavy damage.'}
                          {type === 'troll' && 'Massive brutes that can take a beating.'}
                          {type === 'dragon' && 'The ultimate threat. Extremely powerful.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bestiary-section">
                <h3 className="good-header">Good Allies</h3>
                <div className="bestiary-entry good">
                  <img src={adventurerImg} alt="Adventure Party" className="bestiary-img" />
                  <div className="bestiary-info">
                    <h4>Adventure Party</h4>
                    <div className="bestiary-stats">
                      <span>HP: {ADVENTURE_PARTY_STATS.adventurers.baseHealth}</span>
                      <span>DMG: {ADVENTURE_PARTY_STATS.adventurers.baseDamage}</span>
                      <span>SPD: {ADVENTURE_PARTY_STATS.adventurers.baseSpeed}</span>
                      <span>ATK SPD: {ADVENTURE_PARTY_STATS.adventurers.baseAttackSpeed}/s</span>
                    </div>
                    <p className="bestiary-desc">
                      Heroic allies that arrive to help! They seek out and attack the most powerful enemies on the battlefield. Appears from Wave 4 onwards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .game-area {
          width: ${GAME_WIDTH}px;
          height: ${GAME_HEIGHT}px;
        }
      `}</style>
    </div>
  );
}

export default App;
