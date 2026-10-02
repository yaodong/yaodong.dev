# Figure for "How the skills keep improving" in 2026-09-29-rethinking-e2e-testing-with-agents.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram

W, H = 840, 380
bw = 180
xd, xa, xs = 44, 334, 624          # codebase docs, agents / me, skill
ay, ah = 60, 76                    # agents row
my, mh = 220, 110                  # me
ry, rh = 220, 60                   # reference documents
iy, ih = 292, 44                   # instructions
M = "var(--color-text-muted)"

d = Diagram(W, H, id_prefix="sk", label=(
    "How the documents improve as the agents and I work together: agents read the codebase "
    "documentation and fill in what's missing; when they get stuck or get something wrong, I step "
    "in, and the correction goes into the skill, as reference documents for missing context or "
    "multi-step fixes, or as instructions for short rules on how to test; the next ticket reads them."))

d.box(xd, ay, bw, ah, "codebase docs", "organized by feature", kind="system")
d.box(xa, ay, bw, ah, "agents", "working on a ticket", kind="system")
d.arrow(xd + bw + 3, ay + ah / 2, xa - 3, ay + ah / 2, both=True, label="read, update")

d.box(xa, my, bw, mh, "me, stepping in", ["knowledge they lack", "judgment corrections"], kind="human")
d.arrow(xa + bw / 2, ay + ah + 4, xa + bw / 2, my - 4, dashed=True, both=True, label="stuck or wrong")

d.lane_label(xs, ry - 18, "skill")
d.box(xs, ry, bw, rh, "reference docs", "read only when needed", kind="system")
d.box(xs, iy, bw, ih, "instructions", kind="system")
d.arrow(xa + bw + 3, ry + rh / 2, xs - 3, ry + rh / 2, label="context, steps")
d.arrow(xa + bw + 3, iy + ih / 2, xs - 3, iy + ih / 2, label="short rule")

# the skill feeds the next ticket
cx = xs + bw / 2
d.path(f"M{cx},{ry - 4} V{ay + ah / 2} H{xa + bw + 3}")
d.text((xa + bw + cx) / 2 + 20, ay + ah / 2 - 8, "next ticket reads", 11.5, M)
d.save("scripts/figures/out/2026-09-29-e2e-skill-updates")
