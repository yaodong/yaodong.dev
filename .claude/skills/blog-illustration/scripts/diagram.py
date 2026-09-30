"""Helpers for yaodong.dev blog diagrams.

Diagrams are inline SVG that take every color and font from the site's CSS
variables (src/styles/application.css), so one figure follows light and dark
mode. `Diagram.save()` writes the inline SVG plus light/dark PNG previews
(rendered with rsvg-convert) so you can check the result before publishing.

Usage (see scripts/figures/*.py for real examples):

    import sys; sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
    from diagram import Diagram

    d = Diagram(800, 390, label="What the figure shows, in one sentence.")
    d.lane_label(44, 52, "AGENTS")
    d.box(44, 70, 166, 58, "plan", "scenarios, data, success", kind="system")
    d.box(44, 236, 166, 58, "review the plan", "before any code", kind="human")
    d.arrow(127, 132, 127, 232, both=True, label="plan file")
    d.save("scripts/figures/out/my-figure")
"""

import re
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape

REPO = Path(__file__).resolve().parents[4]
CSS = REPO / "src/styles/application.css"

# Style constants. Keep these stable so every figure looks like the same family.
FONT_TITLE = 15       # box title
FONT_TITLE_HUMAN = 13.5
FONT_SUB = 10.5       # box subtitle / bullet lines
FONT_LABEL = 11.5     # labels on connectors
FONT_LANE = 11        # uppercase lane labels
FONT_NOTE = 12        # loop / footnote text
RADIUS = 8
STROKE = 1.4
DASH = "4 5"
MONO_CHAR = 0.6       # JetBrains Mono advance width per px of font size

T = "var(--color-text)"
B = "var(--color-text-body)"
M = "var(--color-text-muted)"
SUB = "var(--color-bg-subtle)"
BG = "var(--color-bg)"


def text_width(s, size):
    return len(s) * size * MONO_CHAR


