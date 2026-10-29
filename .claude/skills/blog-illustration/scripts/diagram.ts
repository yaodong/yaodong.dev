/**
 * Helpers for yaodong.dev blog figures.
 *
 * A figure is a framed card: a title and subtitle, an inline SVG drawing, and a
 * caption that the site numbers FIG A, FIG B, ... Every color and font in the
 * drawing comes from the site's CSS variables (src/styles/application.css), so
 * one figure follows light and dark mode.
 *
 * The drawing is made of dot nodes (a dot, a title to its right, muted lines
 * under it), thin connectors with open chevrons, and small uppercase lane labels.
 * `Figure.save()` writes the <figure> block to paste into the post, and light and
 * dark previews rendered by headless Chrome with the site's real CSS and fonts.
 *
 * Usage (see scripts/figures/*.ts for real examples), run with `bun <script>`:
 *
 *   import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";
 *
 *   const d = new Figure({
 *     width: 840, height: 200, idPrefix: "ev",
 *     title: "Our incidents are the eval",
 *     subtitle: "Built from past incidents and reverts",
 *     caption: "The eval grows with every incident.",
 *     label: "What the drawing shows, in one sentence, for screen readers.",
 *   });
 *   const a = d.node(40, 30, "Incident or revert", "a change that broke something");
 *   const b = d.node(260, 30, "Daily eval run", "scored against every case", { focal: true });
 *   d.link(a, b);
 *   d.arrow([[474, 40], [474, 104], [40, 104]], { dashed: true, label: "next change" });
 *   d.save("scripts/figures/out/my-figure");
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const REPO = resolve(import.meta.dir, "../../../..");
const CSS = resolve(REPO, "src/styles/application.css");
const FONTS_CSS = resolve(REPO, "src/styles/fonts.css");
const POSTS = resolve(REPO, "src/content/blog");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Style constants. Keep these stable so every figure looks like the same family.
// Sizes are in viewBox units. On wide screens the drawing renders at about its
// viewBox width; below that it keeps PHONE_WIDTH px and scrolls sideways, so
// the smallest text must stay readable there (see MIN_RENDERED_PX).
export const FONT_TITLE = 14; // node title
export const FONT_SUB = 12.5; // lines under a node title
export const FONT_LABEL = 13; // labels on connectors, free-standing labels
export const FONT_LANE = 12; // uppercase mono lane labels
const WEIGHT_TITLE = 500;
const LINE = 17.5; // spacing between lines under a node title
const DOT_R = 5.5;
const TEXT_DX = 14; // node text starts this far right of the dot center
const GAP = 10; // space between a connector end and a dot or text
const STROKE = 1;
const DASH = "3 3";
const MAX_WIDTH = 846; // inner width of the figure card (--figure-width minus padding and border)
const PHONE_WIDTH = 760; // min-width of the drawing on phones (application.css)
const MIN_RENDERED_PX = 10.5;
// Alignment: text columns, dot columns and dot rows closer than ALIGN_TOL but
// not equal read as a mistake, so they warn. Text from different elements
// stacked closer than CROWD_GAP reads as one list, so that warns too, and so do
// parallel connectors running side by side closer than LINE_GAP.
const ALIGN_TOL = 8;
const CROWD_GAP = 12;
const LINE_GAP = 24;

const T = "var(--color-text)";
const B = "var(--color-text-body)";
export const S = "var(--color-text-secondary)";
export const M = "var(--color-text-muted)";
const WASH = "var(--color-bg-subtle)";
const BG = "var(--color-bg)";
const ACCENT = "var(--color-accent)";

// Fira Sans advance widths (em) for ASCII 32..126, measured from the site's
// self-hosted woff2 files, so overflow and overlap checks match the browser.
const FIRA: Record<400 | 500, number[]> = {
  400: [
    0.265, 0.241, 0.399, 0.518, 0.531, 0.826, 0.729, 0.219, 0.324, 0.324, 0.439, 0.499, 0.24, 0.403, 0.24, 0.52,
    0.558, 0.433, 0.495, 0.499, 0.532, 0.501, 0.533, 0.444, 0.551, 0.525, 0.24, 0.24, 0.5, 0.5, 0.5, 0.459, 1.02,
    0.573, 0.608, 0.56, 0.644, 0.535, 0.491, 0.631, 0.68, 0.295, 0.305, 0.589, 0.498, 0.778, 0.683, 0.692, 0.581,
    0.691, 0.605, 0.545, 0.517, 0.662, 0.556, 0.826, 0.54, 0.55, 0.522, 0.322, 0.52, 0.322, 0.54, 0.52, 0.3,
    0.544, 0.594, 0.478, 0.598, 0.545, 0.335, 0.52, 0.586, 0.282, 0.28, 0.512, 0.293, 0.857, 0.586, 0.584, 0.594,
    0.598, 0.386, 0.467, 0.361, 0.582, 0.492, 0.717, 0.485, 0.492, 0.437, 0.322, 0.403, 0.322, 0.488,
  ],
  500: [
    0.25, 0.241, 0.421, 0.539, 0.541, 0.844, 0.746, 0.23, 0.324, 0.324, 0.444, 0.516, 0.24, 0.405, 0.24, 0.52,
    0.573, 0.45, 0.507, 0.51, 0.55, 0.52, 0.55, 0.457, 0.567, 0.544, 0.24, 0.24, 0.51, 0.51, 0.51, 0.471, 1.02,
    0.583, 0.613, 0.568, 0.648, 0.53, 0.489, 0.638, 0.672, 0.294, 0.312, 0.613, 0.506, 0.782, 0.672, 0.691, 0.591,
    0.691, 0.611, 0.56, 0.53, 0.656, 0.564, 0.837, 0.562, 0.574, 0.534, 0.323, 0.52, 0.323, 0.55, 0.52, 0.322,
    0.546, 0.596, 0.478, 0.599, 0.549, 0.347, 0.537, 0.581, 0.282, 0.281, 0.534, 0.295, 0.85, 0.581, 0.584, 0.596,
    0.599, 0.394, 0.476, 0.375, 0.577, 0.504, 0.734, 0.5, 0.506, 0.449, 0.323, 0.388, 0.323, 0.502,
  ],
};
const MONO_CHAR = 0.6; // JetBrains Mono advance width per px of font size
const LANE_TRACK = 0.08; // letter-spacing of lane labels, in em

export type Point = [number, number];
type Anchor = "start" | "middle" | "end";
// `x` and `anchor` are where the text is anchored; `group` ties the lines
// of one node together so they may sit close to each other.
type Box = { s: string; x0: number; y0: number; x1: number; y1: number; x: number; anchor: Anchor; group: string };

/** Numbers in SVG attributes: up to six significant digits, no trailing zeros. */
const n = (x: number) => String(Number(x.toPrecision(6)));
// Whitespace collapses to single spaces: a newline in the output could open a
// blank line, which ends Markdown's HTML block early.
const esc = (s: string) =>
  s.replace(/\s+/g, " ").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function textWidth(s: string, size: number, weight = 400, mono = false) {
  if (mono) return s.length * size * (MONO_CHAR + LANE_TRACK);
  const table = FIRA[weight >= 500 ? 500 : 400];
  let em = 0;
  for (const c of s) {
    const code = c.codePointAt(0)!;
    em += code >= 32 && code < 127 ? table[code - 32] : 0.55;
  }
  return em * size;
}

