// Figure for the parallel-work story in 2026-02-21-the-multi-agent-setup-i-actually-use.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 282];
const xs = [0, 1, 2, 3, 4].map((i) => 30 + i * 165);
const [py, wy, my] = [46, 146, 246];

const d = new Figure({
  width: W, height: H, idPrefix: "pw",
  title: "Two channels at once",
  subtitle: "The same stretch of time, left to right",
  caption: "Helm and Builder moved the project forward while I was thinking out loud with Explorer.",
  label:
    "Two channels moving at the same time: in #project-hobby, Helm hands off to Builder, fixes the " +
    "database when Builder gets stuck, then reviews and merges; in #write-room, Explorer pushes back, " +
    "pulls in related pieces, and publishes a short piece, while I think out loud with Explorer in #write-room.",
});

const lane = (y: number, steps: [string, string | string[]][]) => {
  const row = steps.map(([t, s], i) => d.node(xs[i], y, t, s));
  row.slice(1).forEach((b, i) => d.link(row[i], b));
};

d.laneLabel(xs[0] + 14, py - 24, "#project-hobby");
lane(py, [
  ["Helm", ["handoff doc", "channel, repo"]],
  ["Builder", "starts building"],
  ["Helm", "Postgres container"],
  ["Builder", "first version"],
  ["Helm", ["finds a bug", "merges the PR"]],
]);

d.laneLabel(xs[0] + 14, wy - 24, "#write-room");
lane(wy, [
  ["Explorer", "joins"],
  ["Explorer", ["pushes back", "new angle"]],
  ["Explorer", "two related pieces"],
  ["Explorer", "shapes a piece"],
  ["Explorer", ["publishes to", "Typefully"]],
]);

d.laneLabel(xs[0] + 14, my - 24, "me");
const me = d.node(xs[0], my, "Thinking out loud with Explorer", "in #write-room", { kind: "human", focal: true });
d.arrow([[me.end + 10, my], [W - 16, my]], { dashed: true, label: "meanwhile" });
d.save("scripts/figures/out/2026-02-21-parallel-work");
