# Post Table of Contents Design

Date: 2026-03-29
Scope: Blog post pages only (`_layouts/post.html`)
Status: Ready for review

## Goal

Add a Table of Contents (TOC) to blog posts so readers can scan long articles and jump between sections more easily.

The TOC should:

- appear on the left side of the article on desktop, visually similar to a margin note
- remain visible while the reader scrolls
- support active-section highlighting when the current heading is in view
- move above the article on mobile as a collapsible section

## Constraints

- Only blog post pages use this feature. Standalone pages such as `about.md` and `projects.md` are out of scope.
- The TOC indexes `h2` and `h3` headings only.
- If a post has fewer than 2 eligible headings, the TOC does not render at all.
- The implementation should not require authors to manually maintain TOC content in Markdown.
- The existing visual language of the site should be preserved.
- The site is static, so the solution should stay lightweight and avoid unnecessary build-time dependencies.

## Chosen Approach

Use progressive enhancement on the client:

1. Render the post page normally from Jekyll.
2. After page load, run a small vanilla JavaScript module on post pages only.
3. Scan the article body (`.prose`) for `h2` and `h3` headings.
4. Generate stable heading anchors if they do not already exist.
5. If there are at least 2 headings, build TOC markup for:
   - a desktop left-side framed panel
   - a mobile collapsible block above the article body
6. Use `IntersectionObserver` to update the active TOC item while scrolling.

This avoids adding Jekyll plugins, preserves the current writing workflow, and covers the requested sticky/highlight behavior with minimal surface area.

## Alternatives Considered

### 1. Build-time TOC generation with a Jekyll plugin

Pros:

- TOC exists in the initial HTML
- less runtime DOM work

Cons:

- adds build-time complexity and dependency surface
- still needs client-side code for active-section highlighting
- heavier than necessary for the current site structure

Decision: rejected.

### 2. Manually authored TOC in each post

Pros:

- simplest technical implementation

Cons:

- adds authoring burden
- easy for the TOC to drift out of sync with headings
- does not fit the requested “just works” behavior

Decision: rejected.

## Page Structure

The TOC should be added only in the post layout.

The page structure will be adjusted so the article content and desktop TOC can sit in the same layout context:

- desktop: article card remains the main content block, with a separate TOC panel positioned to its left
- mobile: a collapsible TOC block appears above the article content inside the post flow

The post layout should include empty mount points for:

- desktop TOC container
- mobile TOC container

The JavaScript enhancement populates these containers only when the heading threshold is met.

## Visual Design

The selected direction is a framed panel rather than a minimal rail.

Desktop TOC panel:

- styled as a compact bordered card
- visually lighter than the main article card, but clearly discoverable
- aligned to the left of the article like a margin note
- constrained to the viewport height and internally scrollable when necessary

Desktop TOC item styling:

- `h2` entries are primary items
- `h3` entries are indented secondary items
- active item uses the site accent color plus a subtle marker treatment
- inactive items remain low-contrast but readable

Mobile TOC block:

- rendered above the post content
- collapsed by default
- expanded via a button-like header
- uses the same heading hierarchy as desktop
- automatically collapses after the user taps a TOC entry

## Behavior

### Heading discovery

- Query headings inside the post body only.
- Include `h2` and `h3`.
- Ignore headings inside unrelated page chrome.

### Anchor generation

- If a heading already has an `id`, reuse it.
- If not, generate a slug from its text content.
- If generated IDs collide, append a numeric suffix to keep them unique.

### Rendering threshold

- If fewer than 2 TOC entries are found, do not render desktop or mobile TOC UI.

### Scrolling and visibility

- Desktop TOC should use `position: sticky`, not `position: fixed`.
- The effect should be “always visible while reading” without overlapping the footer or breaking the centered layout.
- The sticky top offset should respect the site header and breathing room.

### Active-section highlighting

- Use `IntersectionObserver` when available.
- Determine the currently active section based on headings entering the reading zone.
- Update both desktop and mobile TOC states from the same active heading.
- If `IntersectionObserver` is unavailable, the TOC remains navigable but without live highlighting.

### Mobile toggle behavior

- The TOC starts collapsed.
- Tapping the toggle expands or collapses the list.
- Selecting a heading closes the list after navigation.

## Component Responsibilities

### Post layout

Responsible for:

- exposing desktop and mobile TOC mount points
- limiting TOC scope to blog post pages only

### TOC script

Responsible for:

- collecting headings
- normalizing/generating heading IDs
- building the TOC DOM
- wiring click navigation
- managing mobile expand/collapse
- tracking and updating active heading state

### TOC styles

Responsible for:

- desktop framed-panel layout
- mobile collapsible presentation
- spacing, indentation, overflow, and active state styling
- responsive breakpoint behavior

## Data Flow

1. The post page loads.
2. The TOC script finds the post content container.
3. The script extracts `h2` and `h3` headings.
4. The script assigns stable IDs where needed.
5. If there are at least 2 entries, the script renders both TOC views from one data set.
6. Scroll observation updates the active item.
7. Clicking a TOC entry navigates to the related heading.

## Error Handling and Fallbacks

- Missing post body container: exit silently.
- No eligible headings: exit silently.
- Duplicate heading text: generate unique IDs.
- Missing `IntersectionObserver`: render TOC without active tracking.
- Excessively long TOC: allow the panel itself to scroll.

## Verification

Implementation will be considered complete when all of the following are true:

- On desktop, long posts show a left-side TOC panel that stays visible while scrolling.
- On mobile, the TOC appears above the article as a collapsible section.
- TOC entries are generated from `h2` and `h3` headings.
- Clicking any TOC entry navigates to the correct heading.
- The current section is highlighted during scroll on browsers that support `IntersectionObserver`.
- Posts with fewer than 2 headings show no TOC UI.
- The site still builds successfully with:
  - `bundle exec jekyll build`
  - `bun run build:css`

## Out of Scope

- TOC support for non-post pages
- indexing headings deeper than `h3`
- server-side or plugin-driven TOC generation
- additional reading-progress indicators
- manual per-post TOC customization
