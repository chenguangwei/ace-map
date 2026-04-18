# Ace Map Arcade-First Redesign

## Summary
Ace Map should evolve from an interactive geography quiz into a fast, replayable, voice-reactive arcade map game. The product goal is not to marginally improve classic map practice, but to surpass current quiz-style competitors by making map recognition feel immediate, physical, and habit-forming.

The winning product shape is:

- Short runs, typically 75-105 seconds
- Click-region gameplay as the primary backbone
- Precision pin and terrain recognition as controlled variations
- Voice, reveal, and hint systems that amplify flow instead of interrupting it
- A play-first information architecture with topic pages supporting discovery, not defining the product core

## Product Positioning

### What Ace Map should become
Ace Map should be positioned as a map arcade experience:

- Fast enough to support repeated sessions
- Expressive enough to feel different from study tools
- Structured enough to build real spatial intuition

The core promise becomes:

`Start a run, read the map fast, feel every click, chase streaks, and immediately run it back.`

### What it should not become
Ace Map should not optimize first for:

- heavy lesson flows
- long explanatory content inside runs
- complex setup before play
- a mode list that feels like a settings panel

## Product Principles

1. Flow beats explanation.
2. Every interaction should return sensory feedback fast enough to feel physical.
3. Map knowledge should be learned through repeated spatial contrast, not long text.
4. Hints are a gamble mechanic, not a charity mechanic.
5. Terrain, coastlines, and region shape should matter as much as labels and borders.
6. Results should push the user toward the next run, not end the session.

## Core Game Loop

The recommended primary loop is:

`recognize -> click or drop -> immediate judgement -> hot feedback -> next target -> streak escalation -> run end -> instant replay`

### Loop characteristics
- Runs should stay short enough to preserve urgency.
- Most questions should resolve within 3-5 seconds.
- Wrong answers should not trigger long interruption states.
- Correct answers should trigger more than static color confirmation.
- The run should build heat toward the end with faster pacing and stronger reward effects.

### Input mix
- About 80% of questions should use click-region input.
- About 20% should introduce precision pin or special recognition variants.
- The mixed system avoids monotony while preserving a predictable core control model.

## Mode Architecture

Ace Map should launch with four distinct modes, but only one should be the default front door.

### 1. Flash Mode
This is the primary mode and should be the default play entry.

Characteristics:
- 90 second run target
- click-region dominant
- occasional precision pin questions
- strong streak scaling
- immediate replay bias

Role:
- first-session hook
- everyday replay mode
- benchmark mode for score sharing

### 2. Terrain Rush
This is the flagship differentiator.

Characteristics:
- relies on elevation shading, satellite feel, terrain texture, and coastlines
- reduces reliance on obvious political map styling
- emphasizes geographic intuition and landform recognition

Role:
- brand-defining mode
- strongest separation from classic quiz competitors

### 3. Precision Drop
This mode uses free-map point placement with distance-based scoring.

Characteristics:
- fewer but higher-tension prompts
- judged by distance and direction
- works especially well for capitals, cities, landmarks, rivers, and physical features

Role:
- inject spatial drama into the mode lineup
- train non-polygon map memory

### 4. Fog Duel
This mode turns hints into a timing tradeoff.

Characteristics:
- map begins partially obscured
- clues reveal in stages
- user can answer early for higher score or wait for more certainty

Role:
- creates tension around information timing
- makes hints feel strategic and replayable

## Streak and Scoring Systems

### Streak Heat
Streaks should visibly and audibly increase the temperature of the run.

Effects include:
- hotter HUD styling
- stronger answer pulses
- larger score pops
- more excited announcer feedback
- rising urgency near streak milestones

### Score model
Scores should consider:

- correctness
- response speed
- run streak multiplier
- hint usage penalty
- precision distance on pin questions

This keeps score tied to performance quality, not just completion count.

### Near-miss treatment
Precision misses should not always feel like hard failure.

If the guess lands very close:
- label it as a near miss
- reward partial points
- keep the emotional tone constructive

This protects momentum.

## Voice System

Voice must support the game feel, not compete with it. The correct model is not a tutorial narrator. It is a hybrid of arcade announcer and spatial coach.

### Layer 1: Click Callout Voice
This is the most important voice feature.

When a player clicks a region, the system should immediately speak the clicked place name. This does four jobs at once:

- confirms which region was actually selected
- binds region shape to spoken name
- exposes spatial mistakes instantly
- gives every click a sense of contact

Requirements:
- fire within roughly 120-250ms
- speak only the place name in most cases
- interrupt previous playback when the player clicks rapidly
- sound clean and short, not conversational

### Layer 2: Prompt Voice
The target location can also be spoken at question start or on demand.

Use cases:
- improve rhythm
- help with unfamiliar place names
- deepen memory through audio repetition

### Layer 3: Coach Voice
After mistakes, short directional coaching can reinforce spatial intuition.

Examples:
- `Too far north`
- `South of Saudi Arabia`
- `Western coast`
- `Mountain belt`

These lines should remain brief enough to preserve flow.

### Layer 4: Hype Voice
This is reserved for:
- streak milestones
- final seconds
- especially fast or accurate hits

Examples:
- `Perfect`
- `Fast`
- `Streak five`
- `Last chance`

## Region Display System

Region display should be treated as a real-time feedback engine, not a simple color toggle.

### State 1: Idle
The map should feel alive but restrained.

Desired behavior:
- light political boundaries
- visible coastlines and terrain clues
- no textbook-like clutter
- subtle environmental motion or tonal depth

### State 2: Aim
When the player hovers or targets an area:
- outline should sharpen lightly
- fill should lift very slightly
- small regions may gain a forgiving hit halo

