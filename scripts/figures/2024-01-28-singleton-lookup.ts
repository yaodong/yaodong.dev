// Figure for the opening of 2024-01-28-the-self-and-singleton-class-in-ruby.md, replacing the old
// PNG chart. Lays the lookup path out on one row so the singleton class reads as the first stop.
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 196];
const xs = [0, 1, 2, 3, 4].map((i) => 30 + i * 180);
const [ty, sy] = [62, 170];
const classY = 26;

const d = new Figure({
  width: W, height: H, idPrefix: "sc",
  title: "Lookup starts at the singleton class",
  subtitle: "A # marks a singleton class: #Cat is Cat's",
  caption:
    "milo's class is Cat, but a method call on milo checks #milo first, " +
    "and each class's singleton class inherits from its superclass's.",
  label:
    "Method lookup for milo, an instance of Cat: milo's singleton class #milo comes first, and its " +
    "superclass is Cat, followed by Animal and Object. Cat, Animal, and Object each have their own " +
    "singleton class, #Cat, #Animal, and #Object, and those inherit from each other in the same order.",
});
const milo = d.node(xs[0], ty, "milo", "an instance of Cat");
const single = d.node(xs[1], ty, "#milo", "checked first", { focal: true });
const [cat, animal, object] = ["Cat", "Animal", "Object"].map((t, i) => d.node(xs[i + 2], ty, t));
d.link(milo, single, { dashed: true, label: "singleton_class" });
d.link(single, cat, { label: "superclass" });
d.link(cat, animal, { label: "superclass" });
d.link(animal, object, { label: "superclass" });
// milo's class skips over its singleton class
d.arrow([[xs[0], ty - 12], [xs[0], classY], [xs[2], classY], [xs[2], ty - 12]], { label: "class" });

const singles = ["#Cat", "#Animal", "#Object"].map((t, i) => d.node(xs[i + 2], sy, t));
// dashed always means singleton_class, so only the first drop carries the label
[cat, animal, object].forEach((c, i) =>
  d.arrow([[c.x, c.bottom + 12], [c.x, sy - 12]], { dashed: true, label: i === 0 ? "singleton_class" : undefined }),
);
// center the lower labels on the ones above them, so the two rows line up
const mid = (a: { end: number }, b: { x: number }) => (a.end + b.x) / 2;
d.link(singles[0], singles[1], { label: "superclass", labelAt: [mid(cat, animal), sy - 7] });
d.link(singles[1], singles[2], { label: "superclass", labelAt: [mid(animal, object), sy - 7] });
d.save("scripts/figures/out/2024-01-28-singleton-lookup");
