// Figure for "Why we used to write so few E2E tests" in 2026-09-29-rethinking-e2e-testing-with-agents.md
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 228];
const xs = [30, 310, 590];
const [ey, my] = [46, 150];

const d = new Figure({
  width: W, height: H, idPrefix: "ms",
  title: "The same testing, three times",
  subtitle: "How each change was tested before automation",
  caption:
    "Every environment needed its data set up and its steps checked by hand, and turning that " +
    "into tests often took longer than the testing itself.",
  label:
    "Before automation, every change was tested by hand three times: on the feature branch server, " +
    "again on the integration branch after merging, and again on the release-candidate server, " +
    "with data set up and results checked at each stage.",
});
d.laneLabel(xs[0] + 14, ey - 24, "environments");
d.laneLabel(xs[0] + 14, my - 24, "me, by hand");
const envs = [
  ["Feature branch", "one server per ticket"],
  ["Integration branch", "everyone's changes"],
  ["Release candidate", "read-only database"],
].map(([t, s], i) => d.node(xs[i], ey, t, s));
d.link(envs[0], envs[1], { label: "merge" });
d.link(envs[1], envs[2], { label: "release" });
const manual: [string, string[]][] = [
  ["Prepare and test", ["work out what to test", "build fixtures, seed data", "run the steps, check"]],
  ["Test again", ["set up the data again", "run the steps, check"]],
  ["Test again", ["set up state via the API", "run the steps, check"]],
];
manual.forEach(([t, lines], i) => {
  d.node(xs[i], my, t, lines, { kind: "human" });
  d.arrow([[xs[i], envs[i].bottom + 12], [xs[i], my - 12]]);
});
d.save("scripts/figures/out/2026-09-29-e2e-manual-stages");
