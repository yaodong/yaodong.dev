// Figure for "How I automated my E2E testing" in 2026-09-29-rethinking-e2e-testing-with-agents.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 372];
// the first column starts at 48, not 30, so the corrections loop at x = 12
// stays clear of the vertical connectors on that column
const xs = [0, 1, 2, 3].map((i) => 48 + i * 205);
const [ay, ry, my] = [46, 150, 274];
const loopY = 356;

const d = new Figure({
  width: W, height: H, idPrefix: "wf",
  title: "Agents do the work, I check the evidence",
  subtitle: "Planning, writing, and running E2E tests for one ticket",
  caption:
    "I review the plan before any code and read the log of the final run; " +
    "what I correct goes back into the skills.",
  label:
    "How my automated E2E testing works: agents write a plan, implement the tests, and run them; " +
    "a subagent reviews the plan, and a subagent and agents on other LLMs check the run log; " +
    "I review the plan, help when a step is stuck, and read the final log, and my corrections go " +
    "back into the skills.",
});
d.laneLabel(xs[0] + 14, ay - 24, "agents");
d.laneLabel(xs[0] + 14, ry - 24, "review");
d.laneLabel(xs[0] + 14, my - 24, "me");

const [plan, impl, run] = [
  ["Plan", ["scenario, data state", "what counts as success"]],
  ["Implement", ["test cases, reused", "on each server"]],
  ["Run", ["reviewer splits steps", "tester runs them"]],
].map(([t, s], i) => d.node(xs[i], ay, t as string, s));
d.link(plan, impl);
d.link(impl, run);

const reviewPlan = d.node(xs[0], ry, "Subagent", "reviews the plan");
const check = d.node(xs[3], ry, "Cross-check", ["a subagent and agents", "on other LLMs"]);
d.arrow([[xs[0], plan.bottom + 12], [xs[0], ry - 12]]);
d.arrow([[run.end + 10, ay], [xs[3], ay], [xs[3], ry - 12]], { label: "run log" });

d.node(xs[0], my, "Review the plan", ["before any code", "happy and error paths"], { kind: "human" });
d.node(xs[2], my, "Help when stuck", ["the agent asks instead", "of inventing workarounds"], { kind: "human" });
d.node(xs[3], my, "Read the final log", ["requests, responses,", "assertions"], { kind: "human", focal: true });
// the label sits in the free span above the ME lane label
d.arrow([[xs[0], reviewPlan.bottom + 12], [xs[0], my - 12]], {
  both: true,
  label: "plan file",
  labelAt: [xs[0] + 14, (reviewPlan.bottom + 12 + my - 34) / 2 + 4.5, "start"],
});
d.arrow([[xs[2], run.bottom + 12], [xs[2], my - 12]], { dashed: true, both: true, label: "asks" });
d.arrow([[xs[3], check.bottom + 12], [xs[3], my - 12]], { label: "flagged log" });

// corrections loop back into the skills the agents plan with
d.arrow([[xs[3], my + 12], [xs[3], loopY], [12, loopY], [12, ay], [xs[0] - 10, ay]], {
  dashed: true,
  label: "corrections go back into the skills",
  labelAt: [(12 + xs[3]) / 2, loopY - 7],
});
d.save("scripts/figures/out/2026-09-29-e2e-automation-workflow");
