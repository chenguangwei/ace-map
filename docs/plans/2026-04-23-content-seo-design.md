# Content, FAQ, and SEO Expansion Design

## Goal

Add a content layer around the existing quiz network so MapQuiz.pro can rank for broader geography-game intent, capture longer-tail search phrases, and guide visitors into relevant quiz pages.

## Scope

- Add localized `blog` and `faq` routes for `en`, `zh`, and `ja`
- Add evergreen article content tied to the game and quiz topics
- Add site-level FAQ content for product, study, and classroom intent
- Add internal links between articles, FAQ, home, quiz library, and quiz topic pages
- Extend sitemap coverage to the new content routes

## Information Architecture

- `/{locale}/blog`
- `/{locale}/blog/[slug]`
- `/{locale}/faq`
- Home page gets guide and FAQ entry sections
- Quiz library gets learning-path, guide, and FAQ entry sections
- Quiz topic pages get related guide links

## Content Model

Use local TypeScript data instead of CMS or MDX for this iteration.

- Blog posts contain localized title, description, SEO fields, keywords, sections, and related quiz slugs
- FAQ groups contain localized group titles and question-answer pairs
- Learning paths connect related quiz pages with a matching guide article

## SEO Plan

- Add metadata for blog index, article pages, and FAQ page
- Add `Article`, `BreadcrumbList`, and `FAQPage` structured data where relevant
- Expand sitemap to include blog and FAQ routes
- Keep canonical URLs locale-aware
- Use internal links to move users between informational and playable pages

## Non-Goals

- No CMS
- No site search
- No MDX pipeline
- No bulk-generated article program