/** Greedy word wrap into lines no wider than `avail`. */
export function wrap(s: string, avail: number, size: number) {
  const out: string[] = [];
  let cur = "";
  for (const word of s.split(/\s+/).filter(Boolean)) {
    const trial = cur ? `${cur} ${word}` : word;
    if (cur && textWidth(trial, size) > avail) {
      out.push(cur);
      cur = word;
    } else {
      cur = trial;
    }
  }
  return cur ? [...out, cur] : out;
}

/** A placed node. `x, y` is the dot center; `end` is where its title ends,
 *  `right` the widest text line, `bottom` the baseline of its last line. */
export type Node = { x: number; y: number; end: number; right: number; bottom: number };

export type NodeOptions = {
  /** "system": filled dot (agents, services, environments, automation).
   *  "human": hollow ring (what a person, the author, does). */
  kind?: "system" | "human";
  /** The dot takes the accent color. Use it for the one or two points the
   *  figure is about, never as decoration. */
  focal?: boolean;
  /** Space for the node's text; longer lines wrap, and a title that doesn't fit warns. */
  width?: number;
  /** One line in the title color for an outcome ("passes"). */
  result?: string;
};

export type ArrowOptions = {
  /** For optional, occasional or feedback flows. */
  dashed?: boolean;
  head?: boolean;
  both?: boolean;
  /** Sits centered above the longest horizontal segment, or to the right of a vertical one. */
  label?: string;
  labelAt?: [number, number] | [number, number, Anchor];
  focal?: boolean;
};

