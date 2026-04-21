# i18n Gap Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the remaining multilingual coverage gaps so `en`, `zh`, and `ja` fully cover shared landing-page modules, game shell copy, quiz topic pages, and locale-aware navigation.

**Architecture:** Keep `next-intl` as the single translation source, but stop resolving topic and panel copy ad hoc inside pages. Add one small localization helper layer for `QuizTopic` data, then pass localized copy into pages and shared components so the same content is reused across home, quiz library, game exits, and topic landing pages. While doing that, switch user-facing navigation to `src/i18n/navigation.ts` so locale-prefixed routes and alternates stay consistent.

**Tech Stack:** Next.js 16 App Router, `next-intl` 4.x, React 19, TypeScript, Vitest + Testing Library for targeted i18n coverage tests

---

## Context

- Existing base plan: `docs/superpowers/plans/2026-04-20-i18n.md`
- Current gaps confirmed in code:
  - `src/lib/components/quizzes/DailyChallengeCard.tsx`
  - `src/lib/components/quizzes/MasteryDashboard.tsx`
  - `src/lib/components/quizzes/RecentPracticePanel.tsx`
  - `src/lib/components/quizzes/MistakesReviewPanel.tsx`
  - `src/lib/components/quizzes/QuizTopicCard.tsx`
  - `src/lib/components/Start.tsx`
  - `src/lib/components/game/GameBar.tsx`
  - `src/lib/components/game/Game.tsx`
  - `src/lib/components/Result.tsx`
  - `src/app/[locale]/quizzes/page.tsx`
  - `src/app/[locale]/game/page.tsx`
  - `src/app/[locale]/quiz/[slug]/page.tsx`
- Structural gap:
  - many links still use `next/link` or raw `router.push('/...')` instead of `src/i18n/navigation.ts`
- Testing gap:
  - the repo has no current unit test harness, so add a minimal one before continuing

## Guardrails

- Follow `@superpowers:test-driven-development` for each task.
- Follow `@superpowers:verification-before-completion` before claiming the phase is done.
- Do not invent a second localization system.
- Do not translate region dataset names inline in components; always go through helper functions or message keys.
- Keep English fallback behavior explicit for missing topic keys.

### Task 1: Add a minimal i18n test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/renderWithIntl.tsx`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Test: `src/lib/data/quizTopicI18n.test.ts`

**Step 1: Write the failing test**

Create `src/lib/data/quizTopicI18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getQuizTopicBySlug } from '@/lib/data/quizTopics';
import { localizeQuizTopic } from '@/lib/data/quizTopicI18n';

describe('localizeQuizTopic', () => {
	it('overrides translatable fields from messages', () => {
		const topic = getQuizTopicBySlug('world-map-quiz');
		if (!topic) throw new Error('missing fixture topic');

		const localized = localizeQuizTopic(topic, {
			title: '世界地图测验',
			shortTitle: '世界地图',
			badge: '热门',
			description: '在互动地图上练习世界各国位置。',
			seoTitle: '世界地图测验',
			seoDescription: '测试世界地理知识。',
			benefits: ['即时反馈'],
			highlights: ['世界范围'],
			faq: [{ question: '适合谁？', answer: '适合学生。' }]
		});

		expect(localized.title).toBe('世界地图测验');
		expect(localized.badge).toBe('热门');
		expect(localized.faq[0]?.question).toBe('适合谁？');
	});
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm exec vitest run src/lib/data/quizTopicI18n.test.ts
```

Expected: FAIL with `Cannot find module '@/lib/data/quizTopicI18n'` or `Missing script/config`.

**Step 3: Install the minimal test stack**

Run:

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Expected: devDependencies updated in `package.json`.

**Step 4: Add the test config**

Create `vitest.config.ts`:

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/test/setup.ts']
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `src/test/renderWithIntl.tsx`:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

export const renderWithIntl = (
	ui: ReactElement,
	messages: Record<string, unknown>,
	locale = 'en'
) =>
	render(
		<NextIntlClientProvider locale={locale} messages={messages}>
			{ui}
		</NextIntlClientProvider>
	);
```

**Step 5: Add test scripts**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Modify `tsconfig.json` only if the Vitest globals need inclusion:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

**Step 6: Run test again to verify it still fails for the right reason**

Run:

```bash
pnpm exec vitest run src/lib/data/quizTopicI18n.test.ts
```

Expected: FAIL only because `localizeQuizTopic` is not implemented yet.

**Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts src/test/setup.ts src/test/renderWithIntl.tsx src/lib/data/quizTopicI18n.test.ts
git commit -m "test(i18n): add minimal localization test harness"
```

