// Figure for the architecture section in 2026-02-21-the-multi-agent-setup-i-actually-use.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 274];
const [rw, rgap, rx0] = [264, 12, 12];
const rx = [0, 1, 2].map((i) => rx0 + i * (rw + rgap));
const ax = rx.map((x) => x + 24); // agent dots, one per region
const [dy, ry, ay] = [18, 100, 140];
const rh = 162;

const d = new Figure({
  width: W, height: H, idPrefix: "ar",
  title: "Three agents, one Discord server",
  subtitle: "Where each agent runs, and which messages it sees",
  caption:
    "Helm sees every message and Builder answers when mentioned; agents can also reach each other " +
    "directly, and Helm can fix Builder's container.",
  label:
    "Three agents behind one Discord server: Helm runs on the host and sees every message; Builder " +
    "runs in her own Docker container and responds when mentioned; Explorer runs in another container " +
    "and lives in #write-room. Agents can call each other directly, and Helm can fix Builder's container.",
});

["docker container", "host machine", "docker container"].forEach((place, i) => {
  d.region(rx[i], ry, rw, rh);
  d.laneLabel(rx[i] + 38, ry + rh - 14, place);
});

const discord = d.node(ax[1], dy, "Discord", "channels and threads");
for (const x of [ax[0], ax[2]]) {
  // curve over, then drop straight down so the labels sit clear of it
  d.curve(`M${ax[1]},${dy + 12} C${ax[1]},${dy + 46} ${x},${dy + 36} ${x},${ry - 10} L${x},${ay - 12}`, {
    headFrom: [x, ay - 20],
    headTo: [x, ay - 12],
  });
}
d.arrow([[ax[1], discord.bottom + 12], [ax[1], ay - 12]]);
// on the text column, like the node titles below them
d.text(ax[0] + 14, ay - 22, "@mention");
d.text(ax[1] + 14, ay - 22, "every message");
d.text(ax[2] + 14, ay - 22, "#write-room");

const agents = (
  [
    ["Builder", ["coding agent", "requireMention: true"]],
    ["Helm", ["orchestrator", "requireMention: false"]],
    ["Explorer", ["goes deep on ideas"]],
  ] as [string, string[]][]
).map(([t, s], i) => d.node(ax[i], ay, t, s, { focal: i === 1 }));
["own Linux, tools, OpenClaw", "own OpenClaw", "own Linux, tools, OpenClaw"].forEach((s, i) =>
  d.note(ax[i] + 14, ay + 66, s),
);
d.link(agents[0], agents[1], { dashed: true, both: true, label: "direct" });
d.link(agents[1], agents[2], { dashed: true, both: true, label: "direct" });
// Helm can shell into Builder's container and restore her
d.arrow([[ax[1], ay + 12], [ax[1], ry + rh - 30], [rx[0] + rw - 24, ry + rh - 30]], { dashed: true, label: "fixes" });
d.save("scripts/figures/out/2026-02-21-architecture");