export type TextOptions = {
  size?: number;
  color?: string;
  anchor?: Anchor;
  weight?: number;
  mono?: boolean;
  group?: string;
};

export class Figure {
  readonly w: number;
  readonly h: number;
  private label: string;
  private id: string;
  private title: string;
  private subtitle?: string;
  private caption?: string;
  private back: string[] = [];
  private lines: string[] = [];
  private front: string[] = [];
  private boxes: Box[] = []; // text bounding boxes, for overlap checks
  private segments: [Point, Point][] = []; // straight connector segments, for crossing checks
  private warnings: string[] = [];
  private dots: Point[] = []; // dot centers, for alignment checks
  private nodeCount = 0;
  private minSize = FONT_SUB;

  constructor(o: {
    width: number;
    height: number;
    label: string;
    title: string;
    subtitle?: string;
    caption?: string;
    idPrefix?: string;
  }) {
    this.w = o.width;
    this.h = o.height;
    this.label = o.label;
    this.id = o.idPrefix ?? "fig";
    this.title = o.title;
    this.subtitle = o.subtitle;
    this.caption = o.caption;
  }

  // --- text -------------------------------------------------------------
  /** Free-standing text. Returns its width. */
  text(x: number, y: number, s: string, o: TextOptions = {}) {
    const { size = FONT_LABEL, color = S, anchor = "start", weight = 400, mono = false } = o;
    const group = o.group ?? `text${this.boxes.length}`;
    this.minSize = Math.min(this.minSize, size);
    const w = textWidth(s, size, weight, mono);
    const x0 = { start: x, middle: x - w / 2, end: x - w }[anchor];
    this.boxes.push({ s, x0, y0: y - 0.72 * size, x1: x0 + w, y1: y + 0.22 * size, x, anchor, group });
    const extra = mono ? ` class="mono" letter-spacing="${LANE_TRACK}em"` : "";
    const weightAttr = weight !== 400 ? ` font-weight="${weight}"` : "";
    const anchorAttr = anchor !== "start" ? ` text-anchor="${anchor}"` : "";
    this.front.push(
      `<text x="${n(x)}" y="${n(y)}"${anchorAttr} font-size="${n(size)}"${weightAttr}${extra} ` +
        `style="fill:${color}">${esc(s)}</text>`,
    );
    return w;
  }

  /** Small uppercase mono label naming a row or a group: AGENTS, ME, SKILL. */
  laneLabel(x: number, y: number, s: string) {
    this.text(x, y, s.toUpperCase(), { size: FONT_LANE, color: S, weight: 500, mono: true });
  }

  /** Muted footnote-style text, e.g. under a loop. */
  note(x: number, y: number, s: string, anchor: Anchor = "start") {
    this.text(x, y, s, { size: FONT_LABEL, color: M, anchor });
  }