### Task 2: Add reusable localized quiz-topic and section helpers

**Files:**
- Create: `src/lib/data/quizTopicI18n.ts`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Modify: `messages/ja.json`
- Test: `src/lib/data/quizTopicI18n.test.ts`

**Step 1: Extend the failing test to cover fallback behavior**

Append to `src/lib/data/quizTopicI18n.test.ts`:

```ts
it('keeps English fallback when optional translated fields are missing', () => {
	const topic = getQuizTopicBySlug('asia-countries-quiz');
	if (!topic) throw new Error('missing fixture topic');

	const localized = localizeQuizTopic(topic, {
		title: '亚洲国家测验'
	});

	expect(localized.title).toBe('亚洲国家测验');
	expect(localized.description).toBe(topic.description);
	expect(localized.highlights).toEqual(topic.highlights);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm exec vitest run src/lib/data/quizTopicI18n.test.ts
```

Expected: FAIL because `localizeQuizTopic` does not exist yet.

**Step 3: Implement the helper**

Create `src/lib/data/quizTopicI18n.ts`:

```ts
import type { QuizTopic } from '@/lib/data/quizTopics';

export interface LocalizedQuizTopicMessages {
	title?: string;
	shortTitle?: string;
	badge?: string;
	description?: string;
	seoTitle?: string;
	seoDescription?: string;
	learningFocus?: string;
	searchIntent?: string;
	benefits?: string[];
	highlights?: string[];
	faq?: Array<{ question: string; answer: string }>;
}

export const localizeQuizTopic = (
	topic: QuizTopic,
	messages?: LocalizedQuizTopicMessages
): QuizTopic => ({
	...topic,
	title: messages?.title ?? topic.title,
	shortTitle: messages?.shortTitle ?? topic.shortTitle,
	badge: messages?.badge ?? topic.badge,
	description: messages?.description ?? topic.description,
	seoTitle: messages?.seoTitle ?? topic.seoTitle,
	seoDescription: messages?.seoDescription ?? topic.seoDescription,
	learningFocus: messages?.learningFocus ?? topic.learningFocus,
	searchIntent: messages?.searchIntent ?? topic.searchIntent,
	benefits: messages?.benefits ?? topic.benefits,
	highlights: messages?.highlights ?? topic.highlights,
	faq: messages?.faq ?? topic.faq
});

export const localizeQuizTopics = (
	topics: QuizTopic[],
	messageMap: Record<string, LocalizedQuizTopicMessages | undefined>
) => topics.map((topic) => localizeQuizTopic(topic, messageMap[topic.slug]));
```

**Step 4: Expand the message schema**

For every locale, extend `QuizTopics.<slug>` to include:

```json
{
  "description": "Practice locating countries on a clean world map with instant distance feedback and fast replay loops.",
  "learningFocus": "Countries across every continent",
  "searchIntent": "Broad geography quiz and map quiz searches",
  "benefits": [
    "Immediate submit feedback with visible correct-vs-guessed positions",
    "Distance-based grading that rewards close answers",
    "Fast restart loop for repeated map memory practice"
  ],
  "highlights": [
    "197 map targets",
    "All continents",
    "Mobile-friendly tap input"
  ],
  "faq": [
    {
      "question": "Who is this quiz for?",
      "answer": "Students, trivia players, and anyone training geography recall."
    }
  ]
}
```

Do this for all topic slugs already exposed in `quizTopics`.

**Step 5: Add shared namespaces now instead of scattering strings later**

Add these top-level namespaces to all three message files:

```json
{
  "DailyChallengeCard": {},
  "MasteryDashboard": {},
  "RecentPracticePanel": {},
  "MistakesReviewPanel": {},
  "GamePage": {},
  "QuizTopicPage": {},
  "GameOverlay": {}
}
```

Populate English first, then mirror the same key shape in `zh.json` and `ja.json`.

**Step 6: Run test to verify it passes**

Run:

```bash
pnpm exec vitest run src/lib/data/quizTopicI18n.test.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add src/lib/data/quizTopicI18n.ts src/lib/data/quizTopicI18n.test.ts messages/en.json messages/zh.json messages/ja.json
git commit -m "feat(i18n): add reusable quiz topic localization helpers"
```

