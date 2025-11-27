# Overview
The current ticket system generates **one prize per ticket** and displays it across all scratch areas based on the `revealMechanic`. This approach doesn't align with how real scratch-off tickets work and limits gameplay flexibility.

**Current Issues**:
- All scratch areas show the same prize (or parts of it via progressive reveal)
- Win conditions are tied to revealing areas, not finding/matching prizes
- No authentic "searching" or "matching" gameplay
- Limited prize variation within a single ticket

**Proposed Solution**:
Refactor the system so that **each scratch area contains an independent prize**. This enables:
- Authentic scratch-off mechanics where players discover different prizes under each area
- True matching gameplay (match-two, match-three, etc.)
- More engaging ticket designs with varied prizes
- Simpler, more intuitive win conditions

# Technical Details

## Current Architecture Problems

### Prize Generation (`web/App.tsx`)
```typescript
// Current: One prize per ticket
const newPrize = getRandomPrizeForTicket(newLayout);
```

### Reveal Mechanic (`core/mechanics/ticketLayouts.ts`)
```typescript
// Current: Complex reveal mechanics that show same prize differently
export type RevealMechanic = 
  | 'reveal-all'      // Same prize in all areas
  | 'reveal-one'      // Prize in one area
  | 'progressive'     // Parts of prize across areas
  | 'match-three'     // Doesn't actually generate different prizes
  | 'match-two';
```

### Win Conditions
Current win conditions check if areas are revealed, not if prizes match:
- `reveal-all-areas` - Scratch everything
- `reveal-any-area` - Scratch anything
- `match-symbols` - Doesn't work properly without independent prizes

## Proposed Architecture

### 1. Prize Generation: One Prize Per Area
```typescript
// Generate array of prizes (one per scratch area)
const areaCount = layout.scratchAreas.length;
const areaPrizes: Prize[] = Array.from({ length: areaCount }, () => 
  getRandomPrizeForTicket(layout)
);
```

### 2. Simplified Reveal Mechanic
```typescript
// Each area is independent - no complex reveal logic needed
export type RevealMechanic = 'independent';
```

### 3. Clear Win Conditions
```typescript
export type WinCondition = 
  | 'no-win-condition'        // Always wins (show what you got)
  | 'find-one'                // Find at least one specific prize
  | 'match-two'               // Two areas have matching prizes
  | 'match-three'             // Three areas have matching prizes
  | 'match-all'               // All areas match (jackpot)
  | 'total-value-threshold';  // Combined prize value exceeds X
```

### 4. Updated Win Evaluation
```typescript
export function evaluateWinCondition(
  layout: TicketLayout,
  areaPrizes: Prize[],        // Array of prizes (one per area)
  revealedAreas: Set<string>
): boolean {
  const revealedPrizes = areaPrizes.filter((_, i) => 
    revealedAreas.has(layout.scratchAreas[i].id)
  );

  switch (layout.winCondition) {
    case 'no-win-condition':
      return true;
    
    case 'match-two':
      const emojiCounts = countMatches(revealedPrizes);
      return Object.values(emojiCounts).some(count => count >= 2);
    
    case 'match-three':
      const matches = countMatches(revealedPrizes);
      return Object.values(matches).some(count => count >= 3);
    
    // ... etc
  }
}
```

# Requirements

## 1. Update Type Definitions (`core/mechanics/ticketLayouts.ts`)

- [ ] Remove complex reveal mechanics, keep only `'independent'`
- [ ] Update `WinCondition` type with new conditions:
  - `'no-win-condition'`
  - `'find-one'` (with optional `targetPrizeId`)
  - `'match-two'`
  - `'match-three'`
  - `'match-all'`
  - `'total-value-threshold'` (with optional `threshold` value)
- [ ] Add optional fields to `TicketLayout`:
  - `targetPrizeId?: string` (for 'find-one' condition)
  - `valueThreshold?: number` (for 'total-value-threshold' condition)
- [ ] Update JSDoc comments to reflect new architecture

## 2. Update Prize Generation Logic

- [ ] Modify `web/App.tsx` to generate an array of prizes (one per area):
  ```typescript
  const areaPrizes = layout.scratchAreas.map(() => 
    getRandomPrizeForTicket(layout)
  );
  ```
- [ ] Update state to store `areaPrizes: Prize[]` instead of single `prize`
- [ ] Pass individual prizes to each scratch area component

## 3. Refactor Win Condition Evaluation

- [ ] Update `evaluateWinCondition()` signature:
  ```typescript
  export function evaluateWinCondition(
    layout: TicketLayout,
    areaPrizes: Prize[],
    revealedAreas: Set<string>
  ): boolean
  ```
- [ ] Implement matching logic:
  - Helper function `countMatches(prizes: Prize[]): Record<string, number>`
  - Check for 2-match, 3-match, all-match conditions
- [ ] Implement value threshold logic:
  - Sum revealed prize values
  - Compare against `layout.valueThreshold`