  // --- nodes --------------------------------------------------------------
  /** A dot at (x, y) with a title to its right and muted lines under it. */
  node(x: number, y: number, title: string, lines: string | string[] = [], o: NodeOptions = {}): Node {
    const { kind = "system", focal = false, width, result } = o;
    const given = typeof lines === "string" ? (lines ? [lines] : []) : lines;
    const tx = x + TEXT_DX;
    const avail = width ? width - TEXT_DX : undefined;
    const rows = given.flatMap((line) => (avail ? wrap(line, avail, FONT_SUB) : [line]));
    const group = `node${this.nodeCount++}`;
    const tw = this.text(tx, y + 4.5, title, { size: FONT_TITLE, color: T, weight: WEIGHT_TITLE, group });
    let right = tx + tw;
    rows.forEach((s, i) => {
      right = Math.max(right, tx + this.text(tx, y + 22 + i * LINE, s, { size: FONT_SUB, color: M, group }));
    });
    if (result) {
      rows.push(result);
      const ry = y + 22 + (rows.length - 1) * LINE;
      right = Math.max(right, tx + this.text(tx, ry, result, { size: FONT_SUB, color: T, weight: WEIGHT_TITLE, group }));
    }
    if (avail && right - tx > avail) {
      this.warnings.push(`node '${title}' text is ${(right - tx).toFixed(0)}px wide, only ${avail.toFixed(0)}px available`);
    }
    this.dot(x, y, kind, focal);
    const bottom = rows.length ? y + 22 + (rows.length - 1) * LINE : y + 4.5;
    return { x, y, end: tx + tw, right, bottom };
  }

  /** A bare dot, e.g. a waypoint with a label placed separately. */
  dot(x: number, y: number, kind: "system" | "human" = "system", focal = false) {
    this.dots.push([x, y]);
    if (kind === "human") {
      this.front.push(
        `<circle cx="${n(x)}" cy="${n(y)}" r="${n(DOT_R - 0.5)}" stroke-width="1.5" ` +
          `style="fill:${BG};stroke:${focal ? ACCENT : B}"/>`,
      );
    } else {
      this.front.push(
        `<circle cx="${n(x)}" cy="${n(y)}" r="${n(DOT_R)}" stroke-width="2" ` +
          `style="fill:${focal ? ACCENT : B};stroke:${BG}"/>`,
      );
    }
  }

  // --- connectors ---------------------------------------------------------
  /** A connector through `points`, sharp corners, open chevron at the end. */
  arrow(points: Point[], o: ArrowOptions = {}) {
    const { dashed = false, head = true, both = false, label, labelAt, focal = false } = o;
    const color = focal ? ACCENT : M;
    const dash = dashed ? ` stroke-dasharray="${DASH}"` : "";
    const d = "M" + points.map(([x, y]) => `${n(x)} ${n(y)}`).join(" L");
    this.lines.push(
      `<path d="${d}" fill="none" stroke-width="${STROKE}" stroke-linejoin="round"${dash} style="stroke:${color}"/>`,
    );
    const segs = points.slice(1).map((q, i) => [points[i], q] as [Point, Point]);
    this.segments.push(...segs);
    if (head) this.head(points.at(-2)!, points.at(-1)!, color);
    if (both) this.head(points[1], points[0], color);
    if (!label) return;
    let lx: number, ly: number, anchor: Anchor;
    if (labelAt) {
      [lx, ly, anchor = "middle"] = labelAt;
    } else {
      const weight = ([[x1, y1], [x2, y2]]: [Point, Point]) => -Math.abs(x2 - x1) - Math.abs(y2 - y1) * 0.5;
      const [[x1, y1], [x2, y2]] = [...segs].sort((a, b) => weight(a) - weight(b))[0];
      if (y1 === y2) [lx, ly, anchor] = [(x1 + x2) / 2, y1 - 7, "middle"];
      // vertical: on the text column, so it lines up with node titles and lane labels
      else [lx, ly, anchor] = [x1 + TEXT_DX, (y1 + y2) / 2 + 4.5, "start"];
    }
    this.text(lx, ly, label, { size: FONT_LABEL, color: S, anchor });
  }

