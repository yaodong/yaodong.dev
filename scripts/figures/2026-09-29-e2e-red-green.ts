// Figure for the red/green paragraph in "A few things that make the results easier to trust"
// (2026-09-29-rethinking-e2e-testing-with-agents.md). Shows the order of runs, not just where they happen.
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 172];
const xs = [0, 1, 2, 3].map((i) => 30 + i * 215);
const [ty, ry] = [14, 112];

const d = new Figure({
  width: W, height: H, idPrefix: "rg",
  title: "One test case, four runs",
  subtitle: "A bug-fix case, in the order its runs happen",
  caption:
    "The case has to fail on the integration branch and pass on the fix branch, since a pass alone " +
    "doesn't show it could see the bug.",
  label:
    "The order of runs for one bug-fix test case: the case states how it should fail without " +
    "the fix and what should happen with it; it fails as expected on the integration branch " +
    "before the fix, passes on the fix branch, passes again on the integration branch after " +
    "merging, and passes on the release candidate.",
});
const testCase = d.node(xs[0], ty, "The test case", ["how it fails without the fix, what happens with it"]);
const runs = [
  ["Integration", "before the fix", "fails as expected"],
  ["Fix branch", "with the fix", "passes"],
  ["Integration", "after merging", "passes"],
  ["Release candidate", "everything merged", "passes"],
].map(([t, where, result], i) => d.node(xs[i], ry, t, where, { result, focal: i === 0 }));
d.arrow([[xs[0], testCase.bottom + 12], [xs[0], ry - 12]]);
["then", "merge", "release"].forEach((label, i) => d.link(runs[i], runs[i + 1], { label }));
d.save("scripts/figures/out/2026-09-29-e2e-red-green");
