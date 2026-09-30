# Figure for "How It Works" in 2025-12-20-building-reliable-llm-streaming-in-rails.md.
# Same column grid as the option figures. Numbers follow the six steps of the flow;
# the dashed loop is a reconnect with Last-Event-ID, which the job never sees.
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram

W, H = 840, 330
bw, bh, gap, x0 = 120, 76, 52, 16
xs = [x0 + i * (bw + gap) for i in range(5)]
cx = [x + bw / 2 for x in xs]
ty, by = 20, 176
M = "var(--color-text-muted)"

d = Diagram(W, H, id_prefix="fl", label=(
    "How the Redis Streams and SSE flow works: the browser posts a message, the completions controller "
    "enqueues a job and returns a stream key, the browser opens an SSE connection, the job writes LLM chunks "
    "to a Redis stream, and the streams controller reads them and sends them to the browser. "
    "A reconnect sends Last-Event-ID and resumes without the job noticing."))

# setup: the request that starts everything
cw = 2 * bw + gap
d.box(xs[1], ty, cw, bh, "completions controller", ["saves the message", "returns at once"], kind="system", bullets=False)
d.box(xs[4], ty, bw, by + bh - ty, "browser", ["EventSource"], kind="system")
d.arrow(xs[1] + cw + 3, ty + bh / 2, xs[4] - 3, ty + bh / 2, both=True, label="1 POST, 3 stream key")
d.arrow(cx[1], ty + bh + 4, cx[1], by - 4, label="2 enqueue with key")

# the stream: writer on the left, reader on the right, Redis in between
for i, (t, lines) in enumerate([("LLM API", []),
                                ("ConverseJob", ["calls the LLM"]),
                                ("Redis stream", ["one per key"]),
                                ("streams", ["controller", "reads from Redis"])]):
    d.box(xs[i], by, bw, bh, t, lines, kind="system", bullets=False)
mid = by + bh / 2
for i, text in enumerate(["5 chunks", "5 XADD", "6 XREAD", "4 GET, 6 SSE"]):
    d.arrow(xs[i] + bw + 3, mid, xs[i + 1] - 3, mid, both=(i == 3))
    d.text(xs[i + 1] - gap / 2, by + bh + 18, text, 11.5, M)

# reconnect: browser comes back to the streams controller only
ly = by + bh + 52
d.path(f"M{cx[4] + 30},{by + bh + 4} V{ly} H{cx[3] - 20} V{by + bh + 4}")
d.note(xs[4] + bw, ly + 22, "reconnect with Last-Event-ID; the job never notices", anchor="end")
d.save("scripts/figures/out/2025-12-20-streaming-flow")