  /** Horizontal connector from the end of node a's title to node b's dot. */
  link(a: Node, b: Node, o: ArrowOptions = {}) {
    if (a.y !== b.y) throw new Error("link() joins nodes on one row; use arrow() with points");
    if (b.x > a.x) this.arrow([[a.end + GAP, a.y], [b.x - GAP, b.y]], o);
    else this.arrow([[a.x - GAP, a.y], [b.end + GAP, b.y]], o);
  }

  /** Free-form path (e.g. a fan-out with cubic curves). Give headFrom / headTo
   *  as the last control point and end point to draw a chevron. Curves are not
   *  checked for crossing text, so look at the previews. */
  curve(d: string, o: { dashed?: boolean; headFrom?: Point; headTo?: Point; focal?: boolean } = {}) {
    const color = o.focal ? ACCENT : M;
    const dash = o.dashed ? ` stroke-dasharray="${DASH}"` : "";
    this.lines.push(
      `<path d="${d}" fill="none" stroke-width="${STROKE}" stroke-linejoin="round"${dash} style="stroke:${color}"/>`,
    );
    if (o.headFrom && o.headTo) this.head(o.headFrom, o.headTo, color);
  }

  private head([x1, y1]: Point, [x2, y2]: Point, color: string) {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1;
    const [ux, uy] = [(x2 - x1) / L, (y2 - y1) / L];
    const [bx, by] = [x2 - 4 * ux, y2 - 4 * uy];
    const w1 = [bx - 3.5 * uy, by + 3.5 * ux];
    const w2 = [bx + 3.5 * uy, by - 3.5 * ux];
    this.lines.push(
      `<path d="M${w1[0].toFixed(1)} ${w1[1].toFixed(1)} L${n(x2)} ${n(y2)} L${w2[0].toFixed(1)} ${w2[1].toFixed(1)}" ` +
        `fill="none" stroke-width="${STROKE}" stroke-linejoin="round" stroke-linecap="round" style="stroke:${color}"/>`,
    );
  }

