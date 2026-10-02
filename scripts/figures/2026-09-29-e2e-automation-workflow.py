# Figure for "How I automated my E2E testing" in 2026-09-29-rethinking-e2e-testing-with-agents.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram, FONT_LABEL

W, H = 880, 552
bw, bh, gap, x0 = 188, 94, 24, 36
xs = [x0 + i * (bw + gap) for i in range(4)]
cx = [x + bw / 2 for x in xs]
ay, ry, my = 70, 228, 378
rh = 60

d = Diagram(W, H, id_prefix="wf", label=(
    "How my automated E2E testing works: agents write a plan, implement the tests, and run them; "
    "a subagent reviews the plan and the tests, and agents on other LLMs cross-check the run log; "
    "I review the plan, help when a step is stuck, and read the final log, and my corrections go "
    "back into the skills."))
d.lane_label(x0, ay - 18, "agents")
d.lane_label(x0, ry - 18, "review")
d.lane_label(x0, my - 18, "me")

for x, (t, s) in zip(xs, [("plan", ["scenario, data state", "what counts as success"]),
                          ("implement", ["test cases", "reused on each server"]),
                          ("run", ["reviewer splits steps", "tester runs them"])]):
    d.box(x, ay, bw, bh, t, s, kind="system")
for i in range(2):
    d.arrow(xs[i] + bw + 3, ay + bh / 2, xs[i + 1] - 3, ay + bh / 2)

d.box(xs[0], ry, bw, rh, "subagent", "reviews the plan", kind="system")
d.box(xs[1], ry, bw, rh, "subagent", "reviews the tests", kind="system")
d.box(xs[3], ry, bw, rh, "cross-check", "other LLMs", kind="system")
d.arrow(cx[0], ay + bh + 4, cx[0], ry - 4)
d.arrow(cx[1], ay + bh + 4, cx[1], ry - 4)
# run log leaves the run box to the right, then drops into the cross-check
d.path(f"M{xs[2] + bw + 3},{ay + bh / 2} H{cx[3]} V{ry - 4}", dashed=False)
d.text((xs[2] + bw + cx[3]) / 2, ay + bh / 2 - 8, "run log", FONT_LABEL, "var(--color-text-muted)")

for i, (t, s) in {0: ("review the plan", ["before any code", "happy + error paths"]),
                  2: ("help when stuck", ["agent asks", "instead of workarounds"]),
                  3: ("read the final log", ["requests, responses", "a colleague explaining"])}.items():
    d.box(xs[i], my, bw, bh, t, s, kind="human")
d.arrow(cx[0], ry + rh + 4, cx[0], my - 4, both=True, label="plan file")
d.arrow(cx[2], ay + bh + 4, cx[2], my - 4, dashed=True, both=True, label="asks")
d.arrow(cx[3], ry + rh + 4, cx[3], my - 4, label="flagged log")

fy = my + bh + 44
d.path(f"M{cx[3]},{my + bh + 4} V{fy} H16 V{ay + bh / 2} H{xs[0] - 3}")
d.note((cx[0] + cx[3]) / 2, fy + 20, "corrections go back into the skills and their references")
d.save("scripts/figures/out/2026-09-29-e2e-automation-workflow")
