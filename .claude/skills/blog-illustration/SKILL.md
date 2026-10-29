---
name: blog-illustration
description: Draw diagrams for yaodong.dev blog posts in the site's house style — framed figure cards with a title, an inline SVG drawing of dot nodes and thin connectors that uses the site's CSS variables (so it follows light/dark mode), and a numbered caption. Use when a post needs a figure, diagram, flow, or illustration, or when the author asks to add or revise one.
---

# Blog illustration

Figures on yaodong.dev are **framed cards written into the post's Markdown**, not image files: a title and subtitle, an inline SVG drawing, and a caption the site numbers `FIG A`, `FIG B`, ... per post. The style follows the figures in Anthropic's [Solving code review at Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic/): clean, typographic, mostly text and thin lines. Every color and font comes from the site's CSS variables in `src/styles/application.css`, so one figure renders correctly in light and dark mode, stays sharp at any size, and its text is selectable. Don't fall back to PNGs, and don't add a download button.

## First decide whether the figure earns its place

A figure has to show something the prose can't show as quickly. Before drawing, write one sentence: "After seeing this, the reader understands ___." If the answer is just the paragraph above it redrawn as nodes, don't draw it.

Good reasons, from past posts:
- **Repetition or cost made visible**: the same manual work appearing once per stage (`scripts/figures/2026-09-29-e2e-manual-stages.ts`).
- **Who does what, and where they meet**: an agent pipeline on one row, the few places a person steps in on another, and what passes along the connectors (`scripts/figures/2026-09-29-e2e-automation-workflow.ts`).
- **Order matters**: a test case followed by the runs in the order they happen, each with its expected result (`scripts/figures/2026-09-29-e2e-red-green.ts`). A first draft fanned the case out to all environments at once; the author rejected it because it hid the sequence. When the point is a process, connect the steps left to right with labeled arrows.

Rejected in the past: a decorative flow that restated the paragraph, and a generic test pyramid with no point of its own. The author will say a figure "没有思考" when it only restates text.

Keep labels short. The author trimmed a lane label from "ME, BY HAND" to "ME" where the row was already clear, and dropped duration notes and a closing sentence that the prose already said.

Keep every label factual and taken from the post. Don't invent steps, numbers, or tools that the post doesn't mention.

## The card

- **Title**: a short sentence-case statement of what the figure shows ("One test case, four runs", "The job and the browser never meet"). Not the section heading repeated.
- **Subtitle**: one plain line of context: what is drawn, or the option's name ("A bug-fix case, in the order its runs happen", "Redis Streams with SSE").
- **Caption**: one sentence on what to take from it, in the post's voice. The site adds `FIG A` in front; never write the letter yourself.
- Plain words on all three, per the post's voice rules: no slogans, no punchlines.

## Visual language

- **Font**: `var(--font-body)` (Fira Sans) for the drawing; `var(--font-mono)` only for lane labels. The helper sets both.
- **Nodes, not boxes**: a dot, a title (14, weight 500) to its right, and up to two or three short muted lines under it (12.5). Node titles are sentence case ("Read the final log"); lines under them are lowercase fragments.
- **Dot kinds**:
  - `kind: "system"` (default): filled dot. Agents, services, environments, automation.
  - `kind: "human"`: hollow ring. What the author does.