This improves control without making targeting feel automatic.

### State 3: Click
On click:
- the chosen region should visibly depress or pulse
- the place name should be voiced
- the interaction should feel acknowledged immediately

### State 4: Reveal
Reveal should vary by question type.

For region clicks:
- wrong region flashes briefly
- correct region emerges with stronger visual confidence
- neighboring regions can softly respond to teach adjacency

For pin questions:
- draw directional relation between guess and answer
- use an arc or directional line with stronger sense of travel than a plain segment

For terrain questions:
- show terrain cues first, then region contour
- avoid reducing the answer to a flat color block

### State 5: Streak Heat
At higher streak values, the whole interface should intensify:
- stronger hit pulses
- warmer edge lighting
- more dramatic score feedback
- more assertive announcer responses

## Hint System

Hints should be progressive and costly. They are part of the strategy layer, not an accessibility afterthought.

### Hint 1: Macro Hint
Gives a large-scale cue.

Examples:
- `Arabian Peninsula`
- `Western Europe`
- `Island nation`
- `Eastern coast`

Visual effect:
- vague regional glow
- no explicit target outline

### Hint 2: Spatial Hint
Introduces relative geography.

Examples:
- `South of Saudi Arabia`
- `Between France and Germany`
- `Northwest coast`

Visual effect:
- nearby reference regions pulse briefly
- directional wave or arrow cue

### Hint 3: Shape Hint
Reveals silhouette logic.

Effects:
- faint ghost edge
- shoreline or contour clues
- useful especially in Fog Duel

### Hint 4: Lock Hint
This is nearly answer-giving and should carry a heavy cost.

Effects:
- major dimming of non-candidate regions
- heavy score penalty or streak reset risk

## Terrain Gameplay

Terrain should not be a visual theme only. It should become a question language.

Recognizable terrain cues include:
- mountain belts
- river corridors
- coastal plains
- deserts and basins
- peninsulas and island chains

Terrain gameplay works best when paired with:
- short runs
- minimal labels
- reveal logic that reinforces landform recognition
- short coach phrases that explain what was visible

Examples:
- `Western mountains`
- `Long eastern coast`
- `Himalayan belt`

## Information Architecture

The product should move from topic-first discovery toward play-first engagement.

### Primary top-level structure
- Play Now
- Modes
- Daily Run
- Progress
- Collections
- Settings

### Role of existing topic pages
Current quiz topic pages should remain for:
- SEO acquisition
- long-tail discovery
- content browsing

They should no longer define the main product entry experience.

## Page Structure

### 1. Arcade Lobby
Primary actions:
- start Flash Mode
- start Daily Run
- pick from mode cards

Secondary content:
- recent best streak
- daily score
- unlocked stats

### 2. Run Screen
This is the most important page in the product.

It should contain:
- full map as dominant surface
- compact HUD
- target prompt
- timer
- streak heat
- hint trigger
- voice controls if needed

### 3. Result Screen
It should emphasize:
- total score
- peak streak
- response quality
- close misses
- large replay CTA

### 4. Mode Select
Each mode should feel like a promise of a different stimulus pattern, not a dropdown option.

### 5. Collections / Topic Pages
These remain valuable for discoverability and thematic browsing, but are secondary to the lobby.

## Data and System Implications

### Data model additions
The current place dataset will need to support more than coordinates and names.

Recommended additions:
- polygon geometry or feature ids for click-region recognition
- aliases and spoken display names
- neighbor references
- terrain tags
- region size or difficulty metadata
- hint metadata

### Runtime systems
The game runtime will need explicit support for:
- mode-specific question generators
- streak heat state
- voice queueing and interruption
- reveal state machines
- hint cost accounting
- seeded daily runs

## Error Handling

### Audio errors
If speech synthesis fails:
- preserve full visual feedback
- degrade silently without blocking play

### Geometry or hit-test ambiguity
If a click cannot resolve cleanly:
- use nearest candidate logic or halo rules for tiny regions
- never leave the player unsure whether the click registered

### Content gaps
If a mode lacks required metadata:
- remove that question from the run
- keep the run smooth rather than surfacing broken state

## Testing Strategy

### Interaction testing
Verify:
- click detection speed
- tiny-region hit forgiveness
- rapid repeat click behavior
- reveal transitions

### Audio testing
Verify:
- click name playback latency
- overlap cancellation
- prompt voice and coach voice priorities

### Run pacing testing
Verify:
- average question resolution time
- interruption cost of reveals
- whether a run still feels fast at high streak

### Product validation metrics
The most important early metrics are:
- runs per session
- percentage of users starting a second run
- average streak length
- hint usage rate
- replay CTA click-through

## MVP Scope

The first release should include:

- Flash Mode
- mixed question flow with click-region dominance
- click location voice playback
- target name voice playback
- immediate right/wrong reveal system
- Hint 1 and Hint 2
- streak heat basics
- daily seeded run
- replay-first result screen

The first release should exclude:

- full roguelite progression
- long-form voice coaching
- complex multiplayer systems
- too many mode variants

## Phase 2 Expansion

After MVP validation, the next wave should prioritize:

- Terrain Rush
- Fog Duel
- confusion-pair training
- deeper reveal effects
- richer coach voice logic
- leaderboard and friend challenge systems

## Recommendation
Ship the redesign around Flash Mode first. Make it the strongest, fastest, most tactile version of map play in the product. Once that loop proves high replay behavior, use Terrain Rush and Fog Duel to widen the identity. The path to beating current quiz-style competitors is not breadth alone. It is sensory precision, faster loop pacing, and better tension design.
