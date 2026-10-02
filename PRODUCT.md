# Product

<!-- impeccable:product-schema 1 -->

> Inferred from the repository (AGENTS.md, `src/lib/site.ts`, the About page, and published posts) during an autonomous design pass on 2026-10-01. The author asked not to be interviewed; confirm or correct any line below.

## Platform

web

## Users
Software engineers and technical leads who arrive from a social pitch, a search, or the RSS feed, and read one long-form essay end to end, often on a phone. A smaller group returns to browse the archive or check who the author is. (inferred)

## Product Purpose
yaodong.dev is the personal blog of Yaodong Zhao, a software engineer writing about building software with AI on production systems, plus Ruby/Rails notes and occasional essays further afield. Success is a reader finishing a post and understanding the argument, not clicks or sign-ups. (inferred from About and post history)

## Positioning
First-hand, humble working notes: what actually happened, including dead ends and trade-offs, written by someone who supervises AI on real systems rather than speculating about it. (inferred from About)

## Operating Context
Static Astro site deployed to GitHub Pages. Each post is Markdown with front matter, introduced by a social pitch that links to it. Every post also has a Markdown twin at `/<slug>.md` and a "Copy page" control so readers can hand the text to an AI tool. Light and dark themes follow the system with a manual toggle.

## Capabilities and Constraints
- Pages: home (latest post plus recent list), archive by year, post, About, Projects, Useful links, 404, RSS feed, sitemap.
- Figures are inline SVG components drawn with the site's CSS color tokens, so token names (`--color-*`) are a public contract for figures.
- OG images are rendered separately by `scripts/generate-og-image.ts` in Fira Sans; the site's type should stay recognizably the same family.
- No comments, no newsletter, no analytics UI beyond Google Analytics.

## Brand Commitments
- Name rendered as `~/yaodong.dev`; navigation as lowercase path-style links (`/archive`, `/about`).
- Fira Sans for text and JetBrains Mono for metadata and chrome (self-hosted).
- Monochrome: no accent color. Light and dark are the same grayscale inverted.
- Writing voice: humble essay, no semicolons, sentence-case headings.

## Evidence on Hand
Real posts in `src/content/blog/`, figures in `scripts/figures/` and post components, OG images in `public/assets/images/og/`. No testimonials, metrics, or press, and none should be invented.

## Product Principles
1. The essay is the product. Chrome stays quiet so the argument carries the page.
2. Honest and specific over polished and generic.
3. Readable everywhere: phone, desktop, light, dark, keyboard, screen reader.
4. Fast and static. No client framework for things CSS can do.

## Accessibility & Inclusion
WCAG AA contrast in both themes, visible keyboard focus, skip link, reduced-motion respected, 44px touch targets on coarse pointers.