- **Accent**: `focal: true` colors one dot (or a connector) with `--color-accent`, the site's only accent color. Use it for the one point the figure is about: the run that must fail first, the Redis stream that decouples the job, the piece each option adds. Most figures have one focal point; some have none. Never use it for decoration or for good/bad.
- **Outcomes are words, not colors**: "fails as expected", "passes" go in a `result` line, never in red and green.
- **Lane labels**: small uppercase mono (`AGENTS`, `ME`, `#WRITE-ROOM`), placed 24 above the row and aligned with the node titles (`x + 14`), so vertical connectors from the dots stay clear of them. Only when rows need naming.
- **Regions**: a flat `--color-bg-subtle` wash behind nodes that share a place (one container, one machine, one skill). No borders.
- **Connectors**: 1px muted lines with small open chevrons, sharp corners. Solid for the normal flow; dashed for optional, occasional, or feedback flows. A horizontal connector runs at the dot's height from the end of one title to the next dot (`link()`). Short labels (13, secondary color) name what passes along them (`plan file`, `run log`, `merge`): centered above a horizontal segment, or on the text column (`x + 14`) beside a vertical one.
- **Alignment**: every left-aligned piece of text in a column starts on that column's text line, dot `x + 14`: node titles and lines, lane labels, labels beside vertical connectors, and free labels such as `@mention`. Dots in a row share one `y`; dots in a column share one `x`. When a vertical connector crosses a lane label, put its label in the free span above the lane label (`labelAt`), so the two don't stack into what reads as a list. A figure the author flagged had "plan file" 6px left of the column and 11px above `ME`; the helper now checks both.
- **Feedback loops**: route a dashed path around the nodes, never through them, with its label on the long return segment.
- **Fan-out**: one node feeding several with smooth cubic curves (`d.curve("M... C...")`) that end in a straight vertical drop.
- **Color**: site tokens only. No shadows, gradients, icons, or emoji.
- **Size**: `viewBox` 840 wide (the helper warns past 846, the card's inner width), height to fit. The card widens past the 640px text column to 880px on desktop, so the drawing renders at about 1:1. Below an 842px viewport the title and caption wrap to the card, and the drawing keeps a 760px minimum width and scrolls sideways inside it.

## How to make one

1. Write a generator in `scripts/figures/<post-date>-<name>.ts` using the helper in this skill:

   ```ts
   import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

   const d = new Figure({
     width: 840, height: 220, idPrefix: "xx",
     title: "Agents do the work, I check the evidence",
     subtitle: "Planning, writing, and running E2E tests for one ticket",
     caption: "I review the plan before any code and read the log of the final run.",
     label: "One sentence describing the figure for screen readers.",
   });
   d.laneLabel(44, 22, "agents");
   const plan = d.node(30, 46, "Plan", ["scenario, data state", "what counts as success"]);
   const run = d.node(235, 46, "Run", "tester runs the steps", { focal: true });
   d.link(plan, run, { label: "tests" });
   const me = d.node(30, 150, "Review the plan", "before any code", { kind: "human" });
   d.arrow([[30, plan.bottom + 12], [30, 138]], { both: true, label: "plan file" });
   d.arrow([[235, 58], [235, 200], [12, 200], [12, 46], [20, 46]], { dashed: true, label: "feedback", labelAt: [124, 193] });
   d.save("scripts/figures/out/<post-date>-<name>");
   ```

   `node()` returns `{ x, y, end, right, bottom }` (title end, widest line, last baseline) so connectors can start just past the text: `bottom + 12` below a node, `y - 12` above the next one. Use a unique `idPrefix` per figure: it scopes the SVG's styles, and two figures on one page must not share it.

2. Run it from the repo root: `bun scripts/figures/<script>.ts`, or `bun run figures` for every figure. It writes `scripts/figures/out/<name>.figure.html` (the block for the post) and light/dark PNG previews rendered by headless Chrome with the site's stylesheet and fonts. It prints warnings, and exits non-zero, for:
   - text outside the viewBox, text overlapping text, or straight connectors crossing text (curves aren't checked);
   - text from different elements stacked less than 12 apart;
   - parallel straight connectors running side by side less than 24 apart;
   - left-aligned text, centered text, dot columns, or dot rows that almost line up (within 8) but don't;
   - a node wider than its `width`, a viewBox wider than 846, or text too small on phones.

   Text widths come from Fira Sans metrics, so the checks match the browser. Fix every warning; `bun run figures` stops at the first figure that has one.

3. **Look at both previews** (`-light.png` and `-dark.png`). Check uneven spacing, labels crowding lines, and whether the focal accent lands on the right thing; the checker can't judge those.

4. For a new figure, paste the whole `.figure.html` block into the post right after the paragraph it supports. After that, every run that passes its checks replaces that block in the post by itself: it finds the post whose filename starts with the script's date and the `<figure>` holding `<svg id="<idPrefix>"`. Don't edit a figure block in the post by hand; change the script and rerun. The block must not contain blank lines, or Markdown will break it; the helper never emits any.

5. Run `bun run build` and confirm the figure appears in `dist/<slug>/index.html`. If possible, check it on `bun run dev` in both color schemes and at phone width.

## Layout tips

- Space columns evenly: `xs = [0, 1, 2, 3].map((i) => 30 + i * 205)`. Start the first dot at `x = 30`; leave room for the widest line under a node plus about 30 before the next dot.
- Rows about 100 apart for nodes with two lines under them; add 20–30 when a vertical connector between rows carries a label and a lane label sits above the lower row.
- Keep a clear left margin (about 12) for loop paths that return to the start of a row. When the loop passes a column that has its own vertical connectors, start the first dot at `x = 48` instead of 30, so the loop and those connectors stay 36 apart instead of 18, which looked cramped.
- Place nodes in the second row under the column they relate to, and leave a column empty rather than invent a node to fill it.
- Several figures in one section can share a grid (see `2025-12-20-streaming-options.ts`) so the pieces each one adds line up across them.
