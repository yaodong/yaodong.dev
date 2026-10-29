// Figures for "The Options" in 2025-12-20-building-reliable-llm-streaming-in-rails.md.
// Four figures on one grid: LLM API on the left, browser on the right, so the
// pieces each option adds line up across the section. The accent dot marks the
// piece that sets each option apart.
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 76];
const xs = [0, 1, 2, 3, 4].map((i) => 30 + i * 170);
const y = 24;

type Option = {
  idPrefix: string;
  focal: number;
  title: string;
  subtitle: string;
  caption: string;
  label: string;
  nodes: Record<number, [string, string[]]>;
  links: string[];
};

const OPTIONS: Record<string, Option> = {
  "direct-sse": {
    idPrefix: "ds", focal: 3,
    title: "The controller holds the call",
    subtitle: "Direct SSE",
    caption: "No extra infrastructure, but each response holds a Puma thread for the whole 30-120 second call.",
    label:
      "Direct SSE: a controller calls the LLM API and streams chunks to the browser over SSE, " +
      "holding a Puma thread for the whole call.",
    nodes: {
      0: ["LLM API", []],
      3: ["Controller", ["calls the LLM", "in a Puma thread"]],
      4: ["Browser", []],
    },
    links: ["stream", "SSE"],
  },
  actioncable: {
    idPrefix: "ac", focal: 3,
    title: "Delivery without replay",
    subtitle: "ActionCable with a background job",
    caption: "The LLM call moves into a job with retries, but a chunk broadcast while the browser is away is lost.",
    label:
      "ActionCable with a background job: the job calls the LLM API and broadcasts chunks " +
      "through ActionCable to the browser over WebSocket, with no replay.",
    nodes: {
      0: ["LLM API", []],
      1: ["Job", ["retry handling"]],
      3: ["ActionCable", ["evented I/O", "fire-and-forget"]],
      4: ["Browser", ["no replay"]],
    },
    links: ["stream", "broadcast", "WebSocket"],
  },
  "redis-sse": {
    idPrefix: "rs", focal: 2,
    title: "A stream between the job and the browser",
    subtitle: "Redis Streams with SSE",
    caption: "Chunks stay in Redis, so a browser that reconnects resumes from Last-Event-ID.",
    label:
      "Redis Streams with SSE: the job writes chunks to a Redis stream with XADD, and a separate " +
      "SSE controller reads them with XREAD and delivers them to the browser.",
    nodes: {
      0: ["LLM API", []],
      1: ["Job", ["retry handling"]],
      2: ["Redis stream", ["keeps chunks"]],
      3: ["Controller", ["waits on XREAD", "in a Puma thread"]],
      4: ["Browser", ["resumes from", "Last-Event-ID"]],
    },
    links: ["stream", "XADD", "XREAD", "SSE"],
  },
  pusher: {
    idPrefix: "pu", focal: 3,
    title: "Delivery handed to a service",
    subtitle: "An external service such as Pusher or Ably",
    caption: "Puma threads stay free and replay is built in, at the cost of an external dependency.",
    label:
      "An external service: the job posts chunks to Pusher over HTTP, and Pusher delivers them " +
      "to the browser over WebSocket with reconnection and replay.",
    nodes: {
      0: ["LLM API", []],
      1: ["Job", ["retry handling"]],
      3: ["Pusher", ["external service", "replays messages"]],
      4: ["Browser", []],
    },
    links: ["stream", "HTTP POST", "WebSocket"],
  },
};

for (const [name, o] of Object.entries(OPTIONS)) {
  const d = new Figure({
    width: W, height: H, idPrefix: o.idPrefix,
    title: o.title, subtitle: o.subtitle, caption: o.caption, label: o.label,
  });
  const placed = Object.entries(o.nodes).map(([i, [t, lines]]) =>
    d.node(xs[Number(i)], y, t, lines, { focal: Number(i) === o.focal }),
  );
  o.links.forEach((label, i) => d.link(placed[i], placed[i + 1], { label }));
  d.save(`scripts/figures/out/2025-12-20-streaming-${name}`);
}