### Task 3: Localize shared landing-page panels and cards

**Files:**
- Modify: `src/lib/components/quizzes/DailyChallengeCard.tsx`
- Modify: `src/lib/components/quizzes/MasteryDashboard.tsx`
- Modify: `src/lib/components/quizzes/RecentPracticePanel.tsx`
- Modify: `src/lib/components/quizzes/MistakesReviewPanel.tsx`
- Modify: `src/lib/components/quizzes/QuizTopicCard.tsx`
- Modify: `src/lib/components/quizzes/QuizTopicSection.tsx`
- Modify: `src/lib/components/Navbar.tsx`
- Modify: `src/i18n/navigation.ts` usage sites above
- Test: `src/lib/components/quizzes/i18n-panels.test.tsx`

**Step 1: Write the failing component test**

Create `src/lib/components/quizzes/i18n-panels.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DailyChallengeCard from '@/lib/components/quizzes/DailyChallengeCard';
import { renderWithIntl } from '@/test/renderWithIntl';

describe('DailyChallengeCard', () => {
	it('renders translated CTA copy', () => {
		renderWithIntl(<DailyChallengeCard />, {
			DailyChallengeCard: {
				badge: '每日挑战',
				openChallengePage: '打开挑战页',
				playChallengeNow: '立即开始挑战'
			}
		}, 'zh');

		expect(screen.getByText('每日挑战')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: '打开挑战页' })).toBeInTheDocument();
	});
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm exec vitest run src/lib/components/quizzes/i18n-panels.test.tsx
```

Expected: FAIL because the component still renders hardcoded English.

**Step 3: Replace hardcoded strings with `useTranslations`**

Pattern to apply in each panel component:

```tsx
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const t = useTranslations('DailyChallengeCard');

<span>{t('badge')}</span>
<Link href={`/quiz/${topic.slug}`}>{t('openChallengePage')}</Link>
<Link href={`${buildGameHref(topic.gameConfig)}&topic=${topic.slug}`}>
	{t('playChallengeNow')}
</Link>
```

Also localize:

- `MasteryDashboard`
  - `Unified Metrics`
  - `Browse more topics`
  - stat labels/helpers
  - empty states
  - `Daily challenge`, `Quiz session`, `Free play session`
  - `Review misses`, `Open topic`, `Play again`
- `RecentPracticePanel`
  - title/description defaults
  - `Last opened {date}`
- `MistakesReviewPanel`
  - title/description defaults
  - `unique misses saved`
  - `Latest`
  - `Review misses`
  - `Clear`
- `QuizTopicCard`
  - location count suffix
  - CTA labels
  - aria labels

**Step 4: Make navigation locale-aware**

In all modified files, replace:

```ts
import Link from 'next/link';
```

with:

```ts
import { Link } from '@/i18n/navigation';
```

This applies to `Navbar.tsx` too.

**Step 5: Run the component test to verify it passes**

Run:

```bash
pnpm exec vitest run src/lib/components/quizzes/i18n-panels.test.tsx
```

Expected: PASS.

**Step 6: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS with no new i18n panel errors.

**Step 7: Commit**

```bash
git add src/lib/components/quizzes/DailyChallengeCard.tsx src/lib/components/quizzes/MasteryDashboard.tsx src/lib/components/quizzes/RecentPracticePanel.tsx src/lib/components/quizzes/MistakesReviewPanel.tsx src/lib/components/quizzes/QuizTopicCard.tsx src/lib/components/quizzes/QuizTopicSection.tsx src/lib/components/Navbar.tsx src/lib/components/quizzes/i18n-panels.test.tsx messages/en.json messages/zh.json messages/ja.json
git commit -m "feat(i18n): localize shared quiz panels and cards"
```

### Task 4: Localize the game shell, overlays, and result screen

**Files:**
- Modify: `src/lib/components/Start.tsx`
- Modify: `src/lib/components/game/GameBar.tsx`
- Modify: `src/lib/components/game/Game.tsx`
- Modify: `src/lib/components/game/Main.tsx`
- Modify: `src/lib/components/Result.tsx`
- Test: `src/lib/components/game/game-shell-i18n.test.tsx`

**Step 1: Write the failing test**

