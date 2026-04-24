# AI Campaigns Design

## Goal

Turn Ace Map from a pure quiz flow into a replayable map adventure system where users can:

- start a polished default AI-driven campaign immediately
- remix that campaign with one short prompt instead of building from scratch
- share a playable campaign, not only a score link

The product goal is higher playability, stronger replay loops, and shareable content without adding heavy creation cost.

## Product Positioning

Ace Map should become a map arcade plus lightweight campaign creation product.

The core promise becomes:

`Play a map mission in seconds, remix it in one line, and share a version others can instantly play.`

This should serve two audiences at once:

- students who need low-friction geography practice
- general map fans who want more theme, story, and replay value

## Core Principles

1. Play before create.
2. AI should direct the experience, not replace the map interaction.
3. No blank-canvas creation as the default path.
4. Every shared link should be directly playable.
5. Existing quiz data and map rules remain the factual source of truth.
6. AI failures must gracefully fall back to a valid playable experience.

## Recommended Product Shape

### Layer 1: Instant Play

The primary home-page experience should feature a small set of official default campaigns that can be started immediately.

Example campaign themes:

- Civilization Expedition
- Border Crisis
- Lost Shipping Route
- World Courier
- Disaster Command

Users should not need to understand campaign creation before having fun.

### Layer 2: Lightweight Remix

After a campaign run, the main creative action should be a guided remix rather than a full editor.

Primary remix actions:

- change the theme
- make it easier or harder
- switch the tone
- switch the geography scope
- generate a themed variant from one sentence

The user starts from an existing campaign and AI generates the variant package.

### Layer 3: Playable Sharing

Users should share a playable campaign landing page that includes:

- cover image
- one-line premise
- difficulty
- estimated duration
- start button
- source attribution such as official campaign or adapted from an official campaign

The share target is a playable challenge, not just a result image or score code.

## Recommended MVP

The first release should focus on a narrow, defensible loop:

- 3 official default campaigns
- AI-authored mission packaging inside each campaign
- end-of-run AI evaluation
- one-sentence remix flow
- playable share page
- strict validation, moderation, and fallback behavior

Out of scope for MVP:

- free-form campaign editor
- user-uploaded art pipelines
- custom user-authored question sets
- full voice conversation
- multi-scene cinematic art generation per mission
- community ranking system

## Campaign Experience Design

### Session Shape

Each campaign should last about 3 to 6 minutes and contain 4 to 8 mission nodes.

Each mission node follows this loop:

1. AI mission setup in 1 to 2 short lines
2. existing map challenge interaction
3. immediate correctness and performance feedback
4. brief AI event update or consequence
5. progression to the next node

### What AI Should Do

- generate mission framing and context
- adapt pacing based on player performance
- turn mistakes into consequences or flavor outcomes
- produce end-of-run evaluation and role labels
- generate or select themed cover assets for campaigns and shares

### What AI Should Not Do

- replace the geography engine
- invent unsupported map tasks
- output long narrative blocks before every question
- require frequent prompt entry during play
- generate unchecked geography facts outside the existing data model

## Default Campaign Templates

MVP should launch with three official campaign templates.

### 1. Pursuit

The player follows a target, route, convoy, explorer, or artifact trail across the map.

Best fit:

- routes
- ports
- countries
- capitals
- coastline recognition

### 2. Command

The player responds to logistics, disaster, border, or resource allocation scenarios.

Best fit:

- region identification
- terrain-based prompts
- strategic sequence pressure
- mistake consequences

### 3. Escape

The player must survive or navigate through fog, time pressure, and incomplete information.

Best fit:

- short session intensity
- replay value
- hint tradeoffs
- tension and shareable challenge runs

## Lightweight Creation Model

Creation should be a three-level system, but only Level 1 should be the default exposed action.

### Level 1: One-Line Remix

Primary creation entry point.

User examples:

- make this pirate-themed
- make this suitable for younger students
- make this faster and harder
- turn this into a travel adventure
- make this Japan-focused

AI generates:

- title
- premise
- mission flavor text
- hint tone
- evaluation text
- share cover prompt
- tags and duration summary

### Level 2: Template Remix

Optional structured controls without a full editor.

Suggested controls:

- theme
- geography scope
- duration
- audience

### Level 3: Advanced Adaptation

Reserved for later phases and deeper users.

Possible controls:

- custom opening setup
- explicit topic selection
- tone control
- difficulty control
- reference image for style direction

This should not be the homepage default.

## AI Architecture

### System Layers

1. Game engine layer  
   Existing map, question, scoring, mistake review, and progression logic remains authoritative.

2. Campaign template layer  
   Defines allowed mission counts, pacing, hint profiles, endings, and compatible question types.

