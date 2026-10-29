// Figure for "How It Works" in 2025-12-20-building-reliable-llm-streaming-in-rails.md.
// Same column grid as the option figures. Numbers follow the six steps of the flow;
// the dashed loop is a reconnect with Last-Event-ID, which the job never sees.
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 222];
const xs = [0, 1, 2, 3, 4].map((i) => 30 + i * 170);
const [ty, by] = [20, 120];
const loopY = 182;

const d = new Figure({
  width: W, height: H, idPrefix: "fl",
  title: "The job and the browser never meet",
  subtitle: "Redis Streams with SSE, step by step",
  caption:
    "The job only writes to Redis and the streams controller only reads from it, " +
    "so a reconnect never reaches the job.",
  label:
    "How the Redis Streams and SSE flow works: the browser posts a message, the completions controller " +
    "enqueues a job and returns a stream key, the browser opens an SSE connection, the job writes LLM " +
    "chunks to a Redis stream, and the streams controller reads them and sends them to the browser. " +
    "A reconnect sends Last-Event-ID and resumes without the job noticing.",
});

const comp = d.node(xs[1], ty, "Completions controller", "saves the message, returns at once");
const [llm, job, redis, streams, browser] = (
  [
    ["LLM API", []],
    ["ConverseJob", ["calls the LLM"]],
    ["Redis stream", ["one per key"]],
    ["Streams", ["controller,", "reads from Redis"]],
    ["Browser", ["EventSource"]],
  ] as [string, string[]][]
).map(([t, s], i) => d.node(xs[i], by, t, s, { focal: i === 2 }));

// setup: the request that starts everything
d.arrow([[xs[4], by - 12], [xs[4], ty], [comp.right + 10, ty]], {
  both: true,
  label: "1 POST, 3 stream key",
  labelAt: [(comp.right + xs[4]) / 2, ty - 7],
});
d.arrow([[xs[1], comp.bottom + 12], [xs[1], by - 12]], { label: "2 enqueue with key" });

// the stream: writer on the left, reader on the right, Redis in between
d.link(llm, job, { label: "5 chunks" });
d.link(job, redis, { label: "5 XADD" });
d.link(redis, streams, { label: "6 XREAD" });
d.link(streams, browser, { both: true, label: "4 GET, 6 SSE" });

// reconnect: the browser comes back to the streams controller only
d.arrow([[xs[4], by + 12], [xs[4], loopY], [xs[3], loopY], [xs[3], by + 12]], {
  dashed: true,
  label: "reconnect with Last-Event-ID",
  labelAt: [(xs[3] + xs[4]) / 2, loopY + 18],
});
d.save("scripts/figures/out/2025-12-20-streaming-flow");