Create `src/lib/components/game/game-shell-i18n.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Start from '@/lib/components/Start';
import { renderWithIntl } from '@/test/renderWithIntl';

describe('Start', () => {
	it('renders translated world mode label', () => {
		renderWithIntl(<Start />, {
			Start: {
				worldModeTitle: '世界国家',
				worldModeDescription: '在世界地图上猜国家'
			}
		}, 'zh');

		expect(screen.getByText('世界国家')).toBeInTheDocument();
	});
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm exec vitest run src/lib/components/game/game-shell-i18n.test.tsx
```

Expected: FAIL because `Start.tsx` still contains hardcoded English labels.

**Step 3: Localize `Start.tsx`**

Add keys for:

- mode cards:
  - `worldModeTitle`
  - `worldModeDescription`
  - `countryModeTitle`
  - `countryModeDescription`
- country picker:
  - `chooseCountry`
  - `tapCountryToStart`
  - `countriesAvailable`
- world config:
  - `configureGame`
  - `continents`
  - `noneMeansAll`
  - `startGame`
- common:
  - `back`

Also replace raw `next/navigation` router with `useRouter` from `@/i18n/navigation` so pushes keep the current locale.

**Step 4: Localize `GameBar.tsx` and `Game.tsx`**

Add keys to `GameOverlay` / `GameBar` for:

- `mode`
- `session`
- `openingRun`
- `flashChain`
- `terrainChain`
- `flashRules`
- `terrainRules`
- `satelliteHint`
- `noHintsLeftTitle`
- `noHintsLeftDescription`
- `pause`
- `resume`
- `lockGuess`
- `nextTarget`
- `correctRegion`
- `correctLocation`
- `wrong`
- `correct`
- `gameOverTitle`
- `viewResult`

Pattern:

```tsx
const t = useTranslations('GameOverlay');
const actionLabel = gameState.status === 'running' ? t('pause') : t('resume');
```

In `Game.tsx`, localize marker tags:

```tsx
<MarkerTag tone="correct" label={t('correctLocation')} />
```

**Step 5: Localize `Result.tsx`**

Add missing `Result` keys for:

- `yourResult`
- `summary`
- `changeMode`
- `playAgain`
- `shareableResult`
- `turnResultIntoChallengeLink`
- `shareLinkReproducible`
- `copied`
- `copyFailedTitle`
- `copyFailedDescription`
- `copySuccessTitle`
- `copySuccessDescription`
- `invalidResultCode`
- `nextQuizIdeas`
- `keepSessionGoing`
- `openTopic`
- `playNow`
- `accuracySuffix`

Also localize:

- strictness labels (`High`, `Medium`, `Low`)
- mode labels (`World Countries`, country names fallback, `India — CBSE`)
- category fallback (`All Categories`)
- share title/text builders
- CTA labels

**Step 6: Localize `Main.tsx`**

Replace the hardcoded spinner aria-label:

```tsx
loading: () => <Spinner aria-label={t('mapLoading')} />
```

If dynamic loader cannot call `useTranslations`, pass a localized `loadingLabel` prop from the parent layer instead of hardcoding.

**Step 7: Run tests and lint**

Run:

```bash
pnpm exec vitest run src/lib/components/game/game-shell-i18n.test.tsx
pnpm lint
```

Expected: PASS.

**Step 8: Commit**

```bash
git add src/lib/components/Start.tsx src/lib/components/game/GameBar.tsx src/lib/components/game/Game.tsx src/lib/components/game/Main.tsx src/lib/components/Result.tsx src/lib/components/game/game-shell-i18n.test.tsx messages/en.json messages/zh.json messages/ja.json
git commit -m "feat(i18n): localize game shell and result flows"
```

### Task 5: Localize home, quiz library, and game exit pages

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/quizzes/page.tsx`
- Modify: `src/app/[locale]/game/page.tsx`
- Modify: `src/lib/data/quizTopics.ts`
- Modify: `src/lib/data/quizTopicI18n.ts`
- Test: `src/app/[locale]/page-i18n.test.tsx`

**Step 1: Write the failing page-level test**

Create `src/app/[locale]/page-i18n.test.tsx`:

```ts
import { describe, expect, it } from 'vitest';
import en from '../../../messages/en.json';

