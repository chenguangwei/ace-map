# Ace Map Arcade-First Implementation Plan

## Objective
Implement the first production slice of the arcade-first redesign without destabilizing existing topic pages and quiz SEO flows.

## Phase 1: Establish the play-first shell
- Create a dedicated arcade lobby route and treat it as the primary entry to gameplay.
- Keep existing quiz and topic pages intact, but route their primary CTA into the arcade run flow.
- Define a new mode model for `flash`, `terrain-rush`, `precision-drop`, and `fog-duel`.

## Phase 2: Upgrade the game state model
- Extend the current game reducer to support run seeds, streak heat, question subtypes, and hint usage costs.
- Split question logic from plain place iteration so the runtime can generate click-region and pin variants from the same content pool.
- Add result metadata for response speed, hint consumption, and near-miss classification.

## Phase 3: Introduce geometry-aware region play
- Add feature identifiers and region geometry sources for click-region hit testing.
- Implement forgiving interaction rules for small areas, including halo or nearest-feature correction.
- Preserve the current pin fallback for datasets that do not yet have polygon support.

## Phase 4: Build the voice feedback layer
- Add a client-side voice controller that can queue, interrupt, and prioritize short callouts.
- Implement click-name playback as the first required behavior.
- Add target-name playback and short hype callouts behind the same controller.
- Ensure audio failure degrades silently to visual-only feedback.

## Phase 5: Build reveal and feedback states
- Replace simple submit feedback with explicit reveal states for `click`, `wrong`, `correct`, `near-miss`, and `streak`.
- Add separate visual treatment for region-click and precision-pin answers.
- Add adjacency-aware reveal hooks for future hint and terrain expansion.

## Phase 6: Ship Flash Mode MVP
- Lock Flash Mode as the default run type.
- Use a mixed question schedule with mostly click-region prompts and occasional pin prompts.
- Add two hint levels only: macro and spatial.
- Implement seeded daily runs using deterministic shuffling.

## Phase 7: Instrument and validate
- Track replay-start rate, second-run rate, streak length, hint usage, and completion rate.
- Compare run replay metrics against the current game page baseline.
- Review whether audio improves rapid correction and perceived responsiveness.

## Architecture Notes

### Existing files likely to change
- `src/lib/utils/game.ts`
- `src/lib/components/game/Main.tsx`
- `src/lib/components/game/Game.tsx`
- `src/lib/components/game/GameBar.tsx`
- `src/lib/utils/places.ts`
- `src/lib/data/quizTopics.ts`
- `src/app/game/page.tsx`

### New modules likely needed
- `src/lib/audio/voiceController.ts`
- `src/lib/game/modes.ts`
- `src/lib/game/questionFactory.ts`
- `src/lib/game/hints.ts`
- `src/lib/game/revealState.ts`
- `src/lib/data/geometry/*`
- `src/app/play/page.tsx`

## Risks
- Region geometry quality may vary by country and can block consistent click detection.
- Overusing voice can become noisy if priorities and interruption rules are weak.
- Too many animations can slow the loop and reduce arcade feel.
- Terrain mode should not enter MVP until the base Flash loop is already satisfying.

## Testing Plan
- Add reducer-level tests for run seeds, streak state, scoring, and hint penalties.
- Add component-level tests for reveal transitions and button state changes where practical.
- Perform manual latency checks for click-to-voice responsiveness and rapid repeat taps.
- Dogfood the run loop on desktop and mobile before expanding content breadth.

## Delivery Strategy
Start with the smallest slice that changes the feel of the product:

1. Arcade lobby
2. Flash Mode state model
3. Region click detection
4. Click-name voice playback
5. Improved reveal feedback
6. Daily run and replay-first results

Only after this slice lands should Terrain Rush and Fog Duel move into active implementation.