  // --- regions ------------------------------------------------------------
  /** A flat wash behind a group of nodes that share a place, e.g. one
   *  container or one machine. Optional lane label in its top-left corner. */
  region(x: number, y: number, w: number, h: number, label?: string) {
    this.back.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="2" style="fill:${WASH}"/>`);
    if (label) this.laneLabel(x + 12, y + 20, label);
  }

  // --- checks -------------------------------------------------------------
  private check() {
    if (this.w > MAX_WIDTH) {
      this.warnings.push(`viewBox width ${this.w} is wider than ${MAX_WIDTH}; the figure will be scaled down`);
    }
    const rendered = (this.minSize * Math.min(PHONE_WIDTH, MAX_WIDTH)) / this.w;
    if (rendered < MIN_RENDERED_PX) {
      this.warnings.push(
        `smallest text ${this.minSize}px renders at ${rendered.toFixed(1)}px on phones; keep it >= ${MIN_RENDERED_PX}`,
      );
    }
    for (const b of this.boxes) {
      if (b.x0 < 0 || b.y0 < 0 || b.x1 > this.w || b.y1 > this.h) {
        this.warnings.push(`text '${b.s}' runs outside the ${this.w}x${this.h} viewBox`);
      }
    }
    this.boxes.forEach((a, i) => {
      for (const b of this.boxes.slice(i + 1)) {
        const side = a.x0 < b.x1 + 3 && b.x0 < a.x1 + 3;
        const gap = Math.max(b.y0 - a.y1, a.y0 - b.y1);
        if (side && gap < 3) this.warnings.push(`text '${a.s}' overlaps '${b.s}'`);
        else if (side && gap < CROWD_GAP && a.group !== b.group) {
          this.warnings.push(`text '${a.s}' and '${b.s}' are stacked ${gap.toFixed(0)}px apart; keep >= ${CROWD_GAP}`);
        }
      }
    });
    const nearMiss = (values: number[], what: string) => {
      const u = [...new Set(values.map((v) => Math.round(v * 10) / 10))].sort((a, b) => a - b);
      for (let i = 1; i < u.length; i++) {
        if (u[i] - u[i - 1] < ALIGN_TOL) {
          this.warnings.push(`${what} ${n(u[i - 1])} and ${n(u[i])} almost line up; use one value`);
        }
      }
    };
    nearMiss(this.boxes.filter((b) => b.anchor === "start").map((b) => b.x), "left-aligned text at x =");
    nearMiss(this.boxes.filter((b) => b.anchor === "middle").map((b) => b.x), "centered text at x =");
    nearMiss(this.dots.map(([x]) => x), "dot columns at x =");
    nearMiss(this.dots.map(([, y]) => y), "dot rows at y =");
    this.segments.forEach(([p, q], i) => {
      for (const [r, t] of this.segments.slice(i + 1)) {
        // k = 0: two vertical segments (same x), k = 1: two horizontal ones (same y)
        for (const k of [0, 1]) {
          if (p[k] !== q[k] || r[k] !== t[k]) continue;
          const o = 1 - k;
          const overlap =
            Math.min(Math.max(p[o], q[o]), Math.max(r[o], t[o])) - Math.max(Math.min(p[o], q[o]), Math.min(r[o], t[o]));
          const gap = Math.abs(p[k] - r[k]);
          if (gap > 0 && gap < LINE_GAP && overlap > 0) {
            const [a, b] = [p[k], r[k]].sort((u, v) => u - v);
            this.warnings.push(
              `connectors at ${k ? "y" : "x"} = ${n(a)} and ${n(b)} run side by side ${n(gap)}px apart; keep >= ${LINE_GAP}`,
            );
          }
        }
      }
    });
    for (const [p, q] of this.segments) {
      for (const b of this.boxes) {
        if (segHitsRect(p, q, [b.x0 - 2, b.y0 - 2, b.x1 + 2, b.y1 + 2])) {
          this.warnings.push(`a connector crosses the text '${b.s}'`);
        }
      }
    }
  }

  // --- output -------------------------------------------------------------
  svg() {
    const style = `#${this.id} text{font-family:var(--font-body)}#${this.id} .mono{font-family:var(--font-mono)}`;
    const head =
      `<svg id="${this.id}" viewBox="0 0 ${this.w} ${this.h}" role="img" ` +
      `aria-label="${esc(this.label).replaceAll('"', "&quot;")}"><style>${style}</style>`;
    return [head, ...this.back, ...this.lines, ...this.front, "</svg>"].join("\n");
  }

  /** The <figure> block to paste into the post. It must stay free of blank
   *  lines, or Markdown ends the HTML block early. */
  html() {
    let head = `<div class="fig-title">${esc(this.title)}</div>`;
    if (this.subtitle) head += `<div class="fig-sub">${esc(this.subtitle)}</div>`;
    const out = ["<figure>", `<div class="fig-head">${head}</div>`, `<div class="fig-draw">${this.svg()}</div>`];
    if (this.caption) out.push(`<figcaption><span>${esc(this.caption)}</span></figcaption>`);
    out.push("</figure>");
    return out.join("\n");
  }

  /** Writes <outBase>.figure.html (the block for the post) and
   *  <outBase>-light.png / -dark.png previews, then replaces the figure with the
   *  same SVG id in the post whose filename starts with the same date as
   *  `outBase`'s name. `outBase` is relative to the repo. */
  save(outBase: string) {
    const out = resolve(REPO, outBase);
    mkdirSync(dirname(out), { recursive: true });
    this.check();
    const block = this.html();
    writeFileSync(`${out}.figure.html`, block + "\n");
    for (const w of this.warnings) console.log("WARNING:", w);
    // a warning fails the run, so `bun run figures` stops on it
    if (this.warnings.length) process.exitCode = 1;
    const previews = renderPreviews(block, out, this.h);
    console.log(`wrote ${outBase}.figure.html` + (previews ? " and -light.png / -dark.png previews" : ""));
    // a figure that failed its checks stays out of the post
    if (this.warnings.length) console.log("post not updated: fix the warnings above first");
    else syncPost(basename(out).slice(0, 10), this.id, block);
    return block;
  }
}

