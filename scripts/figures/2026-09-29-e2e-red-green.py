# Figure for the red/green paragraph in "A few things that make the results easier to trust"
# (2026-09-29-rethinking-e2e-testing-with-agents.md). Shows the order of runs, not just where they happen.
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram

W, H = 920, 236
bw, bh, gap, x0 = 166, 80, 56, 44
xs = [x0 + i * (bw + gap) for i in range(4)]
cx = [x + bw / 2 for x in xs]
tw, th, ty = 2 * 166 + 56, 76, 24
tx = x0
ry = 140

d = Diagram(W, H, id_prefix="rg", label=(
    "The order of runs for one bug-fix test case: the case states how it should fail without the fix "
    "and what should happen with it; it fails as expected on the integration branch before the fix, "
    "passes on the fix branch, passes again on the integration branch after merging, and passes on "
    "the release candidate."))
d.box(tx, ty, tw, th, "the test case", ["how it fails without the fix", "what happens with the fix"], bullets=False)
d.arrow(cx[0], ty + th + 4, cx[0], ry - 4)
steps = [("integration", "before the fix", "fails as expected"),
         ("fix branch", "with the fix", "passes"),
         ("integration", "after merging", "passes"),
         ("release candidate", "everything merged", "passes")]
for i, (t, where, res) in enumerate(steps):
    d.box(xs[i], ry, bw, bh, t, [where], bullets=False, result=res)
for i, lab in enumerate(["then", "merge", "release"]):
    d.arrow(xs[i] + bw + 3, ry + bh / 2, xs[i + 1] - 3, ry + bh / 2, label=lab)
d.save("scripts/figures/out/2026-09-29-e2e-red-green")