3. AI orchestration layer  
   Uses templates plus approved question pools to generate campaign packaging, mission copy, consequence text, and evaluation text.

4. Media generation layer  
   Produces cover assets, icon variants, and optional TTS voice lines.

### Generation Flow

1. choose campaign template
2. choose geography scope and audience
3. select questions from existing quiz data
4. generate campaign package JSON with AI
5. validate against schema and safety rules
6. generate cover media or assign fallback art
7. persist campaign and produce a shareable campaign id

### Key Constraint

Question selection must happen before AI packaging. The model should package approved content, not invent geography tasks.

## Campaign Data Contract

AI output should be constrained by a strict schema.

Suggested top-level fields:

- `title`
- `premise`
- `audience`
- `tone`
- `estimatedMinutes`
- `templateId`
- `missions[]`
- `endingVariants[]`
- `shareMetadata`
- `voiceLines[]`

Each mission should only reference valid internal ids:

- `questionId`
- `questionType`
- `hintMode`
- `eventVariant`

This prevents invalid campaigns and reduces hallucination risk.

## Human Inputs And Collaboration

This system should not be treated as fully autonomous. High-quality output requires human-owned source assets, style rules, and approval boundaries.

### Required Human-Provided Assets For MVP

#### Visual Assets

- official campaign template icons
- role or faction icons
- fallback cover art
- environment scene baselines such as desert, mountain, port, rain forest, border, ocean route
- badge and reward visuals

#### Writing Assets

- official tone guidelines
- student-safe voice and phrasing examples
- general-audience tone examples
- mission intro examples
- consequence text examples
- end-of-run evaluation examples
- title style rules

#### Product Rules

- template pacing rules
- audience segmentation rules
- allowed and disallowed themes
- content safety boundaries
- naming rules
- cover art style rules

### Best Human + AI Collaboration Areas

- humans define official campaign premises, AI expands them into mission packages
- humans define the visual system, AI creates bounded variants
- humans define safe theme pools, AI recombines and localizes them
- humans author strong evaluation examples, AI personalizes within that style

### Must-Have Human Work Before MVP Launch

- 3 official campaign premises
- 3 visual baselines for those campaigns
- one icon system
- 20 mission broadcast templates
- 20 evaluation templates
- content boundary specification
- fallback cover assets
- approved schema and prompt rules

### Roles Needed

- product for loop and scope decisions
- design for iconography, campaign look, and fallback assets
- content or operations for theme pools and moderation policy
- engineering for schema, caching, share flow, and fallback logic
- AI or prompt design for generation rules and moderation flow

## Failure Handling

AI features should never block play.

Fallback rules:

- campaign generation failure falls back to an official campaign version
- image generation failure falls back to template art
- voice generation failure falls back to text only
- remix failure falls back to a light-copy variant of the original campaign
- schema or moderation failure blocks publishing and reverts to a safe fallback

## Moderation And Validation

### Structural Validation

- title length
- mission count range
- duration range
- allowed fields only
- valid internal ids only
- no empty mission or ending blocks

### Content Validation

- student-safe language checks
- violence, sexual content, hate, and harassment filtering
- sensitive politics and geopolitical boundary risk filtering
- readability guardrails by audience tier
- geography consistency checks against local data

Public sharing should require both structural and content validation.

## Measurement Plan

The feature should be evaluated primarily on behavioral impact rather than novelty.

Key metrics:

- campaign start rate
- campaign completion rate
- replay rate
- remix click-through rate
- remix publish rate
- share open rate
- share-to-play conversion
- average remix completion time
- engagement lift compared with ordinary quiz entry points

## Delivery Phases

### Phase 1: Official Campaigns + One-Line Remix

- 3 official campaigns
- AI mission packaging
- AI run evaluation
- one-line remix
- playable share page
- validation and fallback system

### Phase 2: Template Workshop + Richer Media

- structured remix controls
- more campaign templates
- more cover styles
- short TTS voice packs
- weekly featured campaigns

### Phase 3: UGC Campaign Community

- advanced adaptation
- author profiles
- featured remix feeds
- rankings, saves, and replay loops
- moderation tooling

## Success Criteria For Phase 1

Phase 1 is successful if:

- official campaigns outperform ordinary quiz entry points on starts
- completion rate holds at or above current core play levels
- remix actions happen without lengthy onboarding
- shared campaigns receive meaningful open and play activity
- users describe the product as feeling more like a game than a quiz list

## Recommendation

Build the product around:

`official AI-enhanced campaigns -> one-line remix -> playable sharing`

This is the lowest-friction path that adds strong AI value without forcing users into a creator workflow before they have fun.