- [ ] Implement find-one logic:
  - Check if any revealed prize matches `layout.targetPrizeId`

## 4. Remove/Simplify Display Logic

- [ ] Remove `getPrizeDisplayForArea()` function (no longer needed)
- [ ] Update `ScratchTicketCSS.tsx` to display the prize directly from `areaPrizes[areaIndex]`
- [ ] Simplify prize rendering - each area just shows its own prize

## 5. Update Existing Ticket Layouts

Migrate existing layouts to new system:

### Classic Ticket
```typescript
revealMechanic: 'independent',
winCondition: 'match-three',  // Three areas must match
```

### Grid Ticket
```typescript
revealMechanic: 'independent',
winCondition: 'match-three',  // Find three matching symbols
```

### Single Area Ticket
```typescript
revealMechanic: 'independent',
winCondition: 'no-win-condition',  // Always wins
```

## 6. Update Component Logic (`web/components/ScratchTicketCSS.tsx`)

- [ ] Accept `areaPrizes: Prize[]` prop instead of single `prize`
- [ ] Update area rendering to use `areaPrizes[areaIndex]`
- [ ] Update completion checking to pass `areaPrizes` to `evaluateWinCondition()`
- [ ] Remove any reveal mechanic display logic

## 7. Update Documentation

- [ ] Update `TICKET_LAYOUTS.md`:
  - Document new win conditions
  - Remove old reveal mechanics documentation
  - Add examples of matching gameplay
  - Update best practices
- [ ] Update `README.md` if needed
- [ ] Add code comments explaining the new architecture

## 8. Testing & Validation

- [ ] Test each win condition:
  - `no-win-condition` always succeeds
  - `match-two` requires two matching prizes
  - `match-three` requires three matching prizes
  - `match-all` requires all areas to match
- [ ] Verify prize independence (each area has different prize)
- [ ] Test with different ticket layouts (classic, grid, single)
- [ ] Verify visual display shows correct prize per area
- [ ] Test edge cases (partially scratched, all scratched, etc.)

## 9. Dev Tooling Updates

- [ ] Update Layout Designer (`tools/layout-designer`) to:
  - Show new win condition options in UI
  - Remove old reveal mechanic selectors
  - Add fields for `targetPrizeId` and `valueThreshold`
  - Preview how prizes appear in each area
- [ ] Ensure layout export generates correct TypeScript code

# Out of Scope

- Creating new prize types (use existing prize system)
- Backend integration or persistence
- Animation changes to scratch mechanic
- Changes to scratcher capabilities
- Major UI/UX redesigns
- Sound effect modifications

# Migration Strategy

To maintain backward compatibility during development:

1. **Phase 1**: Add new types alongside old ones (don't break existing code)
2. **Phase 2**: Update core logic to support both systems
3. **Phase 3**: Migrate existing tickets one at a time
4. **Phase 4**: Remove deprecated code once all tickets are migrated

# Definition of Done

- [ ] Type definitions updated in `core/mechanics/ticketLayouts.ts`
- [ ] Prize generation creates one prize per scratch area
- [ ] Win condition evaluation works with prize arrays
- [ ] All existing ticket layouts migrated to new system
- [ ] Display logic simplified (removed `getPrizeDisplayForArea`)
- [ ] Component updated to use `areaPrizes` array
- [ ] All new win conditions tested and working:
  - `no-win-condition` ✓
  - `match-two` ✓
  - `match-three` ✓
  - `match-all` ✓
  - `total-value-threshold` ✓
- [ ] Documentation updated (`TICKET_LAYOUTS.md`)
- [ ] Dev tooling (Layout Designer) updated
- [ ] No regressions in existing functionality
- [ ] Code is clean, well-commented, and follows project conventions
- [ ] `npm run lint` and `npm run build` pass without errors
- [ ] Completion log updated in `kickstart-prompts/completed-log.md`

# Example Gameplay Scenarios

## Scenario 1: Budget Ticket (No Win Condition)
```typescript
{
  id: 'budget-ticket',
  winCondition: 'no-win-condition',
  // Player always "wins" - just reveals what they got
  // Could be 3 different small prizes
}
```

## Scenario 2: Match-Two Ticket
```typescript
{
  id: 'match-two-ticket',
  winCondition: 'match-two',
  scratchAreas: [5 areas],
  // Player scratches until they find 2 matching prizes
  // Areas might have: 🍒🍋🍒🔔🍇
  // Finding two 🍒 = WIN!
}
```

## Scenario 3: Find the Diamond
```typescript
{
  id: 'find-diamond-ticket',
  winCondition: 'find-one',
  targetPrizeId: 'diamond',
  // Player must find the specific diamond prize
  // Other areas contain different prizes
}
```

## Scenario 4: High Roller (Value Threshold)
```typescript
{
  id: 'high-roller-ticket',
  winCondition: 'total-value-threshold',
  valueThreshold: 100,
  // Combined value of revealed prizes must exceed 100 gold
  // Could reveal: 30 + 40 + 45 = 115 = WIN!
}
```