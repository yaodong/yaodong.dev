---
name: blog-illustration
description: Draw diagrams for yaodong.dev blog posts in the site's house style — inline SVG components that use the site's CSS variables (so they follow light/dark mode), monospace text, subtle filled boxes for systems and outlined boxes for what a person does. Use when a post needs a figure, diagram, flow, or illustration, or when the author asks to add or revise one.
---

# Blog illustration

Figures on yaodong.dev are **inline SVG components written into the post's Markdown**, not image files. Every color and font comes from the site's CSS variables in `src/styles/application.css`, so one figure renders correctly in light and dark mode, stays sharp at any size, and its text is selectable. The author likes this approach; don't fall back to PNGs.

## First decide whether the figure earns its place

A figure has to show something the prose can't show as quickly. Before drawing, write one sentence: "After seeing this, the reader understands ___." If the answer is just the paragraph above it redrawn as boxes, don't draw it.

Good reasons, from past posts:
- **Repetition or cost made visible**: the same manual work appearing once per stage (`scripts/figures/2026-09-29-e2e-manual-stages.py`).
- **Who does what, and where they meet**: an agent pipeline on one row, the few places a person steps in on another, and the shared artifacts on the connectors (`scripts/figures/2026-09-29-e2e-automation-workflow.py`).
- **Order matters**: a test case followed by the runs in the order they happen, each with its expected result (`scripts/figures/2026-09-29-e2e-red-green.py`). A first draft fanned the case out to all environments at once; the author rejected it because it hid the sequence. When the point is a process, connect the steps left to right with labeled arrows.

Rejected in the past: a decorative flow that restated the paragraph, and a generic test pyramid with no point of its own. The author will say a figure "没有思考" when it only restates text.

Keep labels short. The author trimmed "ME, BY HAND" to "ME", and dropped duration notes and a closing sentence that the prose already said.

Keep every label factual and taken from the post. Don't invent steps, numbers, or tools that the post doesn't mention.

## Visual language

- **Font**: `var(--font-mono)` (JetBrains Mono) for everything, lowercase labels.
- **Rows as lanes**: each row is one actor or layer, named with a small uppercase lane label above it (`AGENTS`, `ME`, `ENVIRONMENTS`, `ME, BY HAND`).
- **Two box kinds only**:
  - `kind="system"`: filled with `--color-bg-subtle`, no border. Agents, services, environments, automation.
  - `kind="human"`: page background with a `--color-text` outline. What the author does.
- **Box text**: bold title; one muted subtitle line, or several short bullet lines (left-aligned) when the box holds a list. `bullets=False` stacks lines centered instead. `result="..."` adds one bold line at the bottom for an outcome ("passes", "fails as expected").
- **Outcomes are words, not colors**: the palette is monochrome, so "red/green" or "good/bad" is stated in text, never with red and green.
- **Lane labels only when rows need naming**: drop them when the row's meaning is obvious or when connectors would cross them.
- **Connectors**: thin muted lines with open chevron arrowheads. Solid for the normal flow; dashed for optional, occasional, or feedback flows. Short muted labels on connectors name what passes along them (`plan file`, `run log`, `merge`).
- **Feedback loops**: route a dashed path around the boxes, never through them, with a muted note underneath.
- **Fan-out**: one box feeding several with smooth cubic curves (`d.path("M... C...", dashed=False)`) from a single point on its bottom edge.
- **Color**: monochrome from the site tokens only (`--color-text`, `--color-text-body`, `--color-text-muted`, `--color-bg-subtle`, `--color-bg`). No accent colors, no shadows, no gradients, no icons or emoji.
- **Size**: `viewBox` 800–880 wide, never wider (the helper warns), height to fit (roughly 370–400 for two rows). On desktop a figure renders at up to 880px, wider than the 640px text column. On phones it keeps a 760px minimum width and scrolls sideways inside its own box, so the text stays readable instead of shrinking to fit the screen.
- **Text sizes are fixed by the helper**: 12.5 for subtitles, bullets, connector labels and notes, 12.5 bold for lane labels, 14–15 bold for titles. Don't pass smaller sizes to `d.text()`. Use `FONT_LABEL` (importable from `diagram`) for free-standing labels. The helper warns when the smallest text would render under 10.5px on a phone.
- **Bold is weight 600**: the site self-hosts JetBrains Mono up to 600, so 700 only fakes it.
- **Writing on the figure** follows the post's voice rules: plain words, no slogans, no punchlines.

## How to make one

1. Write a generator script in `scripts/figures/<post-date>-<name>.py` using the helper in this skill:

   ```python
   import sys
   sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
   from diagram import Diagram

   d = Diagram(800, 380, id_prefix="xx", label="One sentence describing the figure for screen readers.")
   d.lane_label(44, 52, "agents")
   d.box(44, 70, 166, 58, "plan", "scenarios, data, success", kind="system")
   d.box(44, 236, 166, 58, "review the plan", ["before any code", "happy and error paths"], kind="human")
   d.arrow(127, 132, 127, 232, both=True, label="plan file")
   d.path("M...", dashed=True)          # loops routed around boxes
   d.note(400, 360, "muted footnote")
   d.save("scripts/figures/out/<post-date>-<name>")
   ```

   Use a unique `id_prefix` per figure: two figures on one page must not share marker ids.

2. Run it from the repo root: `python3 scripts/figures/<script>.py`. It writes the inline SVG and light/dark PNG previews (colors read from `application.css`) to `scripts/figures/out/`, and prints warnings for text that overflows a box, boxes too short for their lines, a viewBox wider than 880, or text too small on phones. Fix every warning. Long subtitle and bullet lines wrap automatically (bullets with a hanging indent), so a wrapped line needs a taller box. Widen the box, or accept the wrap and raise the box height.

3. **Look at both previews** (`-light.png` and `-dark.png`) before inserting. Check for overlapping text, labels touching boxes, arrows crossing boxes, and uneven spacing.

4. Insert the SVG into the post, wrapped in `<figure>`, placed right after the paragraph it supports:

   ```html
   <figure>
   <svg viewBox="0 0 800 390" role="img" aria-label="..." style="width:100%;height:auto;font-family:var(--font-mono)">
   ...
   </svg>
   </figure>
   ```

   The HTML block must not contain blank lines, or Markdown will break it. When regenerating, replace the whole `<figure>` block.

5. Run `bun run build` and confirm the figure appears in `dist/<slug>/index.html`. If possible, check it on `bun run dev` in both color schemes.

## Layout tips

- Space columns evenly: `xs = [x0 + i * (bw + gap) for i in range(n)]`. Start with `x0 = 44`, and leave `gap` at 24 or more, or 56 or more when a connector carries a label.
- Budget text width at `0.6 × font size` per character (monospace), about 7.5px per character at 12.5. A bullet line needs `box width ≥ 22 + 7.5 × (characters + 2)`. The helper checks this.
- Keep connector labels shorter than the gap they sit in: a 56px gap fits about 7 characters.
- Keep a clear left margin (about 16px) for loop paths that return to the start of a row.
- Place boxes in the second row under the column they relate to, and leave a column empty rather than invent a box to fill it.