class Diagram:
    def __init__(self, width, height, label, id_prefix="fig"):
        self.w, self.h, self.label, self.id = width, height, label, id_prefix
        self.parts = []
        self.warnings = []

    # --- primitives -------------------------------------------------------
    def text(self, x, y, s, size=FONT_SUB, color=B, anchor="middle", weight=400):
        self.parts.append(
            f'<text x="{x:g}" y="{y:g}" text-anchor="{anchor}" '
            f'style="fill:{color};font-size:{size}px;font-weight:{weight}">{escape(s)}</text>'
        )

    def lane_label(self, x, y, s):
        """Small uppercase label naming a row, e.g. AGENTS / ME / SYSTEM."""
        self.text(x, y, s.upper(), FONT_LANE, M, "start", 700)

    def box(self, x, y, w, h, title, lines=(), kind="system", bullets=None, result=None):
        """kind="system": filled subtle box (agents, services, automation).
        kind="human": outlined box on the page background (what a person does).
        `lines` is a string or a list; by default a list renders as bullet lines
        (bullets=False stacks them centered instead).
        `result` adds one emphasized line at the bottom, e.g. an expected outcome."""
        if isinstance(lines, str):
            lines = [lines] if lines else []
        if bullets is None:
            bullets = len(lines) > 1
        if kind == "human":
            self.parts.append(
                f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{RADIUS}" '
                f'style="fill:{BG};stroke:{T};stroke-width:{STROKE}"/>'
            )
            tsize = FONT_TITLE_HUMAN
        else:
            self.parts.append(
                f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{RADIUS}" style="fill:{SUB}"/>'
            )
            tsize = FONT_TITLE
        cx = x + w / 2
        self.text(cx, y + 24, title, tsize, T, weight=700)
        self._check(title, tsize, w)
        for i, line in enumerate(lines):
            if bullets:  # bullets read better left-aligned under a centered title
                s = f"• {line}"
                self.text(x + 14, y + 45 + i * 16, s, FONT_SUB, M, "start")
                self._check(s, FONT_SUB, w - 10)  # 14px left inset, ~8px right margin
            else:
                s = line
                self.text(cx, y + 43 + i * 16, s, FONT_SUB, M)
                self._check(s, FONT_SUB, w)
        n = len(lines)
        if result:
            ry = y + 43 + n * 16 + 4
            self.text(cx, ry, result, FONT_SUB + 0.5, T, weight=700)
            self._check(result, FONT_SUB + 0.5, w)
            n += 1
        need = 45 + (n - 1) * 16 + 12 + (4 if result else 0) if n else 38
        if need > h:
            self.warnings.append(f"box '{title}' needs height >= {need}, got {h}")

    def arrow(self, x1, y1, x2, y2, dashed=False, both=False, label=None):
        """Muted connector. dashed=True for optional or occasional flows."""
        self._marker()
        dash = f";stroke-dasharray:{DASH}" if dashed else ""
        start = f' marker-start="url(#{self.id}-a)"' if both else ""
        self.parts.append(
            f'<line x1="{x1:g}" y1="{y1:g}" x2="{x2:g}" y2="{y2:g}" '
            f'style="stroke:{M};stroke-width:{STROKE}{dash}"{start} marker-end="url(#{self.id}-a)"/>'
        )
        if label:
            if x1 == x2:  # vertical: label to the right, centered
                self.text(x1 + 8, (y1 + y2) / 2 + 4, label, FONT_LABEL, M, "start")
            else:
                self.text((x1 + x2) / 2, min(y1, y2) - 8, label, FONT_LABEL, M)

    def path(self, d, dashed=True, arrow=True):
        """Free-form connector, e.g. a feedback loop routed around the boxes."""
        self._marker()
        dash = f";stroke-dasharray:{DASH}" if dashed else ""
        end = f' marker-end="url(#{self.id}-a)"' if arrow else ""
        self.parts.append(f'<path d="{d}" style="fill:none;stroke:{M};stroke-width:{STROKE}{dash}"{end}/>')

    def note(self, x, y, s, anchor="middle"):
        self.text(x, y, s, FONT_NOTE, M, anchor)

    # --- output -----------------------------------------------------------
    def _marker(self):
        if getattr(self, "_has_marker", False):
            return
        self._has_marker = True
        self.parts.insert(0,
            f'<defs><marker id="{self.id}-a" viewBox="0 0 10 10" refX="9" refY="5" '
            f'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M1,1 L9,5 L1,9" style="fill:none;stroke:{M};stroke-width:1.6;'
            f'stroke-linecap:round;stroke-linejoin:round"/></marker></defs>')

    def _check(self, s, size, box_w):
        if text_width(s, size) > box_w - 12:
            self.warnings.append(f"text '{s}' ({text_width(s, size):.0f}px) overflows box width {box_w}")

    def svg(self):
        head = (f'<svg viewBox="0 0 {self.w} {self.h}" role="img" aria-label="{escape(self.label)}" '
                f'style="width:100%;height:auto;font-family:var(--font-mono)">')
        return "\n".join([head, *self.parts, "</svg>"])

    def save(self, out_base):
        """Writes <out_base>.inline.svg and <out_base>-light.png / -dark.png previews."""
        out = Path(out_base)
        out.parent.mkdir(parents=True, exist_ok=True)
        svg = self.svg()
        out.with_suffix(".inline.svg").write_text(svg)
        for theme, tokens in read_tokens().items():
            s = svg
            for k, v in tokens.items():
                s = s.replace(f"var({k})", v)
            s = s.replace("<svg ", f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w*2}" height="{self.h*2}" ', 1)
            s = s.replace("style=\"width:100%;height:auto;", "style=\"", 1)
            tmp = out.parent / f"{out.name}-{theme}.svg"
            tmp.write_text(s)
            subprocess.run(["rsvg-convert", "-b", tokens["--color-bg"], str(tmp), "-o",
                            str(out.parent / f"{out.name}-{theme}.png")], check=True)
            tmp.unlink()
        for w in self.warnings:
            print("WARNING:", w)
        print(f"wrote {out}.inline.svg and {out.name}-light.png / -dark.png")
        return svg


def read_tokens():
    """Pull light and dark color tokens from the site CSS so previews match the site."""
    css = CSS.read_text()
    blocks = re.findall(r"\{([^{}]*--color-bg:[^{}]*)\}", css)
    themes = {}
    for name, block in zip(["light", "dark"], blocks[:2]):
        tokens = dict(re.findall(r"(--[\w-]+):\s*([^;]+);", block))
        tokens["--font-mono"] = "JetBrains Mono"
        themes[name] = tokens
    return themes
