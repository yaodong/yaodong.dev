# Author Entity SEO Design

Date: 2026-03-29
Scope: Site-wide author metadata, blog post pages, and the About page
Status: Ready for review

## Goal

Strengthen the association between every post on `yaodong.dev` and Yaodong Zhao as the author so search engines and AI systems can more confidently resolve the content to a single person entity.

The site should make two things clear:

- every post is written by the same author
- that author resolves to a canonical identity page with stable profile links

## Constraints

- The site is single-author today, so the solution should optimize for that reality rather than introduce multi-author complexity up front.
- The writing workflow for posts should remain simple. New posts should not require repeated author fields in front matter.
- Existing Jekyll and `jekyll-seo-tag` capabilities should be used where they are sufficient.
- The current visual language should be preserved.
- The About page should remain the canonical on-site author page.
- The implementation should avoid adding new plugins or external dependencies.

## Chosen Approach

Use `_config.yml` as the single source of truth for author identity, then project that identity into both visible post UI and machine-readable metadata.

The first pass should include:

1. Replace the current site-level `author` string with a structured author object.
2. Add site-level social profile links that represent the same person entity.
3. Render a visible byline on every post page that links to `/about/`.
4. Update the About page's existing `Person` JSON-LD to reuse the same site-level values instead of hard-coded duplicates.
5. Continue using `{% seo %}` as the primary SEO metadata generator, with verification that the generated post metadata includes the expected author information.

This approach keeps the implementation small while strengthening the two signals that matter most for the stated goal:

- visible author attribution in the article itself
- consistent structured identity metadata across the site

## Alternatives Considered

### 1. Add `author` front matter to every post

Pros:

- each post would contain explicit author metadata
- easy to understand when reading a single file

Cons:

- creates repetitive authoring work
- increases the chance of drift if the author name, URL, or profile links change
- solves a single-author problem with per-document duplication

Decision: rejected.

### 2. Keep only the existing site-level `author` string

Pros:

- smallest possible config change
- no content changes required

Cons:

- too weak for the stated SEO and AI-entity goal
- does not expose a visible post-level byline
- does not provide a structured author URL or richer author identity fields

Decision: rejected.

### 3. Build a full `_data/authors.yml` multi-author system now

Pros:

- scalable if the site later gains multiple authors
- supports per-post author keys cleanly

Cons:

- adds indirection the site does not currently need
- introduces extra structure before it provides concrete value
- larger surface area than necessary for the first pass

Decision: deferred. This can be added later if the site becomes multi-author.

## Author Identity Model

The canonical author identity should live in `_config.yml` and include at least:

- `author.name`
- `author.url`
- `author.twitter`
- `social.name`
- `social.links`

The canonical author URL should point to the About page rather than the home page so both crawlers and readers land on the page that explicitly describes who Yaodong Zhao is.

The same display name should be used everywhere relevant:

- site author metadata
- About page copy
- post byline text
- structured data output

This consistency is important because entity association weakens when the site alternates between different name formats or different profile destinations.

## Post Page Changes

Every post page should expose the author visibly near the publication metadata.

The byline should:

- appear in the existing post meta row near the date
- read as `By Yaodong Zhao`
- link to `/about/`
- use the same canonical author name as the site metadata

This visible byline matters even if the SEO metadata is already correct, because AI systems and lightweight crawlers often rely on rendered page text and links, not only hidden meta tags.

The byline should be a lightweight addition, not a large author card. A more detailed author bio block can be considered later if needed, but it is not required for the first pass.

## About Page Changes

The About page is already the strongest candidate for the site's canonical author page because it contains both descriptive copy and `Person` JSON-LD.

The key change is to stop hard-coding identity values there and instead derive them from the same site-level metadata used elsewhere.

The About page should continue to expose:

- `Person` JSON-LD
- canonical name
- job or role description
- `sameAs` links to major public profiles

This keeps the identity page aligned with the rest of the site and avoids silent drift between the About page and the SEO config.

## Structured Data Strategy

The site should rely on `jekyll-seo-tag` for the main page-level SEO output, but the author inputs it receives should become richer and more consistent.

The first pass should assume:

- site-level author data feeds generated SEO metadata
- the About page keeps a dedicated `Person` JSON-LD block
- post pages use visible bylines plus generated SEO tags rather than a second custom article schema block

This is intentionally conservative. The implementation should verify the generated HTML for a representative post after the config change. If the generated structured data or meta tags still omit the expected author fields, a follow-up change can add custom post JSON-LD. That should be a second step, not the default first move.

## Data Flow

1. `_config.yml` defines the canonical author identity and social links.
2. `{% seo %}` consumes the author object for machine-readable metadata where supported.
3. `about.md` reuses the same values for its `Person` JSON-LD block.
4. `_layouts/post.html` renders a visible byline linking each article back to `/about/`.
5. Search engines and AI systems see repeated, consistent signals that the posts and the author page refer to the same person.

## Verification

Implementation will be considered complete when all of the following are true:

- every post page shows a visible `By Yaodong Zhao` byline linked to `/about/`
- `_config.yml` contains structured author metadata rather than a bare author string
- the About page `Person` JSON-LD reuses the shared author values
- the same social profile links are represented consistently across site metadata and the About page
- a representative built post page includes author information in the generated SEO output where `jekyll-seo-tag` supports it
- the site still builds successfully with `bundle exec jekyll build`

## Out of Scope

- a full multi-author content model
- per-post guest author overrides
- a large author bio card at the bottom of every post
- custom post-level JSON-LD unless verification shows the existing SEO output is insufficient
- broader publisher or organization schema work unrelated to the author-entity goal
