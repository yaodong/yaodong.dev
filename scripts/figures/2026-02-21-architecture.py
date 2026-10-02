# Figure for the architecture section in 2026-02-21-the-multi-agent-setup-i-actually-use.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram, FONT_LABEL

W, H = 800, 424
bw, bh, gap, x0 = 200, 76, 56, 44
xs = [x0 + i * (bw + gap) for i in range(3)]
cx = [x + bw / 2 for x in xs]
dy, ay, ry = 36, 170, 296

d = Diagram(W, H, id_prefix="ar", label=(
    "Three agents behind one Discord server: Helm runs on the host and sees every message; Builder "
    "and Explorer each run in their own Docker container and respond only when mentioned. Agents can "
    "call each other directly, and Helm can fix Builder's container."))

d.box(cx[1] - 90, dy, 180, 44, "discord")
for c in (cx[0], cx[2]):  # curve over, then drop straight down so the labels sit clear of it
    d.path(f"M{cx[1]},{dy + 48} C{cx[1]},{dy + 82} {c},{dy + 68} {c},{dy + 96} L{c},{ay - 4}", dashed=False)
d.arrow(cx[1], dy + 48, cx[1], ay - 4)
d.text(cx[0] + 8, ay - 14, "@mention", FONT_LABEL, "var(--color-text-muted)", "start")
d.text(cx[1] + 8, ay - 14, "every message", FONT_LABEL, "var(--color-text-muted)", "start")
d.text(cx[2] - 8, ay - 14, "@mention", FONT_LABEL, "var(--color-text-muted)", "end")

for x, (t, s) in zip(xs, [("builder", ["coding agent", "requireMention: true"]),
                          ("helm", ["orchestrator", "requireMention: false"]),
                          ("explorer", ["goes deep on ideas", "requireMention: true"])]):
    d.box(x, ay, bw, bh, t, s)
for x in xs[:-1]:
    d.arrow(x + bw + 3, ay + bh / 2, x + bw + gap - 3, ay + bh / 2, dashed=True, both=True)

for x, c, (t, s) in zip(xs, cx, [("docker container", ["own linux and tools", "own openclaw"]),
                                 ("host machine", "own openclaw"),
                                 ("docker container", ["own linux and tools", "own openclaw"])]):
    d.arrow(c, ay + bh + 4, c, ry - 4)
    d.box(x, ry, bw, bh, t, s)
d.arrow(xs[1] - 3, ry + bh / 2, xs[0] + bw + 3, ry + bh / 2, dashed=True, label="fixes")

d.note(W / 2, 406, "dashed: agents reaching each other directly, outside discord")
d.save("scripts/figures/out/2026-02-21-architecture")