describe('home page message coverage', () => {
	it('has keys for shared landing page modules', () => {
		expect(en).toHaveProperty('DailyChallengeCard.badge');
		expect(en).toHaveProperty('MasteryDashboard.metricsLabel');
		expect(en).toHaveProperty('RecentPracticePanel.title');
		expect(en).toHaveProperty('MistakesReviewPanel.title');
	});
});
```

**Step 2: Run test to verify it fails if keys are missing**

Run:

```bash
pnpm exec vitest run src/app/[locale]/page-i18n.test.tsx
```

Expected: FAIL until the message shape is complete.

**Step 3: Localize `/[locale]/page.tsx`**

Keep current `HomePage` keys, but stop relying on English-only child defaults.

- keep `DailyChallengeCard`, `MasteryDashboard`, `RecentPracticePanel`, `MistakesReviewPanel` prop-less once those components are localized
- replace `Link` import with `Link` from `@/i18n/navigation`
- ensure `buildGameHref(...)` links preserve current locale by wrapping them in locale-aware `Link`

**Step 4: Localize `/[locale]/quizzes/page.tsx`**

Replace hardcoded English props:

```tsx
<MasteryDashboard
	title={t('progressTitle')}
	description={t('progressDescription')}
/>
```

Do not use `QUIZ_SECTIONS.title` and `QUIZ_SECTIONS.description` directly. Instead, localize section metadata through `QuizSections` keys or a helper such as:

```ts
export const getLocalizedQuizSection = (
	section: { id: string; title: string; description: string },
	t: ReturnType<typeof getTranslations>
) => ({
	...section,
	title: t(section.id),
	description: t(`${section.id}Desc`)
});
```

**Step 5: Localize `/[locale]/game/page.tsx`**

Add `GamePage` keys for:

- `continueSessionBadge`
- `moreLike`
- `nextQuizIdeasTitle`
- `continueSessionDescription`
- `browseAllQuizPages`
- `resumePracticeTitle`
- `resumePracticeDescription`
- `mistakesReviewTitle`

Then remove the hardcoded strings now inline in the page.

**Step 6: Convert all links on these pages to locale-aware navigation**

Use:

```tsx
import { Link } from '@/i18n/navigation';
```

and:

```ts
import { useRouter } from '@/i18n/navigation';
```

for push-based navigation.

**Step 7: Run tests, lint, and build**

Run:

```bash
pnpm exec vitest run src/app/[locale]/page-i18n.test.tsx
pnpm lint
pnpm build
```

Expected: PASS.

**Step 8: Commit**

```bash
git add src/app/[locale]/page.tsx src/app/[locale]/quizzes/page.tsx src/app/[locale]/game/page.tsx src/lib/data/quizTopics.ts src/lib/data/quizTopicI18n.ts src/app/[locale]/page-i18n.test.tsx messages/en.json messages/zh.json messages/ja.json
git commit -m "feat(i18n): localize shared landing pages and game exits"
```

### Task 6: Localize topic landing pages, metadata, and structured data

**Files:**
- Modify: `src/app/[locale]/quiz/[slug]/page.tsx`
- Modify: `src/lib/data/quizTopicI18n.ts`
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/sitemap.ts`
- Test: `src/app/[locale]/quiz/[slug]/metadata-i18n.test.ts`

**Step 1: Write the failing metadata test**

Create `src/app/[locale]/quiz/[slug]/metadata-i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getQuizTopicBySlug } from '@/lib/data/quizTopics';
import { localizeQuizTopic } from '@/lib/data/quizTopicI18n';

describe('localized topic metadata', () => {
	it('uses translated seo fields when available', () => {
		const topic = getQuizTopicBySlug('world-map-quiz');
		if (!topic) throw new Error('missing topic');

		const localized = localizeQuizTopic(topic, {
			seoTitle: '世界地图测验',
			seoDescription: '测试世界地理知识'
		});

		expect(localized.seoTitle).toBe('世界地图测验');
		expect(localized.seoDescription).toBe('测试世界地理知识');
	});
});
```

**Step 2: Run test to verify it fails or is incomplete**

Run:

```bash
pnpm exec vitest run src/app/[locale]/quiz/[slug]/metadata-i18n.test.ts
```

Expected: FAIL until the page actually consumes localized fields beyond `title` and `seoDescription`.

**Step 3: Localize topic page body copy**

In `src/app/[locale]/quiz/[slug]/page.tsx`:

