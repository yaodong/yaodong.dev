# Figure for the parallel-work story in 2026-02-21-the-multi-agent-setup-i-actually-use.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram

W, H = 854, 430
bw, bh, gap, x0 = 134, 76, 24, 44
xs = [x0 + i * (bw + gap) for i in range(5)]
ay, by, my = 70, 208, 346

d = Diagram(W, H, id_prefix="pw", label=(
    "Two channels moving at the same time: in #project-hobby, Helm hands off to Builder, fixes the "
    "database when Builder gets stuck, then reviews and merges; in #write-room, Explorer pushes back, "
    "pulls in related pieces, and publishes a short piece, while I spend the whole time in #write-room."))

d.lane_label(x0, ay - 18, "#project-hobby")
for x, (t, s) in zip(xs, [("helm", ["handoff doc", "channel, repo"]),
                          ("builder", "starts building"),
                          ("helm", "postgres container"),
                          ("builder", "first version"),
                          ("helm", ["finds a bug", "merges the PR"])]):
    d.box(x, ay, bw, bh, t, s)

d.lane_label(x0, by - 18, "#write-room")
for x, (t, s) in zip(xs, [("explorer", "joins"),
                          ("explorer", ["pushes back", "new angle"]),
                          ("explorer", "two related pieces"),
                          ("explorer", "shapes a piece"),
                          ("explorer", ["publishes to", "typefully"])]):
    d.box(x, by, bw, bh, t, s, bullets=False)

for y in (ay, by):
    for x in xs[:-1]:
        d.arrow(x + bw + 3, y + bh / 2, x + bw + gap - 3, y + bh / 2)

d.lane_label(x0, my - 18, "me")
d.box(x0, my, W - 2 * x0, 44, "thinking out loud with explorer in #write-room", kind="human")

d.note(W / 2, 416, "same stretch of time, left to right")
d.save("scripts/figures/out/2026-02-21-parallel-work")
