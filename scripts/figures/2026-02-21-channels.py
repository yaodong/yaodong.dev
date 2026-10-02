# Figure for the channels section in 2026-02-21-the-multi-agent-setup-i-actually-use.md
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram, FONT_LABEL

W, H = 800, 364
bw, bh, gap, x0 = 200, 76, 56, 44
xs = [x0 + i * (bw + gap) for i in range(3)]
cx = [x + bw / 2 for x in xs]
cy, ty = 70, 232

d = Diagram(W, H, id_prefix="ch", label=(
    "How the Discord server is organized: brainstorming, project, and automated channels, each with "
    "a topic that works as its prompt. A thread is its own session and inherits the channel's settings, "
    "and a brainstorming thread can grow into its own project channel."))

d.lane_label(x0, cy - 18, "channels")
for x, (t, s) in zip(xs, [("#brainstorming", ["unstructured ideas", "a thread per topic"]),
                          ("#project-hobby", ["one per project", "builder follows"]),
                          ("#digest, #heartbeat", "recurring tasks")]):
    d.box(x, cy, bw, bh, t, s)

d.lane_label(x0, ty - 18, "threads")
d.box(xs[0], ty, bw, bh, "project idea", ["own session", "inherits settings"])
d.arrow(cx[0], cy + bh + 4, cx[0], ty - 4, label="go deep")
d.path(f"M{xs[0] + bw + 4},{ty + bh / 2} C{cx[1]},{ty + bh / 2} {cx[1]},{ty - 40} {cx[1]},{cy + bh + 4}")
d.text(cx[1] + 10, ty - 36, "grows into a project", FONT_LABEL, "var(--color-text-muted)", "start")

d.note(W / 2, 346, "each channel's topic is read as its prompt")
d.save("scripts/figures/out/2026-02-21-channels")
