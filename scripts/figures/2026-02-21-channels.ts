// Figure for the channels section in 2026-02-21-the-multi-agent-setup-i-actually-use.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 234];
const xs = [30, 310, 590];
const [cy, ty] = [46, 180];

const d = new Figure({
  width: W, height: H, idPrefix: "ch",
  title: "Channels for domains, threads for topics",
  subtitle: "Each channel's topic is read as its prompt",
  caption:
    "A thread is its own session and inherits its channel's settings; " +
    "a brainstorming thread can grow into its own project channel.",
  label:
    "How the Discord server is organized: brainstorming, project, and automated channels, each with " +
    "a topic that works as its prompt. A thread is its own session and inherits the channel's settings, " +
    "and a brainstorming thread can grow into its own project channel.",
});

d.laneLabel(xs[0] + 14, cy - 24, "channels");
const [brain, proj] = (
  [
    ["#brainstorming", ["unstructured ideas", "a thread per topic"]],
    ["#project-hobby", ["one per project", "Builder follows"]],
    ["#digest, #heartbeat", "recurring tasks"],
  ] as [string, string | string[]][]
).map(([t, s], i) => d.node(xs[i], cy, t, s));

d.laneLabel(xs[0] + 14, ty - 24, "threads");
const idea = d.node(xs[0], ty, "Project idea", ["own session", "inherits settings"], { focal: true });
// the label sits in the free span above the THREADS lane label
d.arrow([[xs[0], brain.bottom + 12], [xs[0], ty - 12]], {
  label: "go deep",
  labelAt: [xs[0] + 14, (brain.bottom + 12 + ty - 34) / 2 + 4.5, "start"],
});
d.arrow([[idea.end + 10, ty], [xs[1], ty], [xs[1], proj.bottom + 12]], { label: "grows into a project" });
d.save("scripts/figures/out/2026-02-21-channels");
