# Figure for "Why we used to write so few E2E tests" in 2026-09-29-rethinking-e2e-testing-with-agents.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram

W, H = 880, 326
bw, gap, x0 = 226, 56, 45
xs = [x0 + i * (bw + gap) for i in range(3)]
cx = [x + bw / 2 for x in xs]
ay, ah = 70, 58
my, mh = 206, 96

d = Diagram(W, H, id_prefix="ms", label=(
    "Before automation, every change was tested by hand three times: on the feature branch server, "
    "again on the integration branch after merging, and again on the release-candidate server, "
    "with data set up and results checked at each stage."))
d.lane_label(x0, ay - 18, "environments")
d.lane_label(x0, my - 18, "me")
for x, (t, s) in zip(xs, [("feature branch", "one server per ticket"),
                          ("integration branch", "everyone's changes"),
                          ("release candidate", "read-only database")]):
    d.box(x, ay, bw, ah, t, s, kind="system")
d.arrow(xs[0] + bw + 3, ay + ah / 2, xs[1] - 3, ay + ah / 2, label="merge")
d.arrow(xs[1] + bw + 3, ay + ah / 2, xs[2] - 3, ay + ah / 2, label="release")
for i, (t, lines) in enumerate([
        ("prepare and test", ["work out what to test", "build fixtures, seed data", "run the steps, check"]),
        ("test again", ["set up the data again", "run the steps, check"]),
        ("test again", ["set up state via the API", "run the steps, check"])]):
    d.box(xs[i], my, bw, mh, t, lines, kind="human")
    d.arrow(cx[i], ay + ah + 4, cx[i], my - 4)
d.save("scripts/figures/out/2026-09-29-e2e-manual-stages")