/** Replaces the <figure> block holding `<svg id="id"` in the post dated `date`,
 *  so a post never keeps a stale copy. A new figure has no block yet: paste the
 *  first one by hand, after the paragraph it supports. */
function syncPost(date: string, id: string, block: string) {
  const hits = readdirSync(POSTS)
    .filter((f) => f.startsWith(date) && f.endsWith(".md"))
    .flatMap((f) => {
      const src = readFileSync(resolve(POSTS, f), "utf8");
      const found = [...src.matchAll(/<figure>[\s\S]*?<\/figure>/g)].filter((m) => m[0].includes(`<svg id="${id}"`));
      return found.map((m) => ({ f, src, old: m[0] }));
    });
  if (hits.length === 0) {
    console.log(`no figure with id "${id}" in a ${date} post yet; paste the block after the paragraph it supports`);
    return;
  }
  if (hits.length > 1) {
    console.log(`WARNING: ${hits.length} figures with id "${id}" in ${date} posts; give each figure its own idPrefix`);
    process.exitCode = 1;
    return;
  }
  const { f, src, old } = hits[0];
  if (old === block) return;
  writeFileSync(resolve(POSTS, f), src.replace(old, () => block));
  console.log(`updated the figure in src/content/blog/${f}`);
}

/** Liang-Barsky clip test: does segment p-q pass through rectangle r? */
function segHitsRect([x1, y1]: Point, [x2, y2]: Point, [rx0, ry0, rx1, ry1]: number[]) {
  const [dx, dy] = [x2 - x1, y2 - y1];
  let [t0, t1] = [0, 1];
  for (const [pk, qk] of [
    [-dx, x1 - rx0],
    [dx, rx1 - x1],
    [-dy, y1 - ry0],
    [dy, ry1 - y1],
  ]) {
    if (pk === 0) {
      if (qk < 0) return false;
    } else {
      const t = qk / pk;
      if (pk < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  return t0 < t1;
}

/** Screenshots the figure inside a page that loads the site's own CSS and
 *  fonts, once per color scheme, with headless Chrome. The raw stylesheet skips
 *  Tailwind's base layer, so the page sets border-box sizing itself. */
function renderPreviews(block: string, out: string, height: number) {
  if (!existsSync(CHROME)) {
    console.log("WARNING: Google Chrome not found; skipped previews");
    return false;
  }
  const fonts = readFileSync(FONTS_CSS, "utf8").replaceAll("url(/fonts/", `url(file://${REPO}/public/fonts/`);
  for (const theme of ["light", "dark"]) {
    const page = resolve(dirname(out), `${basename(out)}-${theme}.preview.html`);
    writeFileSync(
      page,
      `<!doctype html><html class="${theme}"><head><meta charset="utf-8">` +
        `<link rel="stylesheet" href="file://${CSS}"><style>${fonts}` +
        "*,::before,::after{box-sizing:border-box} body{margin:0;padding:8px 0} main{max-width:688px;margin:0 auto;padding:0 24px}</style>" +
        `</head><body><main class="prose">${block}</main></body></html>`,
    );
    const png = resolve(dirname(out), `${basename(out)}-${theme}.png`);
    const run = Bun.spawnSync([
      CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
      "--force-device-scale-factor=1", `--window-size=1000,${Math.trunc(height) + 260}`, `--screenshot=${png}`,
      `file://${page}`,
    ]);
    unlinkSync(page);
    if (run.exitCode !== 0) throw new Error(`Chrome failed: ${run.stderr.toString()}`);
  }
  return true;
}
