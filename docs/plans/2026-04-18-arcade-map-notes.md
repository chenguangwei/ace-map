# Notes: Arcade-First Map Game Research

## Project Findings

### Current Ace Map strengths
- Existing game loop already supports topic-based sessions, submit feedback, and mistakes review.
- The codebase has clear separation between map rendering, game state, topic metadata, and review utilities.
- Country and region datasets already exist, which lowers the cost of adding arcade variants.

### Current Ace Map gaps
- The present loop is still mostly a classic practice tool with a single dominant interaction pattern.
- Visual feedback is informative but not yet emotionally charged or systematized.
- Audio, staged hints, and terrain-based recognition are not yet first-class systems.
- Topic pages currently carry too much product weight relative to an arcade-first lobby.

## Competitor Findings

### Mapbox Map Quiz
- Official positioning emphasizes unlabeled country boundaries with satellite imagery.
- Its strongest signal is visual recognition through a cleaner, more atmospheric map surface.
- Weakness from a game design perspective: limited progression, limited feedback layers, limited replay tension.

Source:
- [Mapbox Map Quiz](https://docs.mapbox.com/resources/demos-and-projects/map-quiz/)

### Seterra / GeoGuessr quiz mode
- Strongest advantages are breadth of map topics and multiple simple interaction modes like pin and type.
- Some quizzes already cover geophysical regions, which validates terrain or physical-region gameplay.
- Weakness from an arcade perspective: interaction is efficient but not especially kinetic, dramatic, or sensory-rich.

Sources:
- [Seterra example: U.S. Geophysical Regions](https://www.geoguessr.com/vgp/3249)
- [Seterra example: Washington Counties](https://www.geoguessr.com/vgp/3546)

## Product Synthesis
- Ace Map should not try to win on topic count alone.
- It should win on feel: instant response, short runs, hot streak escalation, click-reactive voice, and higher-variance question pacing.
- Terrain, hints, and reveal systems should behave like arcade modifiers, not tutoring overlays.
