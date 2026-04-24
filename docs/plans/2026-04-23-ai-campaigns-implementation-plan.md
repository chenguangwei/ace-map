# AI Campaigns Implementation Plan

## Objective

Ship the first production slice of AI campaigns without destabilizing the current quiz engine, topic pages, and SEO flows.

The first implementation target is:

`official campaign -> play run -> one-line remix -> playable share page`

## MVP Scope

Build only the minimum system required for a high-quality first release:

- 3 official campaigns backed by existing quiz data
- campaign session shell layered on top of the current game flow
- AI mission copy and end-of-run evaluation
- one-line remix generation
- playable campaign share landing page
- structural validation, moderation, caching, and graceful fallback

Do not build in MVP:

- blank-canvas editor
- user-authored question pools
- deep UGC profiles and community feeds
- real-time voice chat
- per-mission generated artwork

## Delivery Order

### Phase 1: Define campaign data and template rules

- Create a campaign schema with strict ids for template, missions, endings, and share metadata.
- Define the three template types: `pursuit`, `command`, and `escape`.
- Define allowed mission counts, duration ranges, tone ranges, and audience tiers.
- Add validation helpers that reject invalid references to quiz data.

Exit criteria:

- campaign packages can be represented as typed local objects
- invalid mission references fail validation
- official campaigns can be expressed without AI generation

### Phase 2: Author official campaign content and fallback assets

- Create 3 official campaign definitions using current quiz topics and question pools.
- Add fallback cover art, icon references, and role labels for each campaign.
- Add starter mission broadcast text and evaluation template libraries.
- Store these assets in a way that the app can render without any model call.

Exit criteria:

- users can play official campaigns even if AI services are unavailable
- each official campaign has a distinct visual and tonal baseline

### Phase 3: Add campaign routing and play shell

- Introduce campaign-aware routes and page composition on top of the current locale routing.
- Add a campaign lobby or featured campaign section to the home experience.
- Extend the game entry flow so a campaign can inject mission context and evaluation output without replacing the current map engine.
- Preserve ordinary quiz pages and direct game links.

Likely files:

- `src/app/[locale]/page.tsx`
- `src/app/[locale]/game/page.tsx`
- new campaign route files under `src/app/[locale]/campaign/`
- new campaign UI modules under `src/lib/components/campaigns/`

Exit criteria:

- an official campaign can be opened, played, and completed from a stable route
- campaign context does not break existing direct quiz play

### Phase 4: Implement campaign orchestration services

- Build server-side orchestration that accepts template constraints and selected quiz data.
- Generate AI mission packaging and end-of-run evaluation against a strict JSON contract.
- Add retry, schema validation, and fallback-to-official behavior.
- Cache generated campaign variants by normalized remix request and template inputs.

Suggested modules:

- `src/lib/campaigns/schema.ts`
- `src/lib/campaigns/templates.ts`
- `src/lib/campaigns/generator.ts`
- `src/lib/campaigns/validator.ts`
- `src/lib/campaigns/fallback.ts`

Exit criteria:

- one-line remix requests produce valid campaign packages or safe fallback results
- no model output can reference unsupported questions or fields

### Phase 5: Build one-line remix UX

- Add a simple remix entry point after campaign completion and on campaign detail pages.
- Support one short input plus a few quick actions such as easier, harder, travel theme, and student-safe tone.
- Show generated title, premise, tags, and cover before publishing.
- Keep total interaction count low and avoid form-heavy editing UI.

Exit criteria:

- a user can create a remix in under one minute
- a user never has to touch advanced settings to publish a playable variant

### Phase 6: Build share and replay flow

- Add stable campaign ids and share pages.
- Render cover image, premise, duration, difficulty, attribution, and start CTA.
- Preserve replay and re-remix actions after completion.
- Track share-open and share-to-play conversion.

Exit criteria:

- a shared campaign can be opened and played without prior context
- campaign links remain valid after generation and moderation checks

