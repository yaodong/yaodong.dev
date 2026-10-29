---
layout: post
title: Understanding Bridge Component Messaging in Hotwire Native
created_date: 2025-05-12T00:00:00.000Z
image: /assets/images/og/2025-05-12-hotwire-native-bridge-component-messaging.png
excerpt: "Bridge components in Hotwire Native offer no direct access to navigation, which felt inconvenient when I first built one. It turned out to be intentional. Restricting native-side navigation is how Hotwire Native keeps web and native synchronized through URLs."
---

In Hotwire Native, a Bridge Component simultaneously exists in JavaScript and native code. The interaction begins from JavaScript by calling `send(event, data, callback)`. The native side receives a structured `Message` object, processes it, and replies by calling `reply(...)`.

<figure>
<div class="fig-head"><div class="fig-title">The web asks, native replies</div><div class="fig-sub">One message through a bridge component</div></div>
<div class="fig-draw"><svg id="br" viewBox="0 0 840 226" role="img" aria-label="One bridge component message: JavaScript calls send with an event, data, and a callback; the native side receives it as a Message in onReceive, processes it, for example by showing native UI, and replies to that message; the reply comes back to the web, where the stored callback runs."><style>#br text{font-family:var(--font-body)}#br .mono{font-family:var(--font-mono)}</style>
<path d="M172.762 172 L290 172" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M286.0 175.5 L290 172 L286.0 168.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M386.37 172 L560 172" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M556.0 175.5 L560 172 L556.0 168.5" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M30 91.5 L30 160" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M26.5 156.0 L30 160 L33.5 156.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<path d="M570 160 L570 74" fill="none" stroke-width="1" stroke-linejoin="round" style="stroke:var(--color-text-muted)"/>
<path d="M573.5 78.0 L570 74 L566.5 78.0" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-text-muted)"/>
<text x="44" y="16" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">WEB</text>
<text x="44" y="148" font-size="12" font-weight="500" class="mono" letter-spacing="0.08em" style="fill:var(--color-text-secondary)">NATIVE</text>
<text x="44" y="44.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Send an event</text>
<text x="44" y="62" font-size="12.5" style="fill:var(--color-text-muted)">send(event, data, callback)</text>
<text x="44" y="79.5" font-size="12.5" style="fill:var(--color-text-muted)">gets a message ID</text>
<circle cx="30" cy="40" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="584" y="44.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Run the callback</text>
<text x="584" y="62" font-size="12.5" style="fill:var(--color-text-muted)">found by message ID</text>
<circle cx="570" cy="40" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="44" y="176.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Receive a Message</text>
<text x="44" y="194" font-size="12.5" style="fill:var(--color-text-muted)">onReceive(message:)</text>
<circle cx="30" cy="172" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="314" y="176.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Process it</text>
<text x="314" y="194" font-size="12.5" style="fill:var(--color-text-muted)">e.g. show an action sheet</text>
<circle cx="300" cy="172" r="5.5" stroke-width="2" style="fill:var(--color-text-body);stroke:var(--color-bg)"/>
<text x="584" y="176.5" font-size="14" font-weight="500" style="fill:var(--color-text)">Reply</text>
<text x="584" y="194" font-size="12.5" style="fill:var(--color-text-muted)">reply(with: message)</text>
<circle cx="570" cy="172" r="5.5" stroke-width="2" style="fill:var(--color-accent);stroke:var(--color-bg)"/>
<text x="44" y="118.25" font-size="13" style="fill:var(--color-text-secondary)">JSON message</text>
<text x="584" y="118.25" font-size="13" style="fill:var(--color-text-secondary)">reply</text>
</svg></div>
<figcaption><span>Every exchange starts with a message from JavaScript, and the native side can only reply to it.</span></figcaption>
</figure>

## Why the Bridge Component Hides Navigation

When I first built a native bridge component, I quickly noticed it offered no direct access to navigation. Initially, this felt inconvenient, but I soon understood it was intentional. By restricting native-side navigation, Hotwire Native ensures synchronization between web and native components through URLs.

