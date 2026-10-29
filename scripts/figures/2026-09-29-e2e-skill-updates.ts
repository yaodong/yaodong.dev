// Figure for "How the skills keep improving" in 2026-09-29-rethinking-e2e-testing-with-agents.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 270];
const [xd, xa, xs] = [30, 310, 600];
const [ay, my] = [46, 160];
const [ry, iy] = [160, 222];

const d = new Figure({
  width: W, height: H, idPrefix: "sk",
  title: "Corrections go into the skill",
  subtitle: "The documents that change as the agents and I work",
  caption:
    "The agents keep the codebase docs current; when I step in, the fix goes into the skill, " +
    "so the next ticket starts with it.",
  label:
    "How the documents improve as the agents and I work together: agents read the codebase " +
    "documentation and fill in what's missing; when they get stuck or get something wrong, I step " +
    "in, and the correction goes into the skill, as reference documents for missing context or " +
    "multi-step fixes, or as instructions for short rules on how to test; the next ticket reads them.",
});
const docs = d.node(xd, ay, "Codebase docs", "organized by feature");
const agents = d.node(xa, ay, "Agents", "working on a ticket");
d.link(docs, agents, { both: true, label: "read, update" });

const me = d.node(xa, my, "Me, stepping in", ["knowledge they lack", "judgment corrections"], {
  kind: "human",
  focal: true,
});
d.arrow([[xa, agents.bottom + 12], [xa, my - 12]], { dashed: true, both: true, label: "stuck or wrong" });

d.region(xs - 18, ry - 44, W - xs + 6, iy - ry + 82);
d.laneLabel(xs + 14, ry - 24, "skill");
d.node(xs, ry, "Reference docs", "read only when needed");
d.node(xs, iy, "Instructions", "SKILL.md");
d.arrow([[me.end + 10, my], [xs - 10, ry]], { label: "context, steps" });
d.arrow([[xa, my + 12], [xa, iy], [xs - 10, iy]], { label: "short rule", labelAt: [(xa + xs) / 2 + 40, iy - 7] });

// the skill feeds the next ticket
d.arrow([[xs + 120, ry - 50], [xs + 120, ay], [agents.end + 10, ay]], {
  label: "next ticket reads",
  labelAt: [(agents.end + xs + 120) / 2, ay - 7],
});
d.save("scripts/figures/out/2026-09-29-e2e-skill-updates");
