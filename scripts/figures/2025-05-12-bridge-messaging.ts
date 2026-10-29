// Figure for the opening of 2025-05-12-hotwire-native-bridge-component-messaging.md, replacing the old
// PNG cycle. Puts web and native on separate rows so it's clear the web starts every exchange.
import { Figure } from "../../.claude/skills/blog-illustration/scripts/diagram";

const [W, H] = [840, 226];
const xs = [0, 1, 2].map((i) => 30 + i * 270);
const [wy, ny] = [40, 172];

const d = new Figure({
  width: W, height: H, idPrefix: "br",
  title: "The web asks, native replies",
  subtitle: "One message through a bridge component",
  caption:
    "Every exchange starts with a message from JavaScript, and the native side can only reply to it.",
  label:
    "One bridge component message: JavaScript calls send with an event, data, and a callback; the " +
    "native side receives it as a Message in onReceive, processes it, for example by showing native " +
    "UI, and replies to that message; the reply comes back to the web, where the stored callback runs.",
});
d.laneLabel(xs[0] + 14, wy - 24, "web");
d.laneLabel(xs[0] + 14, ny - 24, "native");

const send = d.node(xs[0], wy, "Send an event", ["send(event, data, callback)", "gets a message ID"]);
const callback = d.node(xs[2], wy, "Run the callback", "found by message ID");
const receive = d.node(xs[0], ny, "Receive a Message", "onReceive(message:)");
const process = d.node(xs[1], ny, "Process it", "e.g. show an action sheet");
const reply = d.node(xs[2], ny, "Reply", "reply(with: message)", { focal: true });
d.link(receive, process);
d.link(process, reply);
// both labels sit in the free span above the NATIVE lane label, on one line
const labelY = (send.bottom + 12 + ny - 36) / 2 + 4.5;
d.arrow([[xs[0], send.bottom + 12], [xs[0], ny - 12]], {
  label: "JSON message",
  labelAt: [xs[0] + 14, labelY, "start"],
});
d.arrow([[xs[2], ny - 12], [xs[2], callback.bottom + 12]], { label: "reply", labelAt: [xs[2] + 14, labelY, "start"] });
d.save("scripts/figures/out/2025-05-12-bridge-messaging");
