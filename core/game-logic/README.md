# Game Logic

**Status**: Placeholder for future game-specific logic

This directory is reserved for game-specific logic that builds upon the core mechanics. While `/core/mechanics` contains low-level game mechanics (prizes, tickets, scratchers), this directory will contain higher-level game systems.

## Planned Systems

### Player Progression
- Experience points and leveling
- Stat management (HP, Attack, Defense)
- Skill unlocks and upgrades
- Achievement tracking

### Level Management
- Level progression system
- Difficulty scaling
- Area unlocking
- Boss encounters

### Inventory System
- Item collection and storage
- Equipment management
- Consumable items
- Currency tracking

### Combat/Encounter System
- Enemy definitions and AI
- Battle mechanics
- Damage calculation
- Reward distribution

### Persistence
- Save game state
- Load game state
- Cloud sync (optional)
- Profile management

## Future Structure

```
core/game-logic/
├── player/
│   ├── progression.ts     # Player leveling and XP
│   ├── stats.ts          # HP, Attack, Defense
│   └── inventory.ts      # Item management
├── encounters/
│   ├── enemies.ts        # Enemy definitions
│   ├── combat.ts         # Battle system
│   └── rewards.ts        # Loot and prize distribution
├── levels/
│   ├── progression.ts    # Level flow
│   ├── difficulty.ts     # Difficulty scaling
│   └── unlocks.ts        # Feature unlocking
└── persistence/
    ├── saveGame.ts       # Save functionality
    └── loadGame.ts       # Load functionality
```

## Design Principles

When implementing game logic:

1. **Build on Mechanics** - Use `/core/mechanics` as foundation
2. **Platform Agnostic** - Keep logic separate from UI
3. **Type Safe** - Use TypeScript for all game state
4. **Testable** - Write unit tests for game systems
5. **Documented** - Include JSDoc comments
6. **Modular** - Keep systems loosely coupled

## Example: Player Progression (Future)

```typescript
// core/game-logic/player/progression.ts
export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

export function gainXP(player: PlayerStats, amount: number): PlayerStats {
  const newXp = player.xp + amount;
  if (newXp >= player.xpToNextLevel) {
    return levelUp(player);
  }
  return { ...player, xp: newXp };
}

export function levelUp(player: PlayerStats): PlayerStats {
  return {
    ...player,
    level: player.level + 1,
    xp: player.xp - player.xpToNextLevel,
    xpToNextLevel: calculateNextLevelXP(player.level + 1),
    maxHp: player.maxHp + 10,
    hp: player.maxHp + 10,
    attack: player.attack + 5,
    defense: player.defense + 3,
  };
}
```

## Integration with Mechanics

Game logic will interact with core mechanics:

```typescript
// Example: Using prizes in combat rewards
import { getRandomPrize } from '../mechanics/prizes';
import type { Prize } from '../mechanics/prizes';

export function generateBattleReward(enemyLevel: number): Prize {
  // Use existing prize system from mechanics
  const basePrize = getRandomPrize();
  
  // Apply game logic modifications based on enemy level
  return enhancePrizeByLevel(basePrize, enemyLevel);
}
```

## Usage in Apps

Both web and mobile apps will import from game-logic:

```typescript
// In web or mobile app
import { gainXP, type PlayerStats } from '../core/game-logic/player/progression';
import { generateBattleReward } from '../core/game-logic/encounters/rewards';

// Use in component
const player = gainXP(currentPlayer, 100);
const reward = generateBattleReward(enemyLevel);
```

## Current Status

This directory is currently empty and serves as a placeholder for future development. The focus is currently on:
1. Establishing the project structure
2. Implementing core mechanics
3. Building the UI for web and mobile

Game-specific logic will be added in future development phases.