### Phase 7: Instrumentation, moderation, and QA

- Track start, completion, replay, remix, publish, share-open, and share-play events.
- Add audience-safe moderation and structural validation checks before publish.
- Verify graceful fallback when AI text or media generation fails.
- Dogfood on desktop and mobile using official campaigns and remixed variants.

Exit criteria:

- campaign flow is measurable end to end
- generation failures do not block play
- moderation blocks unsafe public content

## Human Dependencies

These inputs should be prepared in parallel with engineering work.

### Required from product

- approved MVP boundaries
- final template definitions and naming
- audience tiers and difficulty model
- publish rules for public vs draft campaigns

### Required from design

- 3 official campaign visual baselines
- icon set for template types and role labels
- fallback cover assets
- share card layout rules
- style direction for AI-generated cover variants

### Required from content or operations

- 3 official campaign premises
- mission intro examples
- evaluation template examples
- safe theme pool
- moderation boundaries and banned content classes

### Required from AI or prompt design

- structured prompt format
- schema-first generation contract
- moderation prompt rules
- fallback rewrite behavior for partial failures

## Suggested Data Model

### Campaign definition

- `id`
- `sourceType` (`official` or `remix`)
- `templateId`
- `locale`
- `title`
- `premise`
- `audience`
- `tone`
- `difficulty`
- `estimatedMinutes`
- `coverAsset`
- `missions`
- `endingVariants`
- `attribution`
- `status`

### Mission definition

- `id`
- `questionRef`
- `questionType`
- `introText`
- `hintMode`
- `eventVariant`
- `successResponse`
- `failureResponse`

### Remix request

- `baseCampaignId`
- `locale`
- `userPrompt`
- `requestedAudience`
- `requestedDuration`
- `requestedScope`

## Persistence Strategy

Start simple.

- official campaign definitions can live in local TypeScript data files
- generated remixes can first use Supabase if the existing app stack already supports it cleanly
- cache by normalized request payload plus source campaign version
- keep generated media references separate from campaign text payloads

If persistence is not ready for MVP, support server-generated preview flows first, then add save and public share as the next slice.

## Technical Risks

- AI output drifting outside supported gameplay constraints
- generated copy becoming too long and slowing the run loop
- media generation latency making remix feel sluggish
- share pages depending too heavily on live generation instead of persisted results
- moderation false negatives on public campaigns

## Risk Mitigations

- schema-first generation with strict validation
- hard text length caps for intros and evaluations
- pre-authored official campaigns and fallback art
- cached remix results
- publish-time moderation and review flags

## Test Plan

### Unit and schema tests

- campaign schema parsing
- mission reference validation
- fallback selection behavior
- normalized remix request hashing

### Component and route tests

- official campaign page rendering
- remix preview flow
- share page rendering
- campaign completion and evaluation states

### Manual QA

- play all official campaigns on desktop and mobile
- create remixes with normal, edge-case, and adversarial prompts
- verify AI outage fallback paths
- verify unsafe prompts do not publish publicly

## Recommended File Groups

### Likely new directories

- `src/lib/campaigns/`
- `src/lib/components/campaigns/`
- `src/lib/data/campaigns/`
- `src/app/[locale]/campaign/`

### Likely existing integrations

- `src/app/[locale]/page.tsx`
- `src/app/[locale]/game/page.tsx`
- `src/lib/data/quizTopics.ts`
- `src/lib/components/quizzes/*`
- `src/lib/supabase/*`
- analytics modules under `src/lib/analytics/`

## Implementation Strategy

Start with the smallest meaningful end-to-end slice:

1. hard-coded official campaign data
2. campaign route and UI shell
3. campaign-aware play loop using the current map engine
4. end-of-run evaluation using controlled AI output
5. one-line remix generation
6. persisted share page

Only after that slice works should richer media, TTS, and deeper UGC layers move into active implementation.
