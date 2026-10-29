// Figure for "The Displacement Spiral" in 2026-02-22-if-they-are-right.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 196];
const xs = [30, 310, 590];
const [ty, by] = [30, 150];

const d = new Figure({
  width: W, height: H, idPrefix: "sp",
  title: "The displacement spiral",
  subtitle: "A feedback loop with no natural brake",
  caption: "Each step is rational for a single firm, and the labor savings fund the next round of AI.",
  label:
    "The displacement spiral as a closed loop: AI improves, companies need fewer workers, " +
    "white-collar layoffs follow, displaced workers spend less, margin pressure pushes firms " +
    "to invest the labor savings in AI, and AI improves again.",
});
const top = [
  ["AI improves", "capabilities grow"],
  ["Fewer workers needed", "same output"],
  ["Layoffs", "white-collar roles"],
].map(([t, s], i) => d.node(xs[i], ty, t, s));
const spend = d.node(xs[2], by, "Spend less", "displaced workers", { kind: "human" });
const margin = d.node(xs[1], by, "Margin pressure", "consumer demand falls");
const invest = d.node(xs[0], by, "Invest more in AI", "or fall behind rivals");
d.link(top[0], top[1]);
d.link(top[1], top[2]);
d.arrow([[xs[2], top[2].bottom + 12], [xs[2], by - 12]], { label: "lost income" });
d.link(spend, margin);
d.link(margin, invest);
d.arrow([[xs[0], by - 12], [xs[0], top[0].bottom + 12]], { label: "labor savings" });
d.save("scripts/figures/out/2026-02-22-displacement-spiral");
