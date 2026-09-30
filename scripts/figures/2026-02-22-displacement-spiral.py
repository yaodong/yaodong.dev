# Figure for "The Displacement Spiral" in 2026-02-22-if-they-are-right.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram

W, H = 800, 290
bw, bh, gap, x0 = 200, 64, 56, 44
xs = [x0 + i * (bw + gap) for i in range(3)]
cx = [x + bw / 2 for x in xs]
ty, by = 40, 196

d = Diagram(W, H, id_prefix="ds", label=(
    "The displacement spiral as a closed loop: AI improves, companies need fewer workers, "
    "white-collar layoffs follow, displaced workers spend less, margin pressure pushes firms "
    "to invest the labor savings in AI, and AI improves again."))
d.box(xs[0], ty, bw, bh, "AI improves", "capabilities grow", kind="system")
d.box(xs[1], ty, bw, bh, "fewer workers needed", "same output", kind="system")
d.box(xs[2], ty, bw, bh, "layoffs", "white-collar roles", kind="system")
d.box(xs[2], by, bw, bh, "spend less", "displaced workers", kind="human")
d.box(xs[1], by, bw, bh, "margin pressure", "consumer demand falls", kind="system")
d.box(xs[0], by, bw, bh, "invest more in AI", "or fall behind rivals", kind="system")
mid_t, mid_b = ty + bh / 2, by + bh / 2
d.arrow(xs[0] + bw + 3, mid_t, xs[1] - 3, mid_t)
d.arrow(xs[1] + bw + 3, mid_t, xs[2] - 3, mid_t)
d.arrow(cx[2], ty + bh + 4, cx[2], by - 4, label="lost income")
d.arrow(xs[2] - 3, mid_b, xs[1] + bw + 3, mid_b)
d.arrow(xs[1] - 3, mid_b, xs[0] + bw + 3, mid_b)
d.arrow(cx[0], by - 4, cx[0], ty + bh + 4, label="labor savings")
d.save("scripts/figures/out/2026-02-22-displacement-spiral")
