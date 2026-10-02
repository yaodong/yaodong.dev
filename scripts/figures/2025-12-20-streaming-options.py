# Figures for "The Options" in 2025-12-20-building-reliable-llm-streaming-in-rails.md.
# Four figures on one grid: LLM API on the left, browser on the right, so the
# pieces each option adds line up across the section.
import sys
sys.path.insert(0, ".claude/skills/blog-illustration/scripts")
from diagram import Diagram, FONT_LABEL

W, H = 840, 128
bw, bh, gap, x0, y = 132, 76, 40, 10, 20
xs = [x0 + i * (bw + gap) for i in range(5)]
mid = y + bh / 2

OPTIONS = {
    "direct-sse": ("ds", "Direct SSE: a controller calls the LLM API and streams chunks to the browser over SSE, "
                         "holding a Puma thread for the whole call.", {
        0: ("LLM API", []),
        3: ("controller", ["calls the LLM", "in a Puma thread"]),
        4: ("browser", []),
    }, ["stream", "SSE"]),
    "actioncable": ("ac", "ActionCable with a background job: the job calls the LLM API and broadcasts chunks "
                          "through ActionCable to the browser over WebSocket, with no replay.", {
        0: ("LLM API", []),
        1: ("job", ["retry handling"]),
        3: ("ActionCable", ["evented I/O", "fire-and-forget"]),
        4: ("browser", ["no replay"]),
    }, ["stream", "broadcast", "WebSocket"]),
    "redis-sse": ("rs", "Redis Streams with SSE: the job writes chunks to a Redis stream with XADD, and a separate "
                        "SSE controller reads them with XREAD and delivers them to the browser.", {
        0: ("LLM API", []),
        1: ("job", ["retry handling"]),
        2: ("Redis stream", ["keeps chunks"]),
        3: ("controller", ["waits on XREAD", "in a Puma thread"]),
        4: ("browser", ["resumes from", "Last-Event-ID"]),
    }, ["stream", "XADD", "XREAD", "SSE"]),
    "pusher": ("pu", "An external service: the job posts chunks to Pusher over HTTP, and Pusher delivers them "
                     "to the browser over WebSocket with reconnection and replay.", {
        0: ("LLM API", []),
        1: ("job", ["retry handling"]),
        3: ("Pusher", ["external service", "replays messages"]),
        4: ("browser", []),
    }, ["stream", "HTTP POST", "WebSocket"]),
}

for name, (prefix, label, boxes, conn) in OPTIONS.items():
    d = Diagram(W, H, id_prefix=prefix, label=label)
    for i, (t, lines) in boxes.items():
        d.box(xs[i], y, bw, bh, t, lines, kind="system", bullets=False)
    cols = sorted(boxes)
    for (a, b), text in zip(zip(cols, cols[1:]), conn):
        x1, x2 = xs[a] + bw + 3, xs[b] - 3
        d.arrow(x1, mid, x2, mid)
        # labels sit under the row so long words don't collide with the boxes
        d.text((xs[b] - gap / 2) if b - a == 1 else (x1 + x2) / 2, y + bh + 18, text, FONT_LABEL, "var(--color-text-muted)")
    d.save(f"scripts/figures/out/2025-12-20-streaming-{name}")