- use `localizeQuizTopic(topic, tTopics.raw(slug))`
- replace all inline English UI copy with `QuizTopicPage` keys:
  - breadcrumb labels
  - `Focused Practice`
  - `Full Country Quiz`
  - `Play on this page`
  - `Open full-screen mode`
  - `Locations to practice`
  - `What you'll learn`
  - `How this page works`
  - `Part of`
  - `Open parent topic`
  - `What you'll practice`
  - `Keep exploring`
  - `Open quiz library`
  - `Related quiz topics`

**Step 4: Localize JSON-LD and metadata**

Use localized topic data instead of raw English values:

```ts
const localizedTopic = localizeQuizTopic(topic, tTopics.raw(slug));

return {
	title: localizedTopic.seoTitle,
	description: localizedTopic.seoDescription,
	openGraph: {
		title: localizedTopic.seoTitle,
		description: localizedTopic.seoDescription
	}
};
```

Also make breadcrumb names locale-aware instead of hardcoding `Home` / `Quiz Library`.

**Step 5: Fix canonical and alternate URLs**

Update metadata and sitemap generation so locale pages emit locale-specific alternates.

Pattern:

```ts
alternates: {
	canonical: locale === 'en' ? `/quiz/${topic.slug}` : `/${locale}/quiz/${topic.slug}`,
	languages: {
		en: `/quiz/${topic.slug}`,
		zh: `/zh/quiz/${topic.slug}`,
		ja: `/ja/quiz/${topic.slug}`
	}
}
```

Apply the same rule to:

- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/quizzes/page.tsx`
- `src/app/[locale]/game/page.tsx`
- `src/app/sitemap.ts`

**Step 6: Run tests, lint, and build**

Run:

```bash
pnpm exec vitest run src/app/[locale]/quiz/[slug]/metadata-i18n.test.ts
pnpm lint
pnpm build
```

Expected: PASS.

**Step 7: Commit**

```bash
git add src/app/[locale]/quiz/[slug]/page.tsx src/app/[locale]/layout.tsx src/app/sitemap.ts src/app/[locale]/quiz/[slug]/metadata-i18n.test.ts src/lib/data/quizTopicI18n.ts messages/en.json messages/zh.json messages/ja.json
git commit -m "feat(i18n): localize topic landing pages and metadata"
```

### Task 7: Full verification and regression pass

**Files:**
- Modify if needed after verification: `messages/en.json`, `messages/zh.json`, `messages/ja.json`
- Modify if needed after verification: any file touched in Tasks 1-6

**Step 1: Run the full automated checks**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all PASS.

**Step 2: Manual QA the three locales**

Run:

```bash
pnpm dev
```

Verify in browser:

- `/`
- `/zh`
- `/ja`
- `/quizzes`
- `/zh/quizzes`
- `/ja/quizzes`
- `/game?mode=world&category=all&strictness=800000`
- `/zh/game?mode=world&category=all&strictness=800000`
- `/ja/game?mode=world&category=all&strictness=800000`
- one topic page per locale, for example:
  - `/quiz/world-map-quiz`
  - `/zh/quiz/world-map-quiz`
  - `/ja/quiz/world-map-quiz`

Expected manual results:

- no English-only CTA labels in shared panels
- `Daily Challenge`, `Unified Metrics`, `Recent practice`, `Mistakes review` all translated
- topic landing pages show localized badges, FAQ, benefits, structured copy
- game shell buttons, idle hints, result screen, and share copy are localized
- navigation stays inside the current locale when clicking links or buttons

**Step 3: Fix any missing message keys discovered in QA**

Typical fixes:

```bash
rg -n "\"[A-Z][^\"]+\"" src/app src/lib/components | sed -n '1,200p'
```

Expected: only valid non-user-facing strings remain.

**Step 4: Commit the final QA fixes**

```bash
git add messages/en.json messages/zh.json messages/ja.json src/app src/lib/components src/lib/data
git commit -m "fix(i18n): close remaining multilingual regressions"
```

## Done Criteria

- All shared landing-page modules render localized copy in `en`, `zh`, `ja`
- Game shell and result views contain no user-facing hardcoded English
- Quiz topic pages localize hero/body/FAQ/benefits/highlights/metadata/JSON-LD
- Navigation remains locale-aware across `Link` and router pushes
- Automated checks pass: `pnpm test`, `pnpm lint`, `pnpm build`
- Manual browser QA passes on home, quizzes, game, and one topic page in all three locales

Plan complete and saved to `docs/plans/2026-04-20-i18n-gap-closure.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