This design choice encourages developers to follow a clear workflow. The web initiates each interaction by sending a named event with a concise JSON payload. The native side responds strictly by replying to that specific event or sending a clearly defined new event. Navigation is always handled via URLs and Path Configuration, preserving consistency across platforms.

If native navigation were allowed within bridge components, each platform (web, iOS, Android) would require additional synchronization logic. This would complicate scalability, break deep-linking, and eliminate the ability to deploy new features solely through web updates. Thankfully, Hotwire Native's Bridge Component prevents these issues from occurring.

When you do need native-side navigation in a bridge component, a practical workaround is to expose the shared Navigator instance from your SceneDelegate. For example, add a public accessor:

```swift
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    private let navigator = Navigator()
    func scene(_ scene: UIScene, ... ) {
        window?.rootViewController = UINavigationController(rootViewController: navigator.rootViewController)
        navigator.start()
    }

    // Expose the navigator to other parts of the app
    func currentNavigator() -> Navigator { navigator }
}
```

Then in your component:

```swift
override func onReceive(message: Message) {
    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let delegate = scene.delegate as? SceneDelegate else { return }

    let navigator = delegate.currentNavigator()
    if let data: NavigateData = message.data(),
       let url = URL(string: data.url) {
        navigator.visit(url)
        reply(to: message, name: "didNavigate")
    }
}
```

This approach gives you full access to navigation from any bridge component.

## Message Handling and Safe Concurrency

After working with bridge components for a while, I began wondering if things would be simpler if the native side could initiate messages independently, without waiting for the web. At first glance, this seemed appealing. But the more I explored the design, the clearer it became why Hotwire deliberately avoids this approach. By requiring every native response to tie back to a specific message from the web, Hotwire maintains a clear and predictable communication flow.

Each message sent via the Hotwire Native bridge includes a unique message ID and a message type, such as `"connect"` or `"click"`. When JavaScript calls `this.send("connect", {...})`, it wraps the data as JSON, assigns an auto-generated ID, and sends it to the native side through `WKScriptMessageHandler`. Swift then handles it as a structured `Message` object within `onReceive(message:)`.

This message ID is essential because it precisely identifies each interaction. When JavaScript includes a callback, Hotwire temporarily stores it using the message ID. If Swift replies using `reply(to: eventName)`, the response matches the latest event of the same name. While this works well in simple cases, it can cause issues if multiple identical events fire simultaneously.

To solve this, Hotwire provides another method, `reply(with: message)`. By explicitly referencing the original `Message` object, the native side guarantees the correct JavaScript callback receives the response. This completely avoids the common problem of identical components triggering incorrect callbacks.

This clear messaging approach ensures safe concurrent interactions. Even when multiple events fire simultaneously, responses remain accurate, isolated, and clearly tied to their originating messages. It’s a simple yet robust system that holds up under pressure.

## A Clear Messaging Contract Through a Single JSON Channel

From the web application's perspective, each bridge component behaves like a straightforward function call. You send it some data, it triggers native UI elements such as toolbar buttons, action sheets, or bottom sheets, and eventually calls your callback. The native side replies to confirm these actions have completed, allowing Turbo to continue its original flow as if the user had directly interacted with the web interface.

Importantly, the native side cannot independently initiate new messages or conversations. Every native message must be a reply to a previously sent web message, identified either explicitly by referencing the original `Message` object (`reply(with: message)`), or implicitly by using the event name (`reply(to: eventName)`). 

This constraint ensures that communication remains explicit, predictable, and easy to debug. By limiting all interactions to a single JSON channel and enforcing this clear messaging contract, Hotwire Native prevents hidden complexity and keeps interactions stable and transparent over time.

## Intentional Design Encourages Best Practices

What I appreciate most about Hotwire Native’s Bridge Component is how it gently nudges us toward good habits. Instead of letting us take shortcuts like directly controlling native navigation or creating arbitrary message types, it encourages clear communication and predictable interactions. These thoughtful constraints ultimately make our apps simpler to build, easier to debug, and more maintainable over time.
